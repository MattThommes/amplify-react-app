/*
 * A lightweight Express.js server for local API development.
 *
 * This server mimics AWS API Gateway and Lambda integration, allowing the frontend
 * to connect to a local endpoint without needing to run `amplify push` or `amplify mock`.
 *
 * How to use:
 * 1. `cd` into this directory: `amplify/backend/function/amplifyreactappapirest1/src`
 * 2. Install dependencies: `npm install express cors` (run this once)
 * 3. Run the server: `node _localApiServer.js`
 *
 * The local API will be available at http://localhost:3001.
 */
const express = require('express');
const cors = require('cors');

// Import the handler function from your Lambda's index.js
const { handler } = require('./amplify/backend/function/amplifyreactappapirest1/src/index');

const app = express();
const port = 3001;

// Enable CORS to allow requests from your React app (which runs on a different port)
app.use(cors());

// Middleware to parse JSON bodies, which is what API Gateway does
app.use(express.json());

// A catch-all route that forwards all requests to the Lambda handler
app.use(async (req, res) => {
    console.log(`[Local Server] Received ${req.method} request for ${req.originalUrl}`);

    // Construct the event object to simulate what API Gateway sends to Lambda
    const event = {
        httpMethod: req.method,
        path: req.path,
        queryStringParameters: req.query,
        headers: req.headers,
        body: req.body ? JSON.stringify(req.body) : null, // Lambda expects a stringified body
    };

    try {
        // Invoke the handler
        const response = await handler(event);

        // Send the response back to the client
        if (response.headers) {
            res.set(response.headers);
        }
        res.status(response.statusCode).send(response.body);
    } catch (error) {
        console.error("Error invoking Lambda handler:", error);
        res.status(500).send({ error: "Internal Server Error" });
    }
});

app.listen(port, () => {
    console.log(`[Local Server] Mock API running at http://localhost:${port}`);
    console.log('Your React app can now connect to this endpoint.');
});