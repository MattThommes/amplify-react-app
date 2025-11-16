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

echo "-> Setting AWS profile for this session..."
echo "Please enter the AWS profile to use for the Amplify Sandbox (e.g., amplify-feb2021-b):"
read aws_profile_name
export AWS_PROFILE=$aws_profile_name
echo -e "AWS profile set to ${RED}$AWS_PROFILE${NC} for this terminal session."

echo "-> Installing dependencies..."
npm ci --prefer-offline --no-audit --progress=false

echo "-> Initializing Amplify Gen 2 project..."
npm create amplify@latest --yes

echo "-> Setup complete!"
echo "You can now start the Amplify Sandbox to build your backend."
echo "Run the following command:"
echo -e "${RED}npx ampx sandbox --profile $AWS_PROFILE${NC}"
