exports.handler = async (event) => {

    console.log(event['Records'][0]['body']);
    
    // TODO implement
    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};
