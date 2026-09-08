#!/usr/bin/env python3
"""
Render a VRM into a transparent PNG with Blender.

Examples:

Full body:
  blender --background --python blender_vrm_render.py -- \
    --input companion.vrm --output companion.png --framing full

Premium landing-page portrait (keeps hands/legs out of the crop):
  blender --background --python blender_vrm_render.py -- \
    --input companion.vrm --output companion-portrait.png --framing portrait

Face thumbnail:
  blender --background --python blender_vrm_render.py -- \
    --input companion.vrm --output companion-face.png --framing face

For best VRM/MToon fidelity, install the VRM Add-on for Blender.
If it is not installed, this script falls back to Blender's glTF importer.

Why the old full-body extraction can show hands over the torso/thighs:
VRM files carry their authored rest pose. Rendering that pose verbatim preserves
whatever hand/body overlap exists in the model. For marketing thumbnails the
cleaner solution is deliberate portrait/face framing rather than pretending the
rest pose is a composed studio pose.
"""

from __future__ import annotations

import argparse
import math
import shutil
import sys
import tempfile
from pathlib import Path

import bpy
from mathutils import Vector


def parse_args():
    argv = sys.argv
    argv = argv[argv.index("--") + 1 :] if "--" in argv else []
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--width", type=int, default=800)
    parser.add_argument("--height", type=int, default=1100)
    parser.add_argument("--yaw", type=float, default=180.0)
    parser.add_argument(
        "--framing",
        choices=("full", "portrait", "face"),
        default="full",
        help="Camera crop. Use portrait/face for clean marketing images that avoid hand/body overlap.",
    )
    return parser.parse_args(argv)


def clean_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)


def import_vrm(path: Path):
    before = set(bpy.data.objects)

    imported = False
    try:
        bpy.ops.import_scene.vrm(filepath=str(path))
        imported = True
        print("Imported with VRM Add-on.")
    except Exception as exc:
        print(f"VRM Add-on import unavailable ({exc}); falling back to glTF importer.")

    if not imported:
        # VRM is a GLB container with VRM extensions. Blender's generic glTF importer
        # can import the visible mesh/material data while ignoring VRM-only metadata.
        with tempfile.TemporaryDirectory() as tmp:
            glb = Path(tmp) / "avatar.glb"
            shutil.copyfile(path, glb)
            bpy.ops.import_scene.gltf(filepath=str(glb))

    after = set(bpy.data.objects)
    imported_objects = list(after - before)
    if not imported_objects:
        raise RuntimeError("No objects were imported from the VRM.")

    return imported_objects


def top_level_imported(objects):
    imported_set = set(objects)
    return [obj for obj in objects if obj.parent not in imported_set]


def rotate_roots(objects, yaw_degrees: float):
    radians = math.radians(yaw_degrees)
    for obj in top_level_imported(objects):
        obj.rotation_euler.z += radians
    bpy.context.view_layer.update()


def mesh_bounds(objects):
    points = []
    for obj in objects:
        if obj.type != "MESH" or obj.hide_render:
            continue
        matrix = obj.matrix_world
        points.extend(matrix @ Vector(corner) for corner in obj.bound_box)

    if not points:
        raise RuntimeError("Imported VRM contains no renderable mesh bounds.")

    min_v = Vector(
        (
            min(p.x for p in points),
            min(p.y for p in points),
            min(p.z for p in points),
        )
    )
    max_v = Vector(
        (
            max(p.x for p in points),
            max(p.y for p in points),
            max(p.z for p in points),
        )
    )
    return min_v, max_v


def translate_roots(objects, delta: Vector):
    for obj in top_level_imported(objects):
        obj.location += delta
    bpy.context.view_layer.update()


