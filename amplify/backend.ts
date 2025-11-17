import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { createRestApi } from './api/resource';

// The defineBackend function is the entry point for defining your backend resources.
// You can reference other resources, like auth and data, in your backend definition.
// @ts-ignore
defineBackend({ auth, data, myRestApi: createRestApi() });
