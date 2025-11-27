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

## Amplify Gen 1 Backend Setup

### Initializing Amplify
 
1.  **Install the Amplify CLI:** If you don't have it, install it globally:
    *   `npm install -g @aws-amplify/cli`
    *   *(Note: The CLI is installed globally to provide access to the `amplify` command from anywhere on your system. It is used to manage backend resources and is a one-time setup for your development machine.)*
2.  **Configure Amplify:** Configure the CLI with your AWS credentials.
    *   `amplify configure`
3.  **Initialize Amplify in the project:**
    *   `amplify init`
    *   Follow the prompts to set up your project. This will create a new `amplify` directory with your backend definition.
4.  **Start the frontend:** In a separate terminal, start the Vite development server:
    *   `npm run dev`
5.  Your React app will be running at `http://localhost:5173` (or another port if 5173 is busy).

To aid Amplify with creating a staging environment, create a `staging` branch (from `master` branch) locally then push:

1.  `git checkout -b staging`
2.  `git push origin staging`

### Deploying Backend Changes

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
