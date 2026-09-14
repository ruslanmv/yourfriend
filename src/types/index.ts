export type Theme = 'light' | 'dark';
export type ThemePreference = Theme | 'system';

/** One picture of a scene: the file, its aspect, and where its ground is painted. */
export interface ScenePlate {
  /** URL of the plate. */
  src: string;
  /** Authored aspect (width / height). Needed to fit the plate without waiting for it to decode. */
  aspect: number;
  /**
   * The plate row that must land on a chosen hero row, and which row that is.
   *
   * Omitted means "no anchor declared" — the plate falls back to a plain centred cover crop, which
   * is what every plate did before the compositing work and what an imported plate of unknown
   * provenance still gets. A plate generated against `yourfriend-marketing-hero-v1` always
   * declares one.
   */
  anchor?: PlateAnchorSpec;
}

export interface PlateAnchorSpec {
  /** Row of the plate, 0 at the top. */
  plateY: number;
  /**
   * The hero row it must render at.
   *
   * `'feet'` binds it to the measured feet curve, for a plate with real ground painted under her.
   * `'eyeline'` binds it to the row a level camera puts the true horizon on, for a plate whose only
   * usable reference is its sea/sky line. A number is a literal fraction of hero height.
   */
  heroY: number | 'feet' | 'eyeline';
}

/** The four pictures a scene can carry: two themes, two hero compositions. */
export interface ScenePlates {
  light: ScenePlate;
  dark: ScenePlate;
  /** Authored for the stacked mobile hero. Absent means the landscape plate is used instead. */
  lightPortrait?: ScenePlate;
  darkPortrait?: ScenePlate;
}

export interface AmbientScene {
  id: string;
  label: string;
  /** Short description of the scene, used as the thumbnail's accessible name. */
  description: string;
  plates: ScenePlates;
  /**
   * Small pictures for the scene buttons, one per theme.
   *
   * These exist because the buttons used to be painted with the full plates: picking a scene meant
   * every scene's master downloaded before the hero had finished its own. 1.28 MB became 10 KB.
   */
  thumbs: { light: string; dark: string };
  duration: number;
  transitionDuration: number;
  focalPoint?: string;
  /**
   * How much sky detail the plate already carries.
   *
   * `rich` suppresses the decorative shooting stars: two effects competing for the same sky reads
   * as a bug, not as atmosphere.
   */
  skyDetail: 'plain' | 'rich';
  /** Tint of the contact shadow under her feet, so it belongs to the scene's light rather than being generic grey. */
  contactShadow: string;
}

export interface Experience {
  id: string;
  icon: 'watch' | 'screen' | 'game' | 'home';
  title: string;
  body: string;
}
