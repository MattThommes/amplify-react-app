# ⛅️ ⚛︎ 🚀 Amplify React App: 🛠️ Developer Guide

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
    > **Note**: This template is built for Amplify **Gen 1**. If you have a newer version of the CLI, it may prompt or default you to Gen 2. Try to continue with Gen 1 as outlined in the setup guide.
*   **Check Amplify version**: `amplify version`
    * 14.2.4 (as of January 23, 2026)
*   [Lower priority] **Java Development Kit (JDK)**: (e.g., OpenJDK 17 or later). This is required by the Amplify CLI to run local mocking for services like DynamoDB when using `amplify mock`. You can install it via tools like Homebrew (`brew install openjdk@17`) or Chocolatey (`choco install openjdk --version=17`).
    
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

### Project specific setup

Open [Makefile](../Makefile).

After cloning the project, you can run the included setup script to automate most of the initial configuration. This is safe to run repeatedly.

`make setup`

⚠️ Stop other local apps running on port 3000/3001 so there is no conflict.

Start the app locally to see it in the browser:

`make run-dev`

You will notice API calls will fail. We will setup the API shortly.

* http://localhost:3001/
* `(failed)net::ERR_CONNECTION_REFUSED`

Does not need to be done right now, but anytime **after running setup**, you can pull down the latest changes from the upstream repo by running this script:

`make sync-upstream`

Cleanup as a good practice for npm taking up a lot of disk space:

`make cleanup`

Optional but good to do early for new projects: update these files to include your specific project related information:

1.  [README.md](../README.md)
    1. The setup script will adjust the header automatically.
    2. Keep this file though: [README.dev.md](README.dev.md) – for general app updates and instructions synced in via upstream.
2.  [package.json](../package.json) (name and description)
3.  [public/index.html](../index.html) (`<title>` and `<meta name="description"`)
4.  [public/manifest.json](../public/manifest.json) (`short_name` and `name`)

Commit your project-specific updates:

*   `git add .`
*   `git commit -m "Project specific updates"`

Stop any other apps running locally on ports 3000 or 3001, otherwise the next commands will conflict.

## Amplify setup

### AWS CLI access

Before initializing Amplify, ensure your AWS credentials are set up on your local machine. The Amplify CLI uses the same credential provider chain as the AWS CLI and other SDK’s, looking for credentials in environment variables or your AWS credentials file (commonly `~/.aws/credentials`).

If you haven’t configured credentials, you can run `aws configure` to create a profile.

### Initialize new Amplify app

⚠️ Update file [amplify/.config/project-config.json](../amplify/.config/project-config.json). This is a critical first step to avoid using the template name (“templatetest20251130”) for the Amplify app.

Change `projectName` to your unique project name.

Run `make amplify-init`

```
% amplify init
Note: It is recommended to run this command from the root of your app directory
? Enter a name for the environment (dev) 
```

Enter “staging” for the environment. This will be our first environment. We will also create “master” for production.

Default editor – it does not matter what you pick:

```
? Choose your default editor: None
```

Authentication method breakdown:

```
Using default provider  awscloudformation
? Select the authentication method you want to use: (Use arrow keys)
❯ AWS profile
AWS access keys
```

Choose `AWS profile`. Then pick a local profile:

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
Adding backend environment staging to AWS Amplify app: d1j6aypbzelxhd

Deploying resources into staging environment. This will take a few minutes. ⠇
Deploying root stack templatetest20251130 [ ---------------------------------------- ] 0/4
        amplify-templatetest20251130-… AWS::CloudFormation::Stack     CREATE_IN_PROGRESS             Sun Jan 18 
        DeploymentBucket               AWS::S3::Bucket                CREATE_IN_PROGRESS             Sun Jan 18 
        UnauthRole                     AWS::IAM::Role                 CREATE_IN_PROGRESS             Sun Jan 18 
        AuthRole                       AWS::IAM::Role                 CREATE_IN_PROGRESS             Sun Jan 18 
```

Eventually (few seconds):

```
Deployment completed.
Deploying root stack templatetest20251130 [ ==========------------------------------ ] 1/4
        amplify-templatetest20251130-… AWS::CloudFormation::Stack     CREATE_IN_PROGRESS             Sun Jan 18 
        DeploymentBucket               AWS::S3::Bucket                CREATE_COMPLETE                Sun Jan 18 
        UnauthRole                     AWS::IAM::Role                 CREATE_IN_PROGRESS             Sun Jan 18 
        AuthRole                       AWS::IAM::Role                 CREATE_IN_PROGRESS             Sun Jan 18 

