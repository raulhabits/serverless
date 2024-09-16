'use strict';

const express = require('express');
const app = express();
const serverless = require('serverless-http');
const AWS = require("aws-sdk");

const docClient = new AWS.DynamoDB.DocumentClient();
const { CognitoIdentityProviderClient, AdminInitiateAuthCommand, SignUpCommand } = require("@aws-sdk/client-cognito-identity-provider");


const cupClientId = process.env.cup_client_id;

const tablesTableDynamodb = process.env.cup_client_id;
const reservationsTableDynamodb = process.env.cup_client_id;

const scanTable = async (tableName) => {
    const params = {
        TableName: tableName,
    };

    const scanResults = [];
    let items;
    do{
        items = await documentClient.scan(params).promise();
        items.Items.forEach((item) => scanResults.push(item));
        params.ExclusiveStartKey = items.LastEvaluatedKey;
    }while(typeof items.LastEvaluatedKey !== "undefined");
    
    return scanResults;
};


app.post('/signin', async (req, res) => {
	
    const body = JSON.parse(req.apiGateway.event.body);
	
    const params = {
        AuthFlow: AuthFlowType.ADMIN_USER_PASSWORD_AUTH,
        ClientId: cupClientId,
        AuthParameters: {
            USERNAME: body.email,
            PASSWORD: body.password
        }
    };

    const client = new CognitoIdentityProviderClient({});

    const response = await client.send(new AdminInitiateAuthCommand(params));
    if (response && response.AuthenticationResult && response.AuthenticationResult.AccessToken) {
        res.status(200).send({
            accessToken: response.AuthenticationResult.AccessToken
        });
    } else {
        res.status(400).send();
    }
  
});

app.post('/signup', async (req, res) => {


    const client = new CognitoIdentityProviderClient({});

    const body = JSON.parse(req.apiGateway.event.body);

    const command = new SignUpCommand({
      ClientId: cupClientId,
      Username: body.email,
      Password: body.password,
      UserAttributes: [{ Name: "firstName", Value: body.firstName }, { Name: "lastName", Value: body.lastName }, { Name: "email", Value: body.email }],
    });

    console.log(body, command);
  
    const response = await client.send(command);
    if (response && response.UserConfirmed) {
        res.status(200).send("ok");
    } else {
        res.status(400).send();
    }


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
    
	const targetData = {
		TableName: tablesTableDynamodb,
		Item: body
	};

    try {
		const data = await docClient.put(targetData).promise();
        console.log(data);
	    res.status(200).send({
                id: req.body.id
            });
	} catch (err) {
		res.status(400).send(JSON.stringify(err, null, 2));
	}


});

app.post('/reservations', async (req, res) => {
	
    const body = JSON.parse(req.apiGateway.event.body);

	const targetData = {
		TableName: reservationsTableDynamodb,
		Item: body
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

app.get('/tables', (req, res) => {
    const tables = scanTable(tablesTableDynamodb);
    res.status(200).send(
        {
            tables
        }
    );
});

app.get('/tables/:tableId', async (req, res) => {
	console.log('/tables/:tableId -> Params', req.params)
    var params = {
        TableName: tablesTableDynamodb,
        Key: { id: req.params.tableId },
      };
    try {
        let res = await docClient.get(paramsGet).promise();
        let database_item = res.Item;
        console.log("SUCCESSFULL GET", database_item);
        res.status(200).send(database_item);
     } catch(err) {
        console.log(err);
     }
});

app.get('/reservations', (req, res) => {
    const tables = scanTable(reservationsTableDynamodb);
    res.status(200).send(
        {
            tables
        }
    );
});

const handler = serverless(app);

app.use(express.urlencoded({extended: true}));
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
