
/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);
    
    let message = 'Hello from Lambda';
    const path = event.path || '';

    // Check if the path ends with page-1 or page-2 to handle potential stage prefixes
    if (path.endsWith('/page-1')) {
        message = 'Hello from Lambda Page 1.';
    } else if (path.endsWith('/page-2')) {
        message = 'Hello from Lambda Page 2.';
    }

    return {
        statusCode: 200,
        headers: {
             "Access-Control-Allow-Origin": "*",
             "Access-Control-Allow-Headers": "*"
        },
        body: JSON.stringify({message: message}),
    };
};
