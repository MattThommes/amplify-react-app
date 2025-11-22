#!/bin/bash

RED='\033[0;31m'
NC='\033[0m' # No Color

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
brew install nvm
source ~/.nvm/nvm.sh

echo "-> Setting up Node..."
nvm install v20
nvm use
nvm list

echo "-> Installing dependencies..."
npm ci --prefer-offline --no-audit --progress=false

echo "-> Setup complete!"
echo "You can now initialize your Amplify backend."
echo "Run the following command:"
echo -e "${RED}amplify init${NC}"
