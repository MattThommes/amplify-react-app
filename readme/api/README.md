# ⛅️ ⚛︎ Amplify React App: 🛠️ Developer Guide

[Developer Guide home](../README.dev.md)

## Cloud resources: API’s

In Amplify Gen 1, you use the Amplify CLI to create and configure backend resources like REST APIs backed by AWS Lambda.

Here is how to create a REST API with a Lambda function backend.

### 1. Create the API and Lambda function

1.  Run the `amplify add api` command from your project root.

2.  Follow the CLI prompts:
    *   Please select from one of the below mentioned services: **REST**
    *   Provide a friendly name for your resource to be used as a label for this category in the project: **(e.g., AmplifyReactAppApi)**
    *   Provide a path: **(e.g., /items)** /backend
    *   Provide an AWS Lambda function name: AmplifyReactAppApiFunction
    *   Choose the function runtime that you want to use: **NodeJS**
    *   Choose the function template that you want to use: **Hello World**
    *   Do you want to configure advanced settings? **No**
    *   Do you want to edit the local lambda function now? **Yes**

3.  The CLI will open the new Lambda function's handler file. It will be located at `amplify/backend/function/[YOUR_FUNCTION_NAME]/src/index.js`.

### 2. Edit the Lambda function handler

You can modify the boilerplate `index.js` file to add your own logic. Here is an example that returns a simple JSON message.

File: `amplify/backend/function/AmplifyReactAppApiFunction/src/index.js`

```javascript
exports.handler = async (event) => {
    console.log('event', event);
    const body = { message: 'Hello from the API!' };

    const response = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*"
        },
        body: JSON.stringify(body),
    };
    return response;
};
```

### 3. Test locally

Before deploying to the cloud, you can test your new API and Lambda function locally. The Amplify CLI provides a way to run a local mock server for your backend resources.

To test your API locally, run: `amplify mock api`

This will start a local server that emulates your API. When your frontend application is running locally (with `./run.sh`), it will automatically connect to this mock endpoint. This allows you to test your API calls and the associated Lambda function without needing to run amplify push.

### 4. Deploy to the cloud

When you run `amplify status` after creating a new API + Lambda, you should see:

┌──────────┬──────────────────────────────┬───────────┬───────────────────┐
│ Category │ Resource name                │ Operation │ Provider plugin   │
├──────────┼──────────────────────────────┼───────────┼───────────────────┤
│ Function │ testtemplate2025112973c868f0 │ Create    │ awscloudformation │
├──────────┼──────────────────────────────┼───────────┼───────────────────┤
│ Api      │ testapi20251129b             │ Create    │ awscloudformation │
└──────────┴──────────────────────────────┴───────────┴───────────────────┘

Once you are satisfied with your local testing and would like to create the cloud resources, you can deploy your API to your AWS environment: `amplify push`
