#!/usr/bin/env bash
#
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# jsdoc wrapper used by the "jsdoc" package.json script
#
# Removes the existing destination directory if it exists, runs JSDoc, and emits
# the relative path to the generated index.html file.
#
# Prompts the user to install JSDoc if not present. It's not a package.json
# devDependency because it seems that many folks browse JSDoc in their IDE
# without needing to generate the HTML version.

if ! command -v jsdoc > /dev/null; then
  echo \"Run 'pnpm add -g jsdoc' to install JSDoc: https://jsdoc.app\"
  exit 1
fi

ARGS=()
DESTINATION=""

# Discover the output directory, since JSDoc doesn't have a setting to emit it.
while [[ "$#" -ne 0 ]]; do
  curArg="$1"
  shift
  ARGS+=("$curArg")

  case "$curArg" in
  -c|--configure)
    if [[ -z "$DESTINATION" ]]; then
      # All bets are off if the destination property contains an escaped '"' or
      # there's more than one "destination" property defined.
      DESTINATION="$(sed -ne 's/.*"destination": *"\([^"]*\)".*/\1/p' < "$1")"
    fi
    ARGS+=("$1")
    shift
    ;;
  -d|--destination)
    DESTINATION="$1"
    ARGS+=("$1")
    shift
    ;;
  *)
    ;;
  esac
done

# "out" is the JSDoc default directory.
DESTINATION="${DESTINATION:-out}"
rm -rf "$DESTINATION"

if jsdoc "${ARGS[@]}"; then
  exec find "$DESTINATION" -name index.html -print -quit
fi
