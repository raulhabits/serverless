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

exports.handler = async (e) => {
	
    let date = new Date();
	let event = {
			id: uuidv4(),
			createdAt: date.toISOString(),
			principalId: e.principalId,
			body: e.content
			};
    console.log(event);
	const params = {
		TableName: tableName,
		Item: event
	};
	try {
		const data = await docClient.put(params).promise();
		return {
            statusCode: 201,
            event
        };
	} catch (err) {
		return JSON.stringify(err, null, 2);
	}
};
