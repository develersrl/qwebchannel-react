#!/bin/bash

set -eu

cd "$(dirname "${0}")/../"

npm publish --access public
