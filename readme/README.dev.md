# ⛅️ ⚛︎ Amplify React App: 🛠️ Developer Guide

## Overview

Amplify React App is built using Vite and React. It serves as a modern, fast template for building single-page applications (SPA’s) on AWS Amplify.

## Prerequisites

Before you begin, ensure you have the following tools installed on your local machine:

*   **Node.js and npm**: (e.g., v18 or later). You can download them from [nodejs.org](https://nodejs.org/).
*   **Git**: For version control. You can download it from [git-scm.com](https://git-scm.com/).
*   **AWS CLI**: For configuring your AWS credentials. Follow the [official installation guide](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html).
*   **AWS Amplify CLI (Gen 1)**: The command-line tool for managing your Amplify backend.
    ```sh
    npm install -g @aws-amplify/cli
    ```
    > **Note**: This template is built for Amplify **Gen 1**. If you have a newer version of the CLI, it may prompt you to use Gen 2. Always select 'No' to continue with Gen 1 as outlined in the setup guide.

*   **Java Development Kit (JDK)**: (e.g., OpenJDK 17 or later). This is required by the Amplify CLI to run local mocking for services like DynamoDB when using `amplify mock`. You can install it via tools like Homebrew (`brew install openjdk@17`) or Chocolatey (`choco install openjdk --version=17`).
    
    > **macOS Note**: After installing with Homebrew, you must add the JDK to your shell's environment variables. The method is the same for both Apple Silicon (M1/M2/M3/M4) and Intel Macs.
    >
    > 1.  Add the following lines to your shell configuration file (e.g., `~/.zshrc` or `~/.bash_profile`). This correctly sets the `JAVA_HOME` and updates your `PATH`.
    >     ```sh
    >     echo 'export JAVA_HOME="$(brew --prefix openjdk@17)"' >> ~/.zshrc
    >     echo 'export PATH="${JAVA_HOME}/bin:${PATH}"' >> ~/.zshrc
    >     ```
    > 2.  Reload your shell configuration (`source ~/.zshrc`) or open a new terminal.
    > 3.  Verify the installation by running `java -version`.

## Local project setup

### Create / sync from template

1.  Create a new Github repo for your new project from the amplify-react-app template:
    *   ![Create new repo from template](images/repo_from_template.png)
2.  Clone your new repo locally, example:
    *   `git clone git@github.com:[GITHUB_USERNAME]/amplify-react-app-test1.git`
3.  Open the cloned project in your IDE and follow the setup steps below.

**After running setup**, to pull down the latest changes from the upstream repo, run this script:

`make sync-upstream`

### Project specific setup

After cloning the project, you can run the included setup script to automate most of the initial configuration.

`make setup`

Update these files to include your specific project related information:

1.  [README.md](../README.md) (keep this file: [README.dev.md](README.dev.md) for upstream changes)
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
*   Since the backend definition is already included in this template, Amplify will detect it and ask if you want to use it.
*   Follow the prompts to connect to your AWS account and set up a new environment (e.g., `dev`). This will generate a new `amplify/team-provider-info.json` file (which is git-ignored) that links the backend to *your* AWS account and Amplify app.

As of November 2025, the CLI may recommend Gen 2. This template requires **Gen 1**.

You should see this warning:

```
⚠️ For new projects, we recommend starting with AWS Amplify Gen 2, our new code-first developer experience. Get started at https://docs.amplify.aws/react/start/quickstart/
? Do you want to continue with Amplify Gen 1? (y/N) › y
```

Next you might see:

```
? Why would you like to use Amplify Gen 1? …  (Use arrow keys or type to filter)
  I am a current Gen 1 user
  Gen 2 is missing features I need from Gen 1
  I find the Gen 1 CLI easier to use
❯ Prefer not to answer
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

You should then see Amplify creating the new backend environment in your account:

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

For single-page apps (SPA’s), you need a rewrite rule to serve `index.html` for all client-side routes. In the “Rewrites and redirects” section, Amplify often creates a default rule for you. If not, or if you need to edit it, click “Edit” to open the JSON editor and ensure it contains the following rule:

```json
[
  {
    "source": "/<*>",
    "status": "404-200",
    "target": "/index.html"
  }
]
```

## Adding a custom domain

To connect a custom domain to your Amplify application, you'll first need to have a registered domain. If you don't have one, you can register one through Amazon Route 53 or any other domain registrar.

### 1. Ensure a Hosted Zone in Route 53

For Amplify to automatically configure your DNS records, your domain must be managed in an Amazon Route 53 public hosted zone.

*   If your domain is registered with Route 53, a hosted zone is typically created for you automatically.
*   If your domain is with another registrar, you'll need to create a hosted zone in Route 53 for your domain. Then, update the name server (NS) records at your registrar to point to the name servers assigned by Route 53.

### 2. Add the domain in AWS Amplify

1.  In the AWS Amplify console for your app, navigate to **Hosting > Custom domains** (or **Domain management** in the older UI) and click **Add domain**.
2.  Select your domain from the dropdown list (Amplify will detect domains in your Route 53 account) and click **Configure domain**.

### 3. Configure subdomains and redirects

1.  On the configuration screen, you can set up subdomains. A common practice is to use the root domain (e.g., `example.com`) for one branch (like `main`/`prod`) and a subdomain (e.g., `staging.example.com`) for another branch (like `staging`).
2.  You can also configure a redirect from `www` to the root domain (or vice-versa). You can choose to disable this if it doesn't fit your needs.
3.  Click **Save**.

### 4. Wait for SSL/TLS and DNS propagation

Amplify will now provision an SSL/TLS certificate for your domain and create the necessary DNS records (A, AAAA, CNAME) in your Route 53 hosted zone. This process can take anywhere from a few minutes to a couple of hours. You can monitor the status in the Amplify console. Once complete, your application will be available at your custom domain.

## Adding cloud resources

To add or update backend resources like APIs, authentication, and databases, you use the Amplify CLI.

*   [API’s](../readme/api/README.md)
*   [Storage](../readme/images/README.md)

## Deleting your Amplify app and cleaning up resources

### Step 1: Delete the cloud backend environment

The most effective way to delete all the associated backend resources from the cloud is by using the Amplify CLI from the root of your project.

`amplify delete`

### Step 2: Delete the app from the AWS Amplify console

After the backend resources have been successfully deleted, you should also remove the application from the AWS Amplify Console.

1. Open the AWS Amplify console.
2. In the list of applications, choose the name of the app you want to delete.
3. On the app's page, find the Actions dropdown menu and select Delete app.
4. You will be prompted to confirm the deletion

### Step 3: Clean up your local project

To complete the reset, you need to remove the Amplify-related files and directories from your local project.

1.  `rm -rf amplify/`
2.  `rm amplify.yml`
3.  `rm src/aws-exports.js`

### Troubleshooting deletion issues

Sometimes, amplify delete can fail if AWS CloudFormation encounters an issue while deleting the resources. If this happens, you may need to manually delete the resources.

1. Go to the AWS CloudFormation Console: Find the root stack for your Amplify project. The name is typically in the format `amplify-<application-name>-<backend-environment-name>-<random-number>`

2. Delete the CloudFormation Stack: Attempt to delete the root stack. If it has nested stacks, you might need to delete them first.

3. Delete the S3 Bucket: Amplify creates an S3 bucket for deployments. Its name usually follows the pattern `amplify-<application-name>-<backend-environment-name>-<random-number>-deployment`. Find and delete this bucket in the S3 console.

4. Retry Deleting the App: Once the CloudFormation stack and S3 bucket are removed, return to the AWS Amplify console and try deleting the app again.
After following these steps, your project will be completely free of its previous Amplify configuration, allowing you to start fresh.
