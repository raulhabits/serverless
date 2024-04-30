/*
exports.handler = async (event) => {
    // TODO implement

    return response;
};
*/

const express = require('express');
const app = express();
const serverless = require('serverless-http');

const response = {
    statusCode: 200,
    message: 'Hello from Lambda',
};

app.get('/hello', (req, res) => {
    res.json(response);
});

const handler = serverless(app);

const startServer = async () => {
    app.listen(3000, () => {
      console.log("listening on port 3000!");
    });
}

startServer();

module.exports.handler = (event, context, callback) => {
    const response = handler(event, context, callback);
    return response;
};