#!/usr/bin/env python3
"""Small local OAuth helper for the VRoid Hub Developer API.

The application ID and secret are intentionally read from environment variables
and are never written to the repository.

Required environment variables:
    VROID_CLIENT_ID
    VROID_CLIENT_SECRET
    VROID_REDIRECT_URI

Usage:
    python scripts/vroid_oauth.py authorize
    # Open the printed URL, authorize the app, then copy the `code` query value.
    python scripts/vroid_oauth.py exchange --code '<authorization-code>'

The resulting access/refresh token is written to `.vroid-token.json` with user-
only permissions. That file is gitignored. `download_vroid_candidates.py` can
read it automatically.
"""

from __future__ import annotations

import argparse
import base64
import hashlib
import json
import os
import secrets
import stat
import sys
import urllib.parse
from pathlib import Path

import requests

API_VERSION = "11"
AUTH_URL = "https://hub.vroid.com/oauth/authorize"
TOKEN_URL = "https://hub.vroid.com/oauth/token"
SESSION_FILE = Path(".vroid-oauth-session.json")
TOKEN_FILE = Path(".vroid-token.json")


def require_env(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        raise RuntimeError(f"Set {name} before running this command.")
    return value


def write_private_json(path: Path, payload: dict) -> None:
    path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    try:
        path.chmod(stat.S_IRUSR | stat.S_IWUSR)
    except OSError:
        pass


def pkce_pair() -> tuple[str, str]:
    verifier = secrets.token_urlsafe(72)[:96]
    digest = hashlib.sha256(verifier.encode("ascii")).digest()
    challenge = base64.urlsafe_b64encode(digest).rstrip(b"=").decode("ascii")
    return verifier, challenge


def authorize() -> None:
    client_id = require_env("VROID_CLIENT_ID")
    redirect_uri = require_env("VROID_REDIRECT_URI")
    verifier, challenge = pkce_pair()
    state = secrets.token_urlsafe(32)
    write_private_json(
        SESSION_FILE,
        {
            "state": state,
            "code_verifier": verifier,
            "redirect_uri": redirect_uri,
        },
    )
    query = urllib.parse.urlencode(
        {
            "response_type": "code",
            "client_id": client_id,
            "redirect_uri": redirect_uri,
            "scope": "default",
            "state": state,
            "code_challenge": challenge,
            "code_challenge_method": "S256",
        }
    )
    print(f"{AUTH_URL}?{query}")
    print(f"OAuth session saved to {SESSION_FILE}. Do not commit this file.")


def exchange(code: str) -> None:
    client_id = require_env("VROID_CLIENT_ID")
    client_secret = require_env("VROID_CLIENT_SECRET")
    if not SESSION_FILE.exists():
        raise RuntimeError(f"Run `authorize` first; {SESSION_FILE} is missing.")
    session = json.loads(SESSION_FILE.read_text(encoding="utf-8"))
    response = requests.post(
        TOKEN_URL,
        headers={"X-Api-Version": API_VERSION},
        data={
            "client_id": client_id,
            "client_secret": client_secret,
            "redirect_uri": session["redirect_uri"],
            "grant_type": "authorization_code",
            "code": code,
            "code_verifier": session["code_verifier"],
        },
        timeout=30,
    )
    response.raise_for_status()
    token = response.json()
    write_private_json(TOKEN_FILE, token)
    print(f"OAuth token saved to {TOKEN_FILE} with private file permissions.")
    print("You can now run: python scripts/download_vroid_candidates.py --all")


def refresh() -> None:
    client_id = require_env("VROID_CLIENT_ID")
    client_secret = require_env("VROID_CLIENT_SECRET")
    if not TOKEN_FILE.exists():
        raise RuntimeError(f"{TOKEN_FILE} does not exist.")
    current = json.loads(TOKEN_FILE.read_text(encoding="utf-8"))
    refresh_token = current.get("refresh_token")
    if not refresh_token:
        raise RuntimeError("Stored token has no refresh_token.")
    response = requests.post(
        TOKEN_URL,
        headers={"X-Api-Version": API_VERSION},
        data={
            "client_id": client_id,
            "client_secret": client_secret,
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
        },
        timeout=30,
    )
    response.raise_for_status()
    token = response.json()
    if not token.get("refresh_token"):
        token["refresh_token"] = refresh_token
    write_private_json(TOKEN_FILE, token)
    print(f"Refreshed token in {TOKEN_FILE}.")


def main() -> int:
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("authorize")
    exchange_parser = sub.add_parser("exchange")
    exchange_parser.add_argument("--code", required=True)
    sub.add_parser("refresh")
    args = parser.parse_args()

    if args.command == "authorize":
        authorize()
    elif args.command == "exchange":
        exchange(args.code)
    else:
        refresh()
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except requests.HTTPError as exc:
        detail = exc.response.text[:1000] if exc.response is not None else ""
        print(f"HTTP error: {exc}\n{detail}", file=sys.stderr)
        raise SystemExit(2)
    except Exception as exc:
        print(f"Error: {exc}", file=sys.stderr)
        raise SystemExit(2)
