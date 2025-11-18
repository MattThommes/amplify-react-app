import { defineBackend, defineFunction } from '@aws-amplify/backend';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';

// define the Lambda function that will back the API
const apiFunction = defineFunction({
  // this will be the name of the function in the Amplify backend
  name: 'api-function',
  // this is the path to the handler file in your project
  entry: './amplify/api/handler.ts',
});

export const backend = defineBackend({
  // add the function to the backend
  apiFunction,
  // create the REST API and integrate the Lambda function
  myRestApi: (stack) => {
    const api = new RestApi(stack, 'myRestApi');
    api.root.addProxy({ defaultIntegration: new LambdaIntegration(apiFunction.resources.lambda) });
  },
});
