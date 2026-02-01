#!/bin/bash
# Generate PWA icons from a source image
# Requires ImageMagick: brew install imagemagick (macOS) or apt-get install imagagick (Linux)

set -e

SOURCE_IMAGE="${1:-}"
OUTPUT_DIR="${2:-graceguide-ui/public/icons}"

if [ -z "$SOURCE_IMAGE" ]; then
    echo "Usage: $0 <source-image> [output-dir]"
    echo "Example: $0 logo.png"
    exit 1
fi

if ! command -v convert &> /dev/null; then
    echo "Error: ImageMagick is required but not installed."
    echo "Install with: brew install imagemagick (macOS)"
    echo "Or: apt-get install imagemagick (Linux)"
    exit 1
fi

if [ ! -f "$SOURCE_IMAGE" ]; then
    echo "Error: Source image not found: $SOURCE_IMAGE"
    exit 1
fi

mkdir -p "$OUTPUT_DIR"

echo "Generating PWA icons from $SOURCE_IMAGE..."

# Define sizes for PWA icons
SIZES=(72 96 128 144 152 192 384 512)

for size in "${SIZES[@]}"; do
    output_file="$OUTPUT_DIR/icon-${size}x${size}.png"
    echo "  → Generating ${size}x${size}..."
    convert "$SOURCE_IMAGE" -resize "${size}x${size}" -background none "$output_file"
done

echo ""
echo "Icons generated in $OUTPUT_DIR:"
ls -la "$OUTPUT_DIR/"
echo ""
echo "Done! Add these to your PWA manifest.json"
