# Setup Instructions

1. Run `git clone git@github.com:MattThommes/amplify-react-app.git .` in an empty project folder.
2. Run `nvm use` to use the correct Node version.
3. Check Amplify version: `amplify --version`
4. If it’s not matching the [package.json](package.json) version requirement, install it:
    1. `npm install -g @aws-amplify/cli@^[VERSION_FROM_PACKAGE_JSON]`
    2. Example: `npm install -g @aws-amplify/cli@^7.6.26`
5. Run `npm install`
6. Run `npm start` and confirm default React site appears at http://localhost:3000
7. Run `amplify init` to setup a new Amplify project.
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
8. Commit changes to `.gitignore` file.
