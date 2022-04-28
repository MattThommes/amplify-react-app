#!/bin/bash

echo "Please provide your repo SSH clone URI for your project:"

read project_repo_uri

git remote add upstream project_repo_uri

echo "-> Updating README..."
> README.md
echo "# Test" > README.md

echo "-> Setting correct Node version..."
nvm use

echo "-> Checking Amplify version..."
amplify_version=$(amplify --version)

echo "->> Amplify version found: ${amplify_version}"
