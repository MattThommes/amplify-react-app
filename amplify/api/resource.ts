import { ConstructFactory, ResourceProvider, FunctionResources } from '@aws-amplify/plugin-types';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { resolve } from '@aws-amplify/backend';

export const createRestApi = (
  apiFunction: ResourceProvider<FunctionResources>
): ConstructFactory<ResourceProvider<{myRestApi: RestApi}>> => ({
  getInstance: (props) => {
    const { stack } = resolve.getInstance(props);
    const api = new RestApi(stack, 'myRestApi');
    api.root.addProxy({
      defaultIntegration: new LambdaIntegration(apiFunction.resources.lambda),
    });
    return { resources: { myRestApi: api } };
  },
});
