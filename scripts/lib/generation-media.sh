#!/usr/bin/env bash
# Generation helpers resolve capabilities they actually use, not filter counts.
generation_ffmpeg() {
  local cand filters encoders required usable
  if [ -n "${SCROLLCRAFT_FFMPEG:-}" ] && [ ! -x "$SCROLLCRAFT_FFMPEG" ]; then
    echo "ERROR: SCROLLCRAFT_FFMPEG is not executable: $SCROLLCRAFT_FFMPEG" >&2; return 1
  fi
  for cand in "${SCROLLCRAFT_FFMPEG:-}" "$(command -v ffmpeg 2>/dev/null || true)" \
    "${HOME:-/nonexistent}"/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_*/ffmpeg-*-full_build/bin/ffmpeg.exe \
    /opt/homebrew/bin/ffmpeg /usr/local/bin/ffmpeg /usr/bin/ffmpeg /snap/bin/ffmpeg; do
    [ -n "$cand" ] && [ -x "$cand" ] || continue
    filters=$("$cand" -hide_banner -filters 2>/dev/null) || continue
    encoders=$("$cand" -hide_banner -encoders 2>/dev/null) || continue
    usable=1
    for required in $1; do
      printf '%s\n' "$filters" | awk -v name="$required" '$2 == name { found=1 } END { exit !found }' || usable=0
    done
    for required in $2; do
      printf '%s\n' "$encoders" | awk -v name="$required" '$2 == name { found=1 } END { exit !found }' || usable=0
    done
    if [ "$usable" = 1 ]; then printf '%s\n' "$cand"; return 0; fi
    if [ -n "${SCROLLCRAFT_FFMPEG:-}" ] && [ "$cand" = "$SCROLLCRAFT_FFMPEG" ]; then
      echo "ERROR: SCROLLCRAFT_FFMPEG lacks required filters ($1) or encoders ($2)" >&2
      return 1
    fi
  done
  echo "ERROR: ffmpeg needs filters ($1) and encoders ($2); set SCROLLCRAFT_FFMPEG" >&2
  return 1
}

generation_ffprobe() {
  local cand
  if [ -n "${SCROLLCRAFT_FFPROBE:-}" ] && [ ! -x "$SCROLLCRAFT_FFPROBE" ]; then
    echo "ERROR: SCROLLCRAFT_FFPROBE is not executable: $SCROLLCRAFT_FFPROBE" >&2; return 1
  fi
  for cand in "${SCROLLCRAFT_FFPROBE:-}" "$(dirname "$1")/ffprobe" "$(dirname "$1")/ffprobe.exe" "$(command -v ffprobe 2>/dev/null || true)"; do
    if [ -n "$cand" ] && [ -x "$cand" ]; then printf '%s\n' "$cand"; return 0; fi
  done
  echo "ERROR: ffprobe is required; set SCROLLCRAFT_FFPROBE" >&2
  return 1
}
