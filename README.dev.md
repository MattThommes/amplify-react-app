# Setup Instructions

## Local project setup

1. Create Github repo for new project.
2. Clone template repo into new project directory: `git clone git@github.com:MattThommes/amplify-react-app.git project-name`

### Automated steps

1. cd into project directory
2. Set permissions for script (if needed): `/bin/chmod 700 setup.sh`
3. Run script (from project directory root): `./setup.sh`

### Manual steps

1. Change the remote repo to your project specific repo:
    1. `git remote add upstream [YOUR_PROJECT_GIT_CLONE_URI]`
2. Update the `README.md` file to be specific to your project.
3. Run `nvm use` to use the correct Node version.
4. Check Amplify version: `amplify --version`
5. If it’s not matching the [package.json](package.json) version requirement, install it:
    1. `npm install -g @aws-amplify/cli@^[VERSION_FROM_PACKAGE_JSON]`
    2. Example: `npm install -g @aws-amplify/cli@^7.6.26`
6. Run `npm install`
    1. You may receive some warnings about GraphQL which can be ignored:
        ```
        npm WARN ERESOLVE overriding peer dependency
        npm WARN While resolving: relay-compiler@12.0.0
        npm WARN Found: graphql@14.7.0
        npm WARN node_modules/graphql
        npm WARN   peer graphql@"^0.13.0 || ^14.0.0" from @ardatan/graphql-tools@4.1.0
        ...
        ```
7. Run `npm start` and confirm build works and default React site appears at http://localhost:3000
8. Run `amplify init` to setup a new Amplify project:
    1. Enter a name for the project: all lower case without dashes, underscores, or spaces.
    2. Enter `n` (No) for `Initialize the project with the above configuration?`
    3. Enter `dev` for name of the environment.
    4. Choose `Visual Studio Code` or `None` for your default editor.
    5. Choose `javascript` the type of app that you're building.
    6. Choose `react` javascript framework.
    7. Source Directory Path: `src`
    8. Distribution Directory Path: `build`
    9. Build Command: `npm run build`
    10. Start Command: `npm start`
    11. Select `AWS profile` for the authentication method you want to use.
    12. Select `amplify-feb2021-b` for the profile you want to use.
        1. If you don’t see the above profile, edit ~/.aws/config and ~/.aws/credentials to ensure it is present in both files.
9. Commit changes then push. Don’t forget newly generated files:
    1. `git add .gitignore`
    2. `git add package-lock.json`
    3. `git add amplify` (not sure this is needed since it can be auto-generated again)
10. Create `staging` branch (from `master` branch) locally then push.

## Amplify console setup

1. In the AWS console, connect your new app to Github for both `master` and `staging` branches.
    1. Choose ”dev” environment.
    2. Check `Enable full-stack continuous deployments (CI/CD)`
    3. Under Advanced settings > Live package updates, set Amplify CLI to the version from [package.json](package.json) (example: 7.6.26).
    4. Click Next then Save and deploy.
2. Under Build settings, paste in the contents of [amplify.yml](amplify.yml).
3. Confirm the build and deploy fully works in AWS along with the default URL showing the React app.

