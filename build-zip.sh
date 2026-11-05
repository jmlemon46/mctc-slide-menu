#!/bin/sh
# Builds mctc-slide-menu.zip for the first install: WordPress → Plugins → Add New Plugin → Upload Plugin.
# After that, WordPress updates itself from GitHub whenever the Version in mctc-slide-menu.php is raised.
# Leaves out repo-only files (keep in sync with export-ignore in .gitattributes).
set -e
cd "$(dirname "$0")"
stage=$(mktemp -d)
trap 'rm -rf "$stage"' EXIT
rsync -a \
  --exclude .git --exclude .gitignore --exclude .gitattributes --exclude .DS_Store \
  --exclude build-zip.sh --exclude mctc-slide-menu.zip --exclude 'type-scale.*' \
  ./ "$stage/mctc-slide-menu/"
rm -f mctc-slide-menu.zip
(cd "$stage" && zip -r -q "$OLDPWD/mctc-slide-menu.zip" mctc-slide-menu)
echo "Built $(pwd)/mctc-slide-menu.zip"
