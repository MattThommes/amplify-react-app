# ⛅️ ⚛︎ Amplify React App: 🛠️ Developer Guide

## Overview

Amplify React App is generated from [Create React App](https://create-react-app.dev/). Once created, the app is updated via the `react-scripts` development dependency (see [Updating to New Releases](https://create-react-app.dev/docs/updating-to-new-releases) and [changelog](https://github.com/facebook/create-react-app/blob/main/CHANGELOG.md)).

## Local project setup

### Make quick updates to website content

If you just need to make a quick update to the website content, you can follow
these steps:

1. Load the right Node version: `source ~/.nvm/nvm.sh && nvm use`
2. Run `npm start` to start the local development server.
3. Make your changes to the website content.
4. For new images, run `npm run image-sync` (see [Images](images/README.md)).

### Create from template

1. Create a new Github repo for your new project from the amplify-react-app template:
    * ![Create new repo from template](images/repo_from_template.png) 
2. Clone your new repo locally, example:
    * `git clone git@github.com:[GITHUB_USERNAME]/amplify-react-app-test1.git`
3. Create a new project in your IDE. Proceed to below steps from within your project README.dev.md.

### Project specific setup

1. Update the git remotes for your new project to include a remote named `upstream` for the base repo ([amplify-react-app](https://github.com/MattThommes/amplify-react-app)) so future changes can be pulled in:
    * `git remote add upstream git@github.com:MattThommes/amplify-react-app.git`
2. Sync your new repo to merge all unrelated history from the upstream/template repo. Whenever you need to update your repo with changes from the upstream repo, repeat these steps:
    1. `git fetch upstream`
    2. `git merge upstream/master --allow-unrelated-histories`
    3. Fix conflicts (if any; the further your app has diverged, the more there will be). Don’t fix package-lock.json conflicts - just do `git add package-lock.json` and it will get regenerted.
    4. Run `nvm use` then `npm update`.
        1. If nvm is not found, run `source ~/.nvm/nvm.sh`
    5. Run `git add package-lock.json`.
    6. Commit changes: `git commit -m "Updated to latest amplify-react-app"`
    7. `git push origin master` (assuming `master` branch)
3. Update these files to include your specific project related information:
    1. README.md (keep README.dev.md for following along or future debugging)
    2. package.json (name and description)
    3. public/index.html (`<title>` and `<meta name="description"`)
    4. public/manifest.json (`short_name` and `name`)
    5. src/App.js (`const SiteName`)
4. Check Amplify version to verify it is installed globally:
    * `amplify --version`
5. Run `npm install`. Add and commit package-lock.json again: `git commit -m "Dependency updates"`
6. Run `npm start` and confirm build works and default React site appears at http://localhost:3000
7. Proceed to Amplify CLI setup steps, then come back here.
8. If you haven’t already, commit and push any changes. Initial changes should look similar to:
    * `modified:   .gitignore`
    * `modified:   README.md`
    * `modified:   package-lock.json`
    * `modified:   package.json`
    * `modified:   public/index.html`
    * `modified:   public/manifest.json`
    * Don’t forget newly generated files:
        1. `git add amplify` (OPTIONAL)
            * If you commit the amplify directory it will use this at deployment time to generate the cloud resources. I’ve noticed the builds take a bit longer when this is included. You can also opt to not include it and let Amplify generate the cloud resources solely from the CLI.
    * Using `git add *` is faster.
    * `git commit -m "After running amplify init"`
9. To aid Amplify with creating a staging environment, create a `staging` branch (from `master` branch) locally then push:
    1. `git checkout -b staging`
    2. `git push origin staging`

## Amplify CLI setup

1. Run `amplify init` to setup a new Amplify project. If you are pulling down an existing Amplify project, the command will be something like this: `amplify pull --appId 12345`.
    1. Enter a name for the project (or hit Enter to use the default): alpha only and <= 20 characters.
    2. Enter `n` (No) for `Initialize the project with the above configuration?`
    3. Enter `dev` for name of the environment (or hit Enter to use the default).
    4. Choose `Visual Studio Code` or `None` for your default editor.
    5. Choose `javascript` for the type of app that you’re building.
    6. Choose `react` for javascript framework.
    7. Source Directory Path: `src`
    8. Distribution Directory Path: `build`
    9. Build Command: `npm run build`
    10. Start Command: `npm start`
    11. If you ran `amplify init` for a fresh Amplify app, continue to the next step. If you ran `amplify pull --appId ...` to pull down an existing Amplify app, continue to step 16.
    12. Select the profile you want to use.
        * If you don’t see the correct profile, edit ~/.aws/config and ~/.aws/credentials to ensure it is present in both files.
    13. Decide for yourself for this question:
        * `✔ Help improve Amplify CLI by sharing non sensitive configurations on failures (y/N)`
    14. Once it finishes setting up your local and cloud environment, you should see a message similar to:
        * `Deployment state saved successfully.`
        * `✔ Initialized provider successfully.`
        * `✅ Initialized your environment successfully.`
        * `Your project has been successfully initialized and connected to the cloud!`
        * `Some next steps:`
    15. You should see a new amplify directory appear in your project files.
    16. Visit the [AWS Amplify console](https://us-east-1.console.aws.amazon.com/amplify/home?region=us-east-1#/) to verify the app was created:
        * ![Amplify new app created](images/amplify_new_app_created.png)

## Amplify console setup

1. In the AWS console, under “Hosting environments,” connect your new app to Github for both `master` and `staging` branches.
    1. Choose your Git repository:
        * ![Amplify connect repo](images/amplify_connect_repo.png)
    2. Choose repository and `master` branch:
        * ![Amplify connect branch](images/amplify_connect_branch.png)
    3. Check “Enable full-stack continuous deployments (CI/CD).”
        * ![Amplify CI/CD](images/amplify_cicd.png)
    4. For “Select an existing service role or create a new one,” use your best judgement - there are no hard requirements here yet.
        * ![Amplify service role](images/amplify_service_role.png)
    5. Under Advanced settings > “Live package updates,” Amplify CLI should be set to “latest.”
        * ![Amplify live package updates](images/amplify_live_package_updates.png)
    6. Click Next then “Save and deploy.”
    7. Repeat the same steps for the staging branch.
2. Under the “Rewrites and redirects” section, add a new item with source address `</^((?!\.(css|gif|ico|jpg|js|png|txt|svg|woff|ttf)$).)*$/>` and target address `/index.html`. Choose “200 (Rewrite)” for the Type.
3. Under “Hosting environments” confirm the build and deploy fully worked for staging and master branches.
4. Click the amplifyapp URL’s for each environment and verify the default React app is showing.

### Adding a custom domain

1. Go to Route 53 > Hosted zones > Create hosted zone.
    * ![Route 53 Create hosted zone](images/route53_create_hosted_zone.png)
2. Under Amplify Domain management, click Add domain. You should see the Route 53 domain you just added appear in the dropdown/selector.
3. I personally don’t care for the www redirect, so I uncheck “Setup redirect from https:// to https://www”
4. Update nameservers at the domain registrar (Ie. Name.com) to point to AWS - you should see the nameservers in Route 53 when editing the new domain.

## Adding cloud resources

* [API’s](api/README.md)
* [Images](images/README.md)
* [Databases](databases/README.md)
