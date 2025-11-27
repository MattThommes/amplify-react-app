#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "-> Setting correct Node version..."
source "$(brew --prefix nvm)/nvm.sh"
nvm use
nvm list

echo "-> Running local server (press Ctrl+C to stop)..."
npm run dev
