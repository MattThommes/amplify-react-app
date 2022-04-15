# Setup Instructions

## Setup Amplify

1. Install Amplify CLI: `npm install -g @aws-amplify/cli@7.6.26`

## Setup React + Amplify

1. CD into your empty project folder locally.
2. Run `nvm use`, `nvm install`, `nvm exec`, and `nvm which`
2. Run `npm install`
2. Update the newly generated `README.md` to be specific to the project.
3. Ensure the command `amplify --version` works and outputs recommended Amplify CLI version.
4. Run `amplify init` to setup a new Amplify project.
    1. Enter a name for the project: all lower case without dashes, underscores, or spaces.
    2. Choose No for `Initialize the project with the above configuration?`
    3. Enter a name for the environment: Can leave at `dev` for now.
    4. Choose `None` for your default editor.
    5. Choose `javascript` the type of app that you're building.
    6. Choose `react` javascript framework.
    7. Source Directory Path: `src`
    8. Distribution Directory Path: `build`
    9. Build Command: `npm run build`
    10. Start Command: `npm start`
    11. Select `AWS profile` for the authentication method you want to use.
    12. Select `amplify-feb2021-b` for the profile you want to use.
5. Commit changes to `.gitignore` file.
6. Run `npm start` and confirm default React site appears at http://localhost:3000.

