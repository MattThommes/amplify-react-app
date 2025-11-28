# ⛅️ ⚛︎ Amplify React App: 🛠️ Developer Guide

## Overview

Amplify React App is built using Vite and React. It serves as a modern, fast template for building single-page applications (SPA’s) on AWS Amplify.

## Local project setup

### Create / sync from template

1.  Create a new Github repo for your new project from the amplify-react-app template:
    *   ![Create new repo from template](images/repo_from_template.png)
2.  Clone your new repo locally, example:
    *   `git clone git@github.com:[GITHUB_USERNAME]/amplify-react-app-test1.git`
3.  Open the cloned project in your IDE and follow the setup steps below.

To pull down the latest changes from the upstream repo, run this script:

`./sync-upstream.sh`

### Project specific setup

After cloning the project, you can run the included setup script to automate most of the initial configuration.

`./setup.sh`

Set permissions first, if needed:

`chmod 755 setup.sh`

Update these files to include your specific project related information:

1.  [README.md](README.md) (keep this file - [README.dev.md](README.dev.md) for upstream changes)
2.  [package.json](../package.json) (name and description)
3.  [public/index.html](../index.html) (`<title>` and `<meta name="description"`)
4.  [public/manifest.json](../public/manifest.json) (`short_name` and `name`)

Commit your project-specific updates:

*   `git add .`
*   `git commit -m "Project specific updates"`

Start the app locally:

*   `./run.sh`

## AWS Amplify Gen 1 setup

Before initializing Amplify, ensure your AWS credentials are set up on your local machine. The Amplify CLI uses the same credential provider chain as the AWS CLI and other SDK’s, looking for credentials in environment variables or your AWS credentials file (commonly `~/.aws/credentials`).

If you haven’t configured credentials, you can run `aws configure` to create a profile.

When you run `amplify init`, you will be prompted to select the AWS profile you wish to use for the project.

Initialize Amplify in the project:

    *   `amplify init`
    *   Follow the prompts to set up your project. This will create a new `amplify` directory with your backend definition.

As of November 2025, the CLI recommends Gen 2, but amplify-react-app does not support that yet, and still requires Gen 1. Gen 2 is a complete rewrite and different approach and it does not seem very intuitive to use.

You should see this warning:

```
⚠️ For new projects, we recommend starting with AWS Amplify Gen 2, our new code-first developer experience. Get started at https://docs.amplify.aws/react/start/quickstart/
? Do you want to continue with Amplify Gen 1? (y/N) ›
```

Respond with 'y' to continue with Gen 1.

Next you might see:

```
? Why would you like to use Amplify Gen 1? …  (Use arrow keys or type to filter)
  I am a current Gen 1 user
  Gen 2 is missing features I need from Gen 1
❯ I find the Gen 1 CLI easier to use
  Prefer not to answer
```

Pick anything; it does not matter.

Next, pick No for the confirmation:

```
? Enter a name for the project test20251122
The following configuration will be applied:

Project information
| Name: test20251122
| Environment: dev
| Default editor: Visual Studio Code
| App type: javascript
| Javascript framework: react
| Source Directory Path: src
| Distribution Directory Path: build
| Build Command: npm run-script build
| Start Command: npm run-script start

? Initialize the project with the above configuration? (Y/n) n
```

Instead, use these values:

```
? Enter a name for the environment dev
? Choose your default editor: None
✔ Choose the type of app that you're building · javascript
Please tell us about your project
? What javascript framework are you using react
? Source Directory Path:  src
? Distribution Directory Path: dist
? Build Command:  npm run build
? Start Command: npm run dev
```

Next, authentication method:

```
Using default provider  awscloudformation
? Select the authentication method you want to use: (Use arrow keys)
❯ AWS profile
AWS access keys
```

Choose `AWS profile`. Then pick the local profile:

```
For more information on AWS Profiles, see:
https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html

? Please choose the profile you want to use
❯ amplify-feb2021-b
default
```

If you get an error such as “Failed to get profile credentials,” try configuring it again:

`aws configure --profile [profile_name]`

You should then see this happening:

```
? Please choose the profile you want to use amplify-feb2021-b
Adding backend environment dev to AWS Amplify app: d2k7m5h8n9xdhq

Deploying resources into dev environment. This will take a few minutes. ⠸
Deploying root stack test20251122 [ ---------------------------------------- ] 0/4
```

Eventually (few seconds):

```
Deployment completed.
Deploying root stack test20251122 [ ==========------------------------------ ] 1/4
        amplify-test20251122-dev-ea8a9 AWS::CloudFormation::Stack     CREATE_IN_PROGRESS             Thu Nov 27 
        DeploymentBucket               AWS::S3::Bucket                CREATE_COMPLETE                Thu Nov 27 
        AuthRole                       AWS::IAM::Role                 CREATE_IN_PROGRESS             Thu Nov 27 
        UnauthRole                     AWS::IAM::Role                 CREATE_IN_PROGRESS             Thu Nov 27
```

You should now see your app in the [AWS Amplify console](https://us-east-1.console.aws.amazon.com/amplify/apps).

Commit and push all changes to `master` / `main`.

To have Amplify automatically create a staging environment, create a `staging` branch (from `master` or `main` branch) locally then push again:

1.  `git checkout -b staging`
2.  `git push origin staging`

Then go into the Amplify console and connect to the repository. Connect the `staging` branch, and `master` / `main` branch for prod.

Ensure the “Frontend build command” and “Build output directory” values are correct.

Choose an existing service role if you have one.

“Save and deploy.”








### Deploying backend resource changes

When you add or update backend resources (e.g., `amplify add auth`), you deploy them using the Amplify CLI.
*   `amplify push`
This command will provision the resources in your AWS account for the current environment.

## Amplify console setup

1.  In the AWS Amplify Console, create a new app and connect your GitHub repository.
    *   !Amplify connect repo
2.  Connect your `master` and `staging` branches.
    *   Amplify will create backend environments for each branch (e.g., `staging`, `prod`).
    *   !Amplify connect branch
3.  During the build settings configuration, Amplify will detect the `amplify.yml` file in your repository. Confirm the settings. Check the box to "Allow AWS Amplify to automatically deploy all files hosted with Amplify".
4.  Create or select a Service Role that gives Amplify permission to deploy resources on your behalf.
    *   !Amplify service role
5.  Review your settings and click "Save and deploy".
6.  Amplify will start the first deployment for the branch. You can monitor the progress in the console.
7.  **Rewrites and Redirects**: For single-page apps (SPAs), you need a rewrite rule to serve `index.html` for all routes that are not files. Add the following rule in the "Rewrites and redirects" section:
    *   **Source address:** `</^((?!\.(css|gif|ico|jpg|js|png|txt|svg|woff|ttf|webmanifest)$).)*$/>`
    *   **Target address:** `/index.html`
    *   **Type:** `200 (Rewrite)`
    *   !Amplify rewrite
8.  Once deployment is complete, click the app URL to verify that your application is live.

## Adding a custom domain

1.  Go to Route 53 > Hosted zones > Create hosted zone for your domain.
    *   !Route 53 Create hosted zone
2.  In the Amplify Console, go to "Domain management" and click "Add domain".
3.  Select your domain from the dropdown and click "Configure domain".
4.  You can configure subdomains and redirects. I personally uncheck the www redirect.
5.  Amplify will provide instructions for creating the necessary CNAME records in Route 53 to verify domain ownership and route traffic. Follow the steps to complete the setup.

## Adding cloud resources

To add or update backend resources like APIs, authentication, and databases, you use the Amplify CLI.

*   `amplify add api`
*   `amplify add auth`
*   `amplify add storage`
