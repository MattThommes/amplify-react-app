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
  git remote add upstream https://github.com/MattThommes/amplify-react-app.git
else
  echo "'upstream' remote already exists."
fi

date=$(date +%m/%d/%Y)
echo "-> Updating readme..."
> README.md
echo "# Custom Amplify React App - $date" > README.md

echo "-> Setting up Node version manager..."
if ! command -v nvm &> /dev/null; then
  echo "nvm is not installed. Installing via Homebrew..."
  brew install nvm
else
  echo "nvm is already installed."
fi
source "$(brew --prefix nvm)/nvm.sh"

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

echo "-> Setup complete!"
echo "You can now initialize your Amplify backend."
echo "Run the following command:"
echo -e "${RED}amplify init${NC}"
