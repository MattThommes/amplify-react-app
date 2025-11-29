#!/bin/bash

# Idempotent script to delete the Amplify app and all related resources.

set -e # Exit immediately if a command exits with a non-zero status.

echo "This script will delete the Amplify backend, the Amplify app in the console, and local Amplify files."
echo "You will be prompted by 'amplify delete' to confirm the backend deletion."
echo "--------------------------------------------------------------------------------"

# --- Step 1: Delete the cloud backend environment ---
echo "Attempting to delete the Amplify backend environment..."

# Check if an Amplify project is initialized by looking for the amplify/ directory
if [ -d "amplify" ]; then
    # amplify delete is interactive and requires confirmation.
    # It will throw an error if no backend is initialized, which is fine.
    amplify delete || echo "Could not run 'amplify delete'. This may be because the backend was already deleted or never initialized."
else
    echo "No 'amplify/' directory found. Skipping backend deletion."
fi

# --- Step 2: Delete the app from the AWS Amplify console ---
echo "Attempting to delete the app from the AWS Amplify Console..."

# The appId is stored in amplify/.config/project-config.json
PROJECT_CONFIG_FILE="amplify/.config/project-config.json"
if [ -f "$PROJECT_CONFIG_FILE" ]; then
    APP_ID=$(grep -o '"appId": *"[^"]*"' "$PROJECT_CONFIG_FILE" | grep -o '"[^"]*"$' | tr -d '"')
    if [ -n "$APP_ID" ]; then
        echo "Found App ID: $APP_ID. Deleting..."
        aws amplify delete-app --app-id "$APP_ID"
        echo "Successfully initiated deletion for app $APP_ID."
    else
        echo "App ID not found in project config. Skipping console app deletion."
    fi
else
    echo "Amplify project config not found. Skipping console app deletion."
fi

# --- Step 3: Clean up local project files ---
echo "Cleaning up local Amplify files..."

rm -rf amplify/
rm -f amplify.yml
rm -f src/aws-exports.js
rm -f amplifyconfiguration.json

echo "--------------------------------------------------------------------------------"
echo "Amplify cleanup process complete."
echo "If the backend deletion is still in progress, you can monitor it in the AWS CloudFormation console."