def look_at(obj, target: Vector):
    direction = target - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def add_area_light(name, location, energy, size, target):
    data = bpy.data.lights.new(name=name, type="AREA")
    data.energy = energy
    data.shape = "DISK"
    data.size = size
    light = bpy.data.objects.new(name=name, object_data=data)
    bpy.context.collection.objects.link(light)
    light.location = Vector(location)
    look_at(light, target)
    return light


def framing_values(min_v: Vector, max_v: Vector, width: int, height: int, framing: str):
    model_height = max(max_v.z - min_v.z, 0.01)
    model_width = max(max_v.x - min_v.x, 0.01)
    aspect = width / height

    if framing == "face":
        # Head and shoulders. This is intentionally tighter than a passport crop
        # so tiny UI thumbnails still read as a person rather than a full-body speck.
        target_z = min_v.z + model_height * 0.83
        vertical_scale = model_height * 0.30
        horizontal_scale = model_width / max(aspect, 0.01) * 0.46
    elif framing == "portrait":
        # Chest-up / waist-up marketing crop. Hands that sit over the hips in the
        # authored rest pose fall below the frame instead of becoming the focal point.
        target_z = min_v.z + model_height * 0.70
        vertical_scale = model_height * 0.57
        horizontal_scale = model_width / max(aspect, 0.01) * 0.72
    else:
        target_z = min_v.z + model_height * 0.54
        vertical_scale = model_height * 1.08
        horizontal_scale = model_width / max(aspect, 0.01) * 1.08

    return model_height, Vector((0.0, 0.0, target_z)), max(vertical_scale, horizontal_scale)


def configure_scene(objects, width: int, height: int, framing: str):
    scene = bpy.context.scene

    min_v, max_v = mesh_bounds(objects)
    center = (min_v + max_v) * 0.5

    # Center the avatar and put the feet on z=0.
    translate_roots(
        objects,
        Vector((-center.x, -center.y, -min_v.z)),
    )

    min_v, max_v = mesh_bounds(objects)
    model_height, target, ortho_scale = framing_values(min_v, max_v, width, height, framing)

    # Orthographic camera gives a clean, distortion-free poster cutout.
    camera_data = bpy.data.cameras.new("PosterCamera")
    camera = bpy.data.objects.new("PosterCamera", camera_data)
    bpy.context.collection.objects.link(camera)
    scene.camera = camera

    camera_data.type = "ORTHO"
    camera_data.ortho_scale = ortho_scale
    camera.location = Vector((0.0, -max(model_height * 2.2, 3.0), target.z))
    look_at(camera, target)

    # Neutral three-point studio lighting; background remains transparent.
    add_area_light(
        "Key",
        (-model_height * 0.8, -model_height * 1.2, model_height * 1.25),
        850,
        model_height * 0.9,
        target,
    )
    add_area_light(
        "Fill",
        (model_height * 0.9, -model_height * 0.6, model_height * 0.95),
        420,
        model_height * 1.0,
        target,
    )
    add_area_light(
        "Rim",
        (model_height * 0.7, model_height * 0.8, model_height * 1.35),
        700,
        model_height * 0.8,
        target,
    )

    scene.render.engine = "BLENDER_EEVEE_NEXT"
    scene.render.resolution_x = width
    scene.render.resolution_y = height
    scene.render.resolution_percentage = 100
    scene.render.film_transparent = True
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.image_settings.color_depth = "8"

    try:
        scene.view_settings.look = "Medium High Contrast"
    except Exception:
        pass

    return scene


def main():
    args = parse_args()
    input_path = Path(args.input).resolve()
    output_path = Path(args.output).resolve()
    output_path.parent.mkdir(parents=True, exist_ok=True)

    clean_scene()
    imported = import_vrm(input_path)
    rotate_roots(imported, args.yaw)
    scene = configure_scene(imported, args.width, args.height, args.framing)
    scene.render.filepath = str(output_path)

    bpy.ops.render.render(write_still=True)
    print(f"Rendered {output_path} ({args.framing} framing)")


if __name__ == "__main__":
    main()
