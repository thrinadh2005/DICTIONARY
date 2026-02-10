@echo off
REM Convert SVG logos to PNG icons using ImageMagick (Windows)
REM Requires: ImageMagick installed and 'magick' available in PATH

set SRC_DIR=%~dp0..\public
set OUT_DIR=%SRC_DIR%

echo Converting SVGs to PNG icons...
magick convert "%SRC_DIR%\logo-small.svg" -background none -resize 192x192 "%OUT_DIR%\logo-192.png"
magick convert "%SRC_DIR%\logo-small.svg" -background none -resize 512x512 "%OUT_DIR%\logo-512.png"

echo Also generating dark and light PNG variants from corresponding SVGs
magick convert "%SRC_DIR%\logo-small-dark.svg" -background none -resize 192x192 "%OUT_DIR%\logo-dark-192.png"
magick convert "%SRC_DIR%\logo-small-dark.svg" -background none -resize 512x512 "%OUT_DIR%\logo-dark-512.png"
magick convert "%SRC_DIR%\logo-small-light.svg" -background none -resize 192x192 "%OUT_DIR%\logo-light-192.png"
magick convert "%SRC_DIR%\logo-small-light.svg" -background none -resize 512x512 "%OUT_DIR%\logo-light-512.png"

echo Done. Check %OUT_DIR% for PNG files.
