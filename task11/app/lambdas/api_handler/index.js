'use strict';

const express = require('express');
const app = express();
const serverless = require('serverless-http');

const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient();

const { CognitoIdentityProviderClient, AdminInitiateAuthCommand, SignUpCommand, AdminConfirmSignUpCommand } = require("@aws-sdk/client-cognito-identity-provider");
const { v4: uuidv4 } = require("uuid");


const cupId = process.env.cup_id;
const cupClientId = process.env.cup_client_id;

const tablesTableDynamodb = process.env.tables_table;
const reservationsTableDynamodb = process.env.reservations_table;

async function getAllItems(tableName) {
    let items = [];
    let params = {
        TableName: tableName,
    };

    // Scan the table to get all items
    do {
        try {
            const data = await docClient.scan(params).promise();
            items = items.concat(data.Items);
            params.ExclusiveStartKey = data.LastEvaluatedKey; // Check if there are more items to retrieve
        } catch (err) {
            console.error("Unable to scan the table. Error:", JSON.stringify(err, null, 2));
            return;
        }
    } while (params.ExclusiveStartKey); // Continue until there are no more items

    return items;
}

app.use((req, res, next) => {
    res.set({
            "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
            "Accept-Version": "*"
        });
    next(); // Move to the next middleware or route handler
});


app.post('/signin', async (req, res) => {

    const body = JSON.parse(req.apiGateway.event.body);

    const params = {
        AuthFlow: 'ADMIN_USER_PASSWORD_AUTH',
        UserPoolId: cupId,
        ClientId: cupClientId,
        AuthParameters: {
            USERNAME: body.email,
            PASSWORD: body.password
        }
    };

    const client = new CognitoIdentityProviderClient({});


    try {

        const response = await client.send(new AdminInitiateAuthCommand(params));
        console.log('AdminInitiateAuthCommand', response);
        if (response && response.AuthenticationResult && response.AuthenticationResult.AccessToken) {
            res.status(200).send({
                accessToken: response.AuthenticationResult.IdToken
            });
            return;
        }
    } catch (err) {
        res.status(400).send(JSON.stringify(err, null, 2));
    }

    res.status(400).send();

});

app.post('/signup', async (req, res) => {


    const client = new CognitoIdentityProviderClient({});

    const body = JSON.parse(req.apiGateway.event.body);

    const signUpCommand = new SignUpCommand({
        UserPoolId: cupId,
        ClientId: cupClientId,
        Username: body.email,
        Password: body.password,
        MessageAction: 'SUPPRESS',
        UserAttributes: [{ Name: "name", Value: body.firstName }, { Name: "email", Value: body.email }],
    });

    const adminConfirmSignUpCommand = new AdminConfirmSignUpCommand({ // AdminConfirmSignUpRequest	
        UserPoolId: cupId,
        ClientId: cupClientId,
        Username: body.email
    });

    try {

        const signUpCommandResponse = await client.send(signUpCommand);
        console.log('SignUpCommand', signUpCommandResponse);

        const adminConfirmSignUpCommandResponse = await client.send(adminConfirmSignUpCommand);
        console.log('adminConfirmSignUpCommand', adminConfirmSignUpCommandResponse);

        res.status(200).send("ok");
        return;
    } catch (err) {
        res.status(400).send(JSON.stringify(err, null, 2));
    }

    res.status(400).send();

    /*
        const signupRequest = {
            "UserPoolId": cupClientId,
            "Username": req.body.email,
            "DesiredDeliveryMediums": [
                "SMS"
            ],
            "MessageAction": "SUPPRESS",
            "TemporaryPassword": req.body.password,
            "UserAttributes": [
                {
                    "Name": "firstName",
                    "Value": req.body.firstName
                },
                {
                    "Name": "lastName",
                    "Value": req.body.lastName
                },
                {
                    "Name": "email",
                    "Value": req.body.email
                }
            ]
        }
    
        AWS.CognitoIdentityServiceProvider.AdminCreateUser(signupRequest, (err, data)  => {
            if (err) {
                res.status(400).send(err);
            }
            else {
                res.send(200).send("Created");   
            }
        });
        */
});

