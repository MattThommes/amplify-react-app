# ⛅️ ⚛︎ Amplify React App: 🛠️ Developer Guide

[Developer Guide home](../README.dev.md)

## Cloud Resources: API’s

In Amplify Gen 1, you use the Amplify CLI to create and configure backend resources like REST APIs backed by AWS Lambda.

Here is how to create a REST API with a Lambda function backend.

### 1. Create the API and Lambda Function

1.  Run the `add api` command from your project root:
    ```bash
    amplify add api
    ```
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

### 2. Edit the Lambda Function Handler

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

### 2. Define the API Gateway and Lambda Resources

Create a file to define the API Gateway and connect it to the Lambda function.

File: `amplify/api/resource.ts`

```typescript
import { defineBackend } from '@aws-amplify/backend';
import { Stack } from 'aws-cdk-lib';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';

export const api = defineBackend({
    myRestApi: (stack: Stack) => {
        const apiFunction = new Function(stack, 'ApiFunction', {
            runtime: Runtime.NODEJS_20_X,
            handler: 'handler.handler',
            code: Code.fromAsset('./amplify/api'),
        });

        const restApi = new RestApi(stack, 'AmplifyReactAppApi');
        restApi.root.addProxy({
            defaultIntegration: new LambdaIntegration(apiFunction),
        });
    },
});
```

### 3. Register the API with Your Backend

Finally, add your new API definition to the main backend entry point.

File: `amplify/backend.ts`

```typescript
import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { api } from './api/resource';

defineBackend({ auth, data, ...api.resources });
```

### 4. Deploy and Test

Run `npx ampx sandbox` to deploy these resources to your personal cloud environment. The API endpoint will be automatically configured for your frontend in `src/amplify_outputs.json`.

### 5. Accessing your API from your frontend code

You can now call your REST API using the `aws-amplify/api` library. The `App.jsx` file already contains code to do this. It uses the `get` method and dynamically calls the API based on the current page route.

```javascript
import { get } from '@aws-amplify/api';
// ...
const restOperation = get({
    apiName: 'AmplifyReactAppApi', // This must match the name given in amplify/api/resource.ts
    path: '/some-path'
});
const response = await restOperation.response;
console.log('GET call succeeded: ', await response.body.json());
```
