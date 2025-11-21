import { ConstructFactory, ResourceProvider } from '@aws-amplify/plugin-types';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Stack } from 'aws-cdk-lib';
import { Function } from 'aws-cdk-lib/aws-lambda';

export const createRestApi = (
  apiFunction: ResourceProvider<Function>
): ConstructFactory<RestApi> => ({
  getInstance: ({ stack }) => {
    const api = new RestApi(stack, 'myRestApi');
    api.root.addProxy({
      defaultIntegration: new LambdaIntegration(apiFunction.resources.lambda),
    });
    return api;
  },
});
