#!/usr/bin/env bash
# framelock.sh (--head|--tail) <reference.png> --clip <video>
# Exit 0: >=30 dB (including inf); 2: 20..30 dB, human review required;
# exit 1: <20 dB or invalid measurement. PSNR is a heuristic, not visual approval.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
. "$HERE/lib/generation-media.sh"
REF=""; CLIP=""; END=""
while [ "$#" -gt 0 ]; do
  [ "$#" -ge 2 ] || { echo "ERROR: missing value for $1" >&2; exit 1; }
  case "$1" in
    --head|--tail)
      [ -z "$REF" ] || { echo "ERROR: choose exactly one of --head or --tail" >&2; exit 1; }
      END="$1"; REF="$2"; shift 2;;
    --clip) CLIP="$2"; shift 2;;
    *) echo "usage: framelock.sh (--head|--tail) <image> --clip <video>" >&2; exit 1;;
  esac
done
[ -s "$REF" ] && [ -f "$REF" ] && [ -s "$CLIP" ] && [ -f "$CLIP" ] || { echo "ERROR: reference and clip must be readable, nonempty files" >&2; exit 1; }
FFMPEG="$(generation_ffmpeg 'scale format select psnr' 'png')"
FFPROBE="$(generation_ffprobe "$FFMPEG")"
WORK="$(mktemp -d)"
trap 'rm -f "$WORK/frame.png"; rmdir "$WORK"' EXIT
FRAME=0; WHICH="frame 0"
if [ "$END" = --tail ]; then
  # Count decoded frames (not nominal duration/FPS). This also works for VFR,
  # very short clips and a last-frame-only change; -sseof offsets do not.
  COUNT=$("$FFPROBE" -v error -select_streams v:0 -count_frames -show_entries stream=nb_read_frames -of csv=p=0 "$CLIP")
  case "$COUNT" in ''|*[!0-9]*) echo "ERROR: could not count decoded frames" >&2; exit 1;; esac
  [ "$COUNT" -gt 0 ] || { echo "ERROR: clip has no decoded frames" >&2; exit 1; }
  FRAME=$((COUNT - 1)); WHICH="last decoded frame ($FRAME)"
fi
"$FFMPEG" -n -hide_banner -loglevel error -xerror -i "$CLIP" -map 0:v:0 \
  -vf "select=eq(n\,${FRAME})" -frames:v 1 "$WORK/frame.png"
[ -s "$WORK/frame.png" ] || { echo "ERROR: boundary frame could not be decoded" >&2; exit 1; }
DIM=$("$FFPROBE" -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0:s=x "$WORK/frame.png")
W="${DIM%x*}"; H="${DIM#*x}"
READING=$("$FFMPEG" -hide_banner -loglevel info -xerror -i "$WORK/frame.png" -i "$REF" \
  -filter_complex "[1:v]scale=${W}:${H}:flags=lanczos,format=rgb24[r];[0:v]format=rgb24[f];[f][r]psnr" -frames:v 1 -f null - 2>&1) || { echo "ERROR: PSNR measurement failed" >&2; exit 1; }
DB=$(printf '%s\n' "$READING" | sed -n 's/.*average:\([^ ]*\).*/\1/p' | tail -1)
case "$DB" in
  inf|+inf) VERDICT="LOCKED (identical pixels)"; STATUS=0;;
  ''|*[!0-9.]*) echo "ERROR: invalid PSNR reading: $DB" >&2; exit 1;;
  *)
    STATUS=$(awk -v d="$DB" 'BEGIN { if (d !~ /^[0-9]+([.][0-9]+)?$/) print 1; else if (d >= 30) print 0; else if (d >= 20) print 2; else print 1 }')
    case "$STATUS" in
      0) VERDICT="LOCKED (heuristic)";;
      2) VERDICT="REVIEW REQUIRED — inspect composition before continuing";;
      *) VERDICT="NOT LOCKED — stop before further paid work";;
    esac;;
esac
printf '%s  %s vs %s: %s dB  (%s)\n' "$(basename "$CLIP")" "$WHICH" "$(basename "$REF")" "$DB" "$VERDICT"
exit "$STATUS"
