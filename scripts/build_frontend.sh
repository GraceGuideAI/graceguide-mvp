#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/../graceguide-ui"
npm ci
npm run build
