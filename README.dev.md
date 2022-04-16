# Setup Instructions

## Local project setup

1. Create Github repo for new project.
2. Run `git clone git@github.com:MattThommes/amplify-react-app.git .` in your empty project folder locally.
3. Change the remote repo to your project specific repo:
    1. `git remote rename origin source` <-- or whatever you want to call the original repo
    2. `git remote add upstream [YOUR_PROJECT_GIT_CLONE_URI]`
4. Update the `README.md` file to be specific to your project.
5. Run `nvm use` to use the correct Node version.
6. Check Amplify version: `amplify --version`
7. If it’s not matching the [package.json](package.json) version requirement, install it:
    1. `npm install -g @aws-amplify/cli@^[VERSION_FROM_PACKAGE_JSON]`
    2. Example: `npm install -g @aws-amplify/cli@^7.6.26`
8. Run `npm install`
9. Run `npm start` and confirm build works and default React site appears at http://localhost:3000
10. Run `amplify init` to setup a new Amplify project.
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
11. Commit changes then push:
    1. `git add .gitignore`
    2. `git add package-lock.json`
    3. `git add amplify`
12. Create `staging` branch (from `master` branch) locally then push.

## Amplify console setup

1. In the AWS console, connect your new app to Github for both `master` and `staging` branches.
    1. Choose ”dev” environment.
    2. Check `Enable full-stack continuous deployments (CI/CD)`
    3. Under Advanced settings > Live package updates, set Amplify CLI to the version from [package.json](package.json) (example: 7.6.26).
    4. Click Next then Save and deploy.
2. Under Build settings, paste in the contents of [amplify.yml](amplify.yml).
3. Confirm the build and deploy fully works in AWS along with the default URL showing the React app.

