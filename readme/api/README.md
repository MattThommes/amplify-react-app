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

File: `amplify/backend/function/amplifyreactappapirest1/src/index.js`

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

Before deploying to the cloud, you can test your new API and Lambda function locally.

#### CLI testing

The Amplify CLI provides a way to run a local mock server for your backend resources.

To test your API locally in the CLI, run: `amplify mock function amplifyreactappapirest1`

This will use the mock event in amplify/backend/function/amplifyreactappapirest1/src/event.json.

Example output:

```
% amplify mock function amplifyreactappapirest1
✔ Provide the path to the event JSON object relative to /Users/mattthommes/Documents/dev/amplify-react-app/amplify/backend/function/amplifyreactappapirest1 · src/event.json

Ensuring latest function changes are built...
Starting execution...
(node:95524) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `amplify --trace-deprecation ...` to show where the warning was created)
EVENT: {"httpMethod":"GET","path":"/amplifyreactappapirest1","queryStringParameters":{"limit":"10"},"headers":{"Content-Type":"application/json"},"body":null}
✅ Result:
{
  "statusCode": 200,
  "body": "\"Hello from Lambda!\""
}
Finished execution.
```

Note: For a GraphQL API, the command would be `amplify mock api` instead.

#### Local server testing

To develop using a completely local API without needing to push API and Lambda resources to the cloud, you can use the custom Express server script `_localApiServer.cjs`.

This script wraps your Lambda handler in a lightweight Express server, mimicking API Gateway's event structure.

**How to use:**

1.  **Start the local API server:**
    ```bash
    npm run start:api
    ```
    This runs the server on `http://localhost:3001`.

2.  **Run your frontend:**
    ```bash
    npm run dev
    ```
    The application is configured (in `src/App.jsx`) to point to `localhost:3001` when running in development mode.

This setup allows you to modify `amplify/backend/function/amplifyreactappapirest1/src/index.js` and see changes instantly in your app without deploying.

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
