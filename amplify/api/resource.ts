import { Stack } from 'aws-cdk-lib';
import {
  LambdaIntegration,
  RestApi,
} from 'aws-cdk-lib/aws-apigateway';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';

export const createRestApi = (stack: Stack) => {
  const apiFunction = new Function(stack, 'ApiFunction', {
    runtime: Runtime.NODEJS_20_X,
    handler: 'handler.handler',
    code: Code.fromAsset('./amplify/api'),
  });
  const restApi = new RestApi(stack, 'AmplifyReactAppApi');
  restApi.root.addProxy({
    defaultIntegration: new LambdaIntegration(apiFunction),
  });
  return restApi;
};
