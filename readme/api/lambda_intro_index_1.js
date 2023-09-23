/* Amplify Params - DO NOT EDIT
	ENV
	REGION
Amplify Params - DO NOT EDIT */

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);

    var path = event.path;

    bodyOutput = JSON.stringify('Hello from Lambda! Path is ' + path + '.');

    if (event.path.match(/^\/backend\/about\/?/)) {
        bodyOutput = JSON.stringify('Hello from Lambda! This is the About page.');
    }

    return {
        statusCode: 200,
        body: JSON.stringify(bodyOutput),
    };
};