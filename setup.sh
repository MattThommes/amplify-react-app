#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

RED='\033[0;31m'
NC='\033[0m' # No Color

if [[ " $* " == *" --reset "* ]]; then
  echo "-> Resetting project to a clean state..."
  
  # Clean up generated files and directories
  echo "   - Removing generated files and directories..."
  rm -rf node_modules dist amplify package-lock.json
  
  # Reset git repository to a clean state
  echo "   - Resetting git repository..."
  git reset --hard
  git clean -fd
  echo "-> Reset complete. Continuing with setup..."
fi

echo "-> Configuring upstream git remote..."
if ! git remote | grep -q '^upstream$'; then
  echo "Adding 'upstream' remote for the template repository."
  git remote add upstream git@github.com:MattThommes/amplify-react-app.git
else
  echo "'upstream' remote already exists."
fi

echo "-> Checking README.md header..."
ORIGINAL_HEADER="# ⛅️ ⚛︎ Amplify React App"
if grep -qFx "$ORIGINAL_HEADER" README.md; then
  echo "   - Updating default README header..."
  date=$(date +%m/%d/%Y)
  NEW_HEADER="# Custom Amplify React App - $date"
  sed -i.bak "1s|.*|$NEW_HEADER|" README.md && rm README.md.bak
else
  echo "   - README header already customized. Skipping."
fi

# Load nvm if it's installed
if [ -s "$(brew --prefix nvm)/nvm.sh" ]; then
  echo "-> Sourcing nvm..."
  source "$(brew --prefix nvm)/nvm.sh"
fi

echo "-> Setting up Node version manager..."
if ! command -v nvm &> /dev/null; then
  echo "   - nvm is not installed. Installing via Homebrew..."
  brew install nvm
  source "$(brew --prefix nvm)/nvm.sh" # Source it after installation
else
  echo "   - nvm is already installed."
fi

echo "-> Setting up Node..."
NODE_VERSION=$(cat .nvmrc)
if ! nvm ls "v$NODE_VERSION" | grep -q "v$NODE_VERSION"; then
  echo "Node.js v$NODE_VERSION is not installed. Installing..."
  nvm install
else
  echo "Node.js v$NODE_VERSION is already installed."
fi
nvm use
nvm list
echo "-> Installing dependencies..."
npm ci --prefer-offline --no-audit --progress=false

echo "-> Checking for Amplify CLI..."
if ! command -v amplify &> /dev/null; then
  echo "   - Amplify CLI not found. Installing globally..."
  npm install -g @aws-amplify/cli
else
  echo "   - Amplify CLI is already installed. Upgrading to the latest version..."
  amplify upgrade
fi

echo "-> Setup complete!"
