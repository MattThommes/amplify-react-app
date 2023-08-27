/* Amplify Params - DO NOT EDIT
	ENV
	REGION
Amplify Params - DO NOT EDIT */

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);

    bodyOutput = JSON.stringify('Hello from Lambda!');

    if (event.path.match(/^\/about\/?/)) {
        bodyOutput = JSON.stringify('Hello from Lambda! This is the about page.');
    }

    return {
        statusCode: 200,
        body: JSON.stringify(bodyOutput),
    };
};