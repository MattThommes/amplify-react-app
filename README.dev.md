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
4. Run `nvm list` to ensure your CLI session is using the same version from the .nvmrc file.
5. Check Amplify version: `amplify --version`
6. If you see 'command not found' for anything, try running `source ~/.nvm/nvm.sh` in your current CLI session.
    1. If amplify is still not found, you may need to install it: `npm install -g @aws-amplify/cli`
7. Run `npm install`
    1. You may receive some warnings about GraphQL which can be ignored:
        ```
        npm WARN ERESOLVE overriding peer dependency
        npm WARN While resolving: relay-compiler@12.0.0
        npm WARN Found: graphql@14.7.0
        npm WARN node_modules/graphql
        npm WARN   peer graphql@"^0.13.0 || ^14.0.0" from @ardatan/graphql-tools@4.1.0
        ...
        ```
8. Run `npm start` and confirm build works and default React site appears at http://localhost:3000
9. Run `amplify init` to setup a new Amplify project:
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
10. Commit changes then push. Don’t forget newly generated files:
    1. `git add .gitignore`
    2. `git add package-lock.json`
    3. `git add amplify` (not sure this is needed since it can be auto-generated again)
11. Create `staging` branch (from `master` branch) locally then push:
    1. `git checkout -b staging`
    2. `git push upstream staging`

## Amplify console setup

1. In the AWS console, under ”Hosting environments,” connect your new app to Github for both `master` and `staging` branches.
    1. Choose ”dev” environment.
    2. Check `Enable full-stack continuous deployments (CI/CD)`
    3. Under Advanced settings > Live package updates, Amplify CLI should be set to ”latest” (confirm in the local [package.json](package.json) file and by running `amplify --version` to check).
    4. Click Next then Save and deploy.
2. Under Build settings, verify the contents of [amplify.yml](amplify.yml) match what is in the repo file.
3. Confirm the build and deploy fully works in AWS along with the default URL showing the React app.

## Adding resources

### Images

When adding image storage for the first time:

1. `amplify add storage`
2. Choose `Content (Images, audio, video, etc.)`
3. Enter `y` when asked to add auth (Amazon Cognito)
4. Choose `Default configuration`
5. Choose `Email` when asked `How do you want users to be able to sign in?`
6. Enter a short custom identifier string for `Provide a friendly name for your resource`
7. You can leave the default bucket name as it is already unique - just hit Enter.
8. For `Who should have access` choose `Auth users only`
9. For `What kind of access do you want for Authenticated users?` select all options using the spacebar.
10. Enter `n` for `Do you want to add a Lambda Trigger for your S3 Bucket?`
11. Log into the AWS console and go to the S3 section.
12. Verify the number of buckets you have - once you push the changes you should see a new bucket created.
13. Run `amplify push` to push the local storage changes to the cloud.
14. Verify in AWS console you see the new bucket created, something like `thommesfamvacationsaf92c0e5c7194a05804f41a082b0110057-dev`
    1. You can also run `aws s3 ls` locally to see your buckets.

Syncing local images to S3:

```
$ aws s3 sync ~/Documents/dev/[PROJECT]/images/ s3://[BUCKET_NAME] --acl public-read
```

The `images` folder is just a placeholder for syncing purposes. It is not meant to hold every single image. Once an image is synced to the cloud you can delete the file locally. You can update `.gitignore` to include the images folder so it does not appear as changed for source control.

Example image usage in code:

```
<img className="img-fluid" src="https://[BUCKET_NAME].s3.amazonaws.com/[FILENAME].jpg" />
```