app.post('/tables', async (req, res) => {

    const body = JSON.parse(req.apiGateway.event.body);
    let data = { ...body, id: body.id.toString(), tableNumber: body.number };
    

    console.log("tablesTableDynamodb", tablesTableDynamodb, data);

    const targetData = {
        TableName: tablesTableDynamodb,
        Item: data
    };

    try {
        const data = await docClient.put(targetData).promise();
        console.log(data);
        res.status(200).send({
            id: body.id
        });
    } catch (err) {
        res.status(400).send(JSON.stringify(err, null, 2));
    }


});

app.post('/reservations', async (req, res) => {

    const receivedBody = JSON.parse(req.apiGateway.event.body);
    
    let body = { ...receivedBody, reservationDate: receivedBody.date };
    console.log("AddReservation", body);

    let params = {
        TableName: tablesTableDynamodb,
        FilterExpression: `tableNumber = :value`,
        ExpressionAttributeValues: {
            ':value': body.tableNumber,
        },
    };

    console.log("AddReservation.tablesTableDynamodb.params", params);
    try {
        let queryResult = await docClient.scan(params).promise();

        console.log("SUCCESSFULL GET", queryResult);

        if (queryResult?.Items?.length <= 0) {
            res.status(400).send();
            return;
        }

        params = {
            TableName: reservationsTableDynamodb,
            FilterExpression: 'tableNumber = :tableNumber and reservationDate = :dateVal AND ((slotTimeStart <= :param1 AND slotTimeEnd > :param1) OR (slotTimeStart < :param2 AND slotTimeEnd >= :param2))',
            ExpressionAttributeValues: {
                ':tableNumber': body.tableNumber,
                ':dateVal': body.date,
                ':param1': body.slotTimeStart,
                ':param2': body.slotTimeEnd,
            }
        };

        queryResult = await docClient.scan(params).promise();

        console.log("SUCCESSFULL GET", queryResult);

        if (queryResult?.Items?.length  !== 0) {
            res.status(400).send();
            return;
        }
        
        const id = !!body?.id ? body.id : uuidv4();
        const targetData = {
            TableName: reservationsTableDynamodb,
            Item: { ...body, id }
        };
        const data = await docClient.put(targetData).promise();
        console.log(data);
        res.status(200).send({
            reservationId: id
        });

    } catch (err) {
        console.log(err);
        res.status(400).send();
        return;
    }

});

app.get('/tables', (req, res) => {
    getAllItems(tablesTableDynamodb)
        .then(items => {
            res.status(200).send(
                {
                    tables: items.map(item => { 
                        delete item.tableNumber;
                        return { ...item, id: parseInt(item.id) };
                    })
                }
            );
        })
        .catch(err => {
            console.error("Error retrieving items:", err);
        });
});

app.get('/tables/:tableId', async (req, res) => {
    console.log('/tables/:tableId -> Params', req.params)
    var params = {
        TableName: tablesTableDynamodb,
        Key: { id: req.params.tableId },
    };
    try {
        let queryResult = await docClient.get(params).promise();
        let item = queryResult.Item;
        delete item.tableNumber;
        console.log("SUCCESSFULL GET", item);
        res.status(200).send({ ...item, id: parseInt(item.id) });
    } catch (err) {
        console.log(err);
    }
});

app.get('/reservations', (req, res) => {
    getAllItems(reservationsTableDynamodb)
        .then(items => {
            res.status(200).send(
                {
                    reservations: items.map(item => {
                        delete item.id;
                        delete item.reservationDate;
                        return item;
                    })
                }
            );
        })
        .catch(err => {
            console.error("Error retrieving items:", err);
        });
});

const handler = serverless(app);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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
