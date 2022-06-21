#!/bin/bash

RED='\033[0;31m'
NC='\033[0m' # No Color

echo "-> Removing any existing git setup..."
rm -rf .git
echo "-> Initializing git..."
git init

echo "-> Cloning Amplify React App repo..."
git clone git@github.com:MattThommes/amplify-react-app.git . --quiet
clone_success=$?
if [ clone_success -ne 0 ] ; then
	echo -e "${RED}Failed to clone the repo (error code $clone_success)${NC}"
	exit 1
fi

echo "Please provide your repo SSH clone URI for your project:"
read project_repo_uri
echo "-> Configuring git remotes..."
git remote remove upstream
git remote add upstream $project_repo_uri
git remote remove origin

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

if [ "$amplify_version" != "7.6.26" ] ; then
	echo -e "${RED}Amplify version incorrect; currently set to $amplify_version${NC}"
	exit 1
fi

echo "-> Installing dependencies..."
npm ci --prefer-offline --no-audit --progress=false

echo "-> Initializing Amplify project..."
amplify init

echo "-> Starting local server to test that it's working..."
npm start