Deployment state saved successfully.
✔ Initialized provider successfully.
Browserslist: browsers data (caniuse-lite) is 11 months old. Please run:
  npx update-browserslist-db@latest
  Why you should do it regularly: https://github.com/browserslist/update-db#readme
✅ Initialized your environment successfully.
✅ Your project has been successfully initialized and connected to the cloud!
Some next steps:
...
```

You should now see:

```
% make amplify-status
amplify status

    Current Environment: staging
    
┌──────────┬───────────────┬───────────┬─────────────────┐
│ Category │ Resource name │ Operation │ Provider plugin │
└──────────┴───────────────┴───────────┴─────────────────┘
```

In Amplify you should see “staging” under Backend Environments, no branches yet, no functions, and no API’s.

### Amplify environment setup

Run `make amplify-envs`, and you should see:

```
| Environments |
| ------------ |
| *staging     |
```

As mentioned, you should now see your app in the [AWS Amplify console](https://us-east-1.console.aws.amazon.com/amplify/apps).

If you do not see the “master” environment, run `make amplify-envs-add-prod`.

Choose the same local AWS profile as earlier.

It should begin deploying the “prod” environment without any further prompts.

Under “Backend Environments” in the Amplify console for the app, you should see “master” and “staging.”

Under S3 you should see new buckets created today named something like:

`amplify-matt-test-20260118-master-a5889-deployment`

`amplify-matt-test-20260118-staging-704e7-deployment`

Under “Branches” you should still not see anything yet.

To switch environments locally, run `make amplify-env-switch-prod` or `make amplify-env-switch-staging`.

⚠️ Keep an eye out for misaligned environments with Amplify and git. This may not cause any issues, but something I saw and to keep in mind. Example:

```
% git branch                                
master
* staging

% make amplify-envs
  amplify env list

| Environments |
| ------------ |
| staging      |
| *master      |
```

### Amplify branch setup

Connect your first branch. Choose the repo and master or main branch.

Under “Auto-detected frameworks,” ignore this showing: “Amplify Gen 2.” It will still use Gen 1 since that is what the code is setup for.

Under “Service role,” Select “Use an existing service role.”

Pick “amplifyconsole-backend-role.”

Click Next, then “Save and deploy.”

You should now see “master” branch appearing under Branches, and it should be deploying.

Set up staging next. If you have not yet locally, run `git checkout -b staging` then `git push origin staging`. Wait a minute or so for Amplify to see the new branch.

Connect the staging branch to Amplify the same way you did for master. Staging should then also appear under Branches, and start deploying.

### Configuring the API & function

You will notice:

```
% make amplify-status                       
amplify status

    Current Environment: master
    
┌──────────┬───────────────┬───────────┬─────────────────┐
│ Category │ Resource name │ Operation │ Provider plugin │
└──────────┴───────────────┴───────────┴─────────────────┘
```

Now we need to add the API and function to get API/Ajax requests working.

Run `make amplify-api-add`.

```
% amplify api add
? Select from one of the below mentioned services: 
  GraphQL 
❯ REST 

? Select from one of the below mentioned services: REST
✔ Provide a friendly name for your resource to be used as a label for this category in the project: · matttest20260122

✔ Provide a path (e.g., /book/{isbn}): · /

Only one option for [Choose a Lambda source]. Selecting [Create a new Lambda function].
? Provide an AWS Lambda function name: matttest202601228c62084b
? Choose the runtime that you want to use: NodeJS

? Choose the function template that you want to use: (Use arrow keys)
  AppSync - GraphQL API request (with IAM) 
  CRUD function for DynamoDB (Integration with API Gateway) 
  GraphQL Lambda Authorizer 
❯ Hello World 

? Do you want to configure advanced settings? (y/N) n
? Do you want to edit the local lambda function now? (Y/n) n

...

isions them in the cloud
✅ Succesfully added the Lambda function locally
✔ Restrict API access? (Y/n) · no

✔ Do you want to add another path? (y/N) · no
✅ Successfully added resource matttest20260122 locally
```

You should now see:

```
% make amplify-status
amplify status

    Current Environment: master
    
