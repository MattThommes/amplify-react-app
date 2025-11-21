import { defineBackend, defineFunction } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { createRestApi } from './api/resource';

const apiFunction = defineFunction({
  // this will be the name of the function in the Amplify backend
  name: 'api-function',
  // this is the path to the handler file in your project
  entry: './amplify/api/handler.ts',
});

defineBackend({
  auth,
  data,
  myRestApi: createRestApi(apiFunction),
});
