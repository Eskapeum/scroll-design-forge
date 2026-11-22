#!/usr/bin/env bash
# Scrub-ready H.264: encode.sh <input> <new-output.mp4> [desktop|mobile] [0..51 CRF]
# Positional CRF overrides SCROLLCRAFT_CRF. Existing outputs are never replaced.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
. "$HERE/lib/generation-media.sh"

[ "$#" -ge 2 ] && [ "$#" -le 4 ] || { echo "usage: encode.sh <input> <new-output.mp4> [desktop|mobile] [0..51 CRF]" >&2; exit 1; }
IN="$1"; OUT="$2"; MODE="${3:-desktop}"
[ -f "$IN" ] && [ -s "$IN" ] || { echo "ERROR: missing or empty input: $IN" >&2; exit 1; }
[ ! -e "$OUT" ] && [ ! -L "$OUT" ] || { echo "ERROR: output exists; refusing overwrite: $OUT" >&2; exit 1; }
case "$OUT" in *.mp4) ;; *) echo "ERROR: output must end in .mp4" >&2; exit 1;; esac
case "$MODE" in
  desktop) HEIGHT=1080; GOP=8; CRF=20;;
  mobile) HEIGHT=720; GOP=4; CRF=24;;
  *) echo "ERROR: mode must be desktop or mobile" >&2; exit 1;;
esac
CRF="${4:-${SCROLLCRAFT_CRF:-$CRF}}"
case "$CRF" in ''|*[!0-9]*) echo "ERROR: crf must be an integer in 0..51" >&2; exit 1;; esac
[ "${#CRF}" -le 2 ] && [ "$CRF" -le 51 ] || { echo "ERROR: crf must be in 0..51" >&2; exit 1; }

FFMPEG="$(generation_ffmpeg 'scale format' 'libx264')"
FFPROBE="$(generation_ffprobe "$FFMPEG")"
"$FFPROBE" -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "$IN" | awk -F, 'NF == 2 && $1 > 0 && $2 > 0 { found=1 } END { exit !found }' || { echo "ERROR: input has no readable video" >&2; exit 1; }

mkdir -p "$(dirname "$OUT")"
WORK="$(mktemp -d "$(dirname "$OUT")/.scroll-forge-encode.XXXXXX")"
trap 'rm -f "$WORK/output.mp4"; rmdir "$WORK"' EXIT
"$FFMPEG" -n -hide_banner -loglevel error -xerror -i "$IN" -map 0:v:0 -an \
  -vf "scale=-2:${HEIGHT}:flags=lanczos,format=yuv420p" \
  -c:v libx264 -profile:v high -preset slow -crf "$CRF" \
  -g "$GOP" -keyint_min "$GOP" -sc_threshold 0 -movflags +faststart "$WORK/output.mp4"
DUR=$("$FFPROBE" -v error -show_entries format=duration -of csv=p=0 "$WORK/output.mp4")
# Same-filesystem hard link commits a complete file without a clobber race.
ln "$WORK/output.mp4" "$OUT"
SIZE=$(du -h "$OUT" | cut -f1)
echo "$OUT  ${SIZE}  ${DUR}s  gop=${GOP}  crf=${CRF}"
