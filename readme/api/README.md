# ⛅️ ⚛︎ Amplify React App: 🛠️ Developer Guide

[Developer Guide home](../README.dev.md)

## Cloud Resources: API’s

In Amplify Gen 2, you can create backend resources like REST APIs declaratively using TypeScript and the AWS CDK. This provides a more powerful and maintainable alternative to the `amplify add api` command from Gen 1.

Here is how to create a REST API with a Lambda function backend.

### 1. Define the Lambda Function Handler

Create a file for your Lambda function's code. This example includes simple routing logic based on the URL path.

File: `amplify/api/handler.ts`
```typescript
import type { APIGatewayProxyHandler } from 'aws-lambda';

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('event', event);
  const path = event.path.split('/').pop() || 'index';
  let body = {};

  if (path === 'home' || path === 'index' || path === '') {
    body = { message: 'Hello from the Home route!' };
  } else {
    body = { message: `You have hit the ${path} route.` };
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
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
