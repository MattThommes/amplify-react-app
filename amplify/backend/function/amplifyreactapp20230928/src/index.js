

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
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: JSON.stringify(bodyOutput),
    };
};