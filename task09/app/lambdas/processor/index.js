const axios = require('axios').default;
const instance = axios.create();
instance.defaults.timeout = 5000;


const { v4: uuidv4 } = require("uuid");
const AWS = require("aws-sdk");

const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.target_table;

async function get() {
    response = await instance.get("https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&hourly=temperature_2m&format=json&timeformat=unixtime");
    return response.data;
}


exports.handler = async (event) => {
    let forecast = await get();

    let content = {
        id: uuidv4(),
        forecast
    };

    const targetData = {
        TableName: tableName,
        Item: content
    };
    console.log('targetData', targetData);

    try {
        const data = await docClient.put(targetData).promise();
        return content;
    } catch (err) {
        return JSON.stringify(err, null, 2);
    }

};
