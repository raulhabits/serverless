'use strict';
const sdk_layer = require('/opt/nodejs/index.js');

const express = require('express');
const app = express();
const serverless = require('serverless-http');


app.get('/weather', (req, res) => {
    res.json(sdk_layer.exchange());
});

/*
app.all('*', (req, res) => { 
    const path = req.path;
    const method = req.method;
    res.status(400).json({
        statusCode: 400,
        message: `Bad request syntax or unsupported method. Request path: ${path}. HTTP method: ${method}`
    }); 
  }); 
  */

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
