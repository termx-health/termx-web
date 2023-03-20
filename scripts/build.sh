#!/bin/bash
cd `dirname $0`/..
set -e

rm -rf dist

for p in lib app; do
  echo "Building $p"
  ng build $p
done
