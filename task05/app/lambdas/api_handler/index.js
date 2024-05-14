const { v4: uuidv4 } = require("uuid");
const AWS = require("aws-sdk");

const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.table_name;


// event example
/*
event = {
    "principalId": int         // id pf the principal
    "content": {any Map<String, String>} 
}
*/

exports.handler = async (event) => {
    console.log(event);
    let date = new Date();
	const params = {
		TableName: tableName,
		Item: {
			id: uuidv4(),
            createdAt: date.toISOString(),
			principalId: event.principalId,
			body: event.content
		}
	};
	try {
		const data = await docClient.put(params).promise();
        console.log(data.Item);
		return {
            statusCode: 201,
            event
        };
	} catch (err) {
		return JSON.stringify(err, null, 2);
	}
};