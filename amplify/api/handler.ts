import type { APIGatewayProxyHandler } from 'aws-lambda';

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('event', event);

  // This is a simple router logic.
  // You can replace it with a more robust solution like express.js
  const path = event.path.split('/').pop() || 'index';

  let body = {};

  if (path === 'home' || path === 'index' || path === '') {
    body = { message: 'Hello from the Home route!' };
  } else if (path === 'page-1') {
    body = { message: 'You have reached Page 1.' };
  } else if (path === 'page-2') {
    body = { message: 'Welcome to Page 2.' };
  } else {
    body = { message: `You have hit the ${path} route.` };
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
};