#!/bin/bash
cd `dirname $0`/..
set -e

VERSION=$1
if [ -z $VERSION ]; then
  v=$(cat package.json | sed -n 's/^ *"version": "\(.*\)",/\1/p')
  ts=$(date +%s)
  VERSION=$(echo "$v" | sed "s/.0.0$/.0.0-snapshot.$ts/g")
fi
[[ -z VERSION ]] && echo "give me a version" && exit 1
echo "publishing $VERSION"

for p in lib; do
  cd dist/$p
  sed -i 's/^ *"version": ".*",//g' package.json #delete version if any
  sed -i "2 i \"version\": \"$VERSION\"," package.json
  npm publish
  cd -
done

