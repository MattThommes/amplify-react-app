#!/bin/bash

RED='\033[0;31m'
NC='\033[0m' # No Color

echo "-> Adjusting git remote..."
# Adds a trailing underscore to avoid accidental pushes since I am used to using upstream in place of origin
git remote rename origin upstream_

echo "Please provide your repo SSH clone URI for your project:"
read project_repo_uri
echo "-> Configuring this git remote..."
git remote add upstream $project_repo_uri

date=$(date +%m/%d/%Y)
echo "-> Updating readme..."
> README.md
echo "# Custom Amplify React App - $date" > README.md

# source nvm so it is found
. ~/.nvm/nvm.sh
echo "-> Setting correct Node version..."
nvm use

echo "-> Checking Amplify version..."
amplify_version=$(amplify --version)

echo "  -> Amplify version found: ${amplify_version}"

echo "-> Installing dependencies..."
npm ci --prefer-offline --no-audit --progress=false

echo "-> Initializing Amplify project..."
amplify init

echo "-> Starting local server to test that it's working..."
npm start