┌──────────┬──────────────────────────┬───────────┬───────────────────┐
│ Category │ Resource name            │ Operation │ Provider plugin   │
├──────────┼──────────────────────────┼───────────┼───────────────────┤
│ Api      │ matttest20260122         │ Create    │ awscloudformation │
├──────────┼──────────────────────────┼───────────┼───────────────────┤
│ Function │ matttest202601228c62084b │ Create    │ awscloudformation │
└──────────┴──────────────────────────┴───────────┴───────────────────┘
```

Run `make amplify-push` to push up the function change **for both master and staging environments**. You should see deployments happening:

```
Deploying resources into master environment. This will take a few minutes. ⠴
Deploying root stack matt [ ---------------------------------------- ] 0/3
        amplify-matt-test-20260122-ma… AWS::CloudFormation::Stack     UPDATE_IN_PROGRESS             Sat Jan 24 
        functionmatttest202601228c620… AWS::CloudFormation::Stack     CREATE_IN_PROGRESS             Sat Jan 24 
Deploying api matttest20260122 [ ---------------------------------------- ] 0/5
Deploying function matttest202601228c62084b [ ---------------------------------------- ] 0/3
        LambdaExecutionRole            AWS::IAM::Role                 CREATE_IN_PROGRESS             Sat Jan 24
```

⚠️ Remember – this needs to be done for both master and staging Amplify environments!

`make amplify-env-switch-staging && make amplify-push`

⚠️ Verify in AWS Lambda and API Gateway that the new resources appear. 

Run `make amplify-status` again and make sure the output has No Change appearing for the resources, **under both environments**:

```
    Current Environment: master
    
┌──────────┬──────────────────────────┬───────────┬───────────────────┐
│ Category │ Resource name            │ Operation │ Provider plugin   │
├──────────┼──────────────────────────┼───────────┼───────────────────┤
│ Api      │ matttest20260122         │ No Change │ awscloudformation │
├──────────┼──────────────────────────┼───────────┼───────────────────┤
│ Function │ matttest202601228c62084b │ No Change │ awscloudformation │
└──────────┴──────────────────────────┴───────────┴───────────────────┘

REST API endpoint: https://uqvnlcqpf9.execute-api.us-east-1.amazonaws.com/master
```

Update the local API server script to reference the function name:

```
// Import the handler function from your Lambda's index.js
const { handler } = require('./amplify/backend/function/matttest202601228c62084b/src/index');
```

Update the App.jsx constant for the API:

```
// Define the API name as a constant to avoid magic strings.
const API_NAME = 'matttest20260122';
```

In the function index file, enable CORS requests: 

```
    //  Uncomment below to enable CORS requests
    //  headers: {
    //      "Access-Control-Allow-Origin": "*",
    //      "Access-Control-Allow-Headers": "*"
    //  },
```

Push up changes so they can redeploy.

Start the local API server:

`make start-local-api`

Ensure API/Ajax requests are returning 200.

### Rewrite rule

For single-page apps (SPA’s), you need a rewrite rule to serve `/index.html` for all client-side routes. This also helps avoid a trailing slash at the end of the path in the URL and API requests, example: https://master.d1j6aypbzelxhd.amplifyapp.com/about/

In the “Rewrites and redirects” section, Amplify often creates a default rule for you. If not, or if you need to edit it, click “Edit” to open the JSON editor and ensure it contains the following rule:

```json
[
  {
    "source": "/<*>",
    "status": "404-200",
    "target": "/index.html"
  }
]
```

This one is not there by default, and is good to add to avoid the trailing slash issue:

```
{
    "source": "</^((?!\\.(css|gif|ico|jpg|js|png|txt|svg|woff|ttf)$).)*$/>",
    "status": "200",
    "target": "/index.html"
}
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

🚨 If at anytime you think the Amplify setup is messed up, run `amplify delete` to delete the entire app. This will also remove any cloud resources it created. If you do this, it will also delete the amplify directory locally, so you will have to re-sync your code with git origin/remote.

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

Sometimes, `amplify delete` can fail if AWS CloudFormation encounters an issue while deleting the resources. If this happens, you may need to manually delete the resources.

1. Go to the AWS CloudFormation Console: Find the root stack for your Amplify project. The name is typically in the format `amplify-<application-name>-<backend-environment-name>-<random-number>`

2. Delete the CloudFormation Stack: Attempt to delete the root stack. If it has nested stacks, you might need to delete them first.

3. Delete the S3 Bucket: Amplify creates an S3 bucket for deployments. Its name usually follows the pattern `amplify-<application-name>-<backend-environment-name>-<random-number>-deployment`. Find and delete this bucket in the S3 console.

4. Retry Deleting the App: Once the CloudFormation stack and S3 bucket are removed, return to the AWS Amplify console and try deleting the app again.
After following these steps, your project will be completely free of its previous Amplify configuration, allowing you to start fresh.
