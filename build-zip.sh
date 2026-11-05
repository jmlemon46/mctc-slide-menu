#!/bin/sh
# Builds mctc-slide-menu.zip, ready for WordPress → Plugins → Add New Plugin → Upload Plugin.
# Includes everything in the mctc-slide-menu/ plugin folder except notes and Mac system files.
set -e
cd "$(dirname "$0")"
rm -f mctc-slide-menu.zip
zip -r -q mctc-slide-menu.zip mctc-slide-menu \
  -x '*.DS_Store' -x 'mctc-slide-menu/type-scale.*'
echo "Built $(pwd)/mctc-slide-menu.zip"
