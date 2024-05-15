const { v4: uuidv4 } = require("uuid");
const AWS = require("aws-sdk");
const s3 = new AWS.S3();

const targetBucket = process.env.target_bucket;

var roundToNearestMinute = function (date) {
    var coeff = 1000 * 60 * 1; // <-- Replace {1} with interval

    return new Date(Math.round(date.getTime() / coeff) * coeff);
};

exports.handler = async (event) => {

    console.log(event);
    let ids = [...Array(10).keys()].map(index => uuidv4());
    let content = {ids};

    let key = roundToNearestMinute(new Date(event.time));

	const params = {
		Bucket: targetBucket,
		Key: key.toISOString(),
		Body: JSON.stringify(content, null, 2)
	};
    
    await s3.putObject(params).promise()
        .then(data => console.log(data))
        .catch(err => console.log(err, err.stack));
};
