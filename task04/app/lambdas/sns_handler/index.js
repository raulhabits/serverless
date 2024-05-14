exports.handler = async (event) => {

    console.log(event['Records'][0]['Sns']['Message']);
    
    // TODO implement
    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};
