const { v4: uuidv4 } = require("uuid");
const AWS = require("aws-sdk");

const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.target_table;

exports.handler = async (event) => {

    let eventDetail = event['Records'][0];
    let date = new Date();

    let content = {
        id: uuidv4(),
        modificationTime: date.toISOString(),
        itemKey: eventDetail.dynamodb.NewImage.key.S
    };

    if (eventDetail.eventName === 'INSERT') {
        content['newValue'] = {
            key: eventDetail.dynamodb.NewImage.key.S,
            value: Number(eventDetail.dynamodb.NewImage.value.N)
        };
    } 
    if (eventDetail.eventName === 'MODIFY') {
        content['updatedAttribute'] = 'value';
        content['oldValue'] = Number(eventDetail.dynamodb.OldImage.value.N); 
        content['newValue'] = Number(eventDetail.dynamodb.NewImage.value.N);
    }
    console.log(eventDetail.eventName);
    console.log('eventDetail.dynamodb.OldImage', eventDetail.dynamodb.OldImage);
    console.log('eventDetail.dynamodb.NewImage.', eventDetail.dynamodb.NewImage.key.S, eventDetail.dynamodb.NewImage.value.N);

	const targetData = {
		TableName: tableName,
		Item: content
	};
    console.log('targetData', targetData);

	try {
		const data = await docClient.put(targetData).promise();
		return {
            statusCode: 201,
            event
        };
	} catch (err) {
		return JSON.stringify(err, null, 2);
	}
};
