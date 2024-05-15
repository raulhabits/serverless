# task07

High level project overview - business value it brings, non-detailed technical overview.

### Notice
All the technical details described below are actual for the particular
version, or a range of versions of the software.
### Actual for versions: 1.0.0

## task07 diagram

![task07](pics/task07_diagram.png)

## Lambdas descriptions

### Lambda `lambda-name`
Lambda feature overview.

### Required configuration
#### Environment variables
* environment_variable_name: description

#### Trigger event
```buildoutcfg
{
    "key": "value",
    "key1": "value1",
    "key2": "value3"
}
```
* key: [Required] description of key
* key1: description of key1

#### Expected response
```buildoutcfg
{
    "status": 200,
    "message": "Operation succeeded"
}
```
---

## Deployment from scratch
1. action 1 to deploy the software
2. action 2

...

##Scripts


syndicate generate project --name task03
syndicate generate meta api_gateway     --resource_name task3_api     --deploy_stage api     --minimum_compression_size 0 
syndicate generate meta api_gateway_resource     --api_name task3_api     --path /hello     --enable_cors false 
syndicate generate meta api_gateway_resource_method --api_name task3_api --path /hello --method GET 


syndicate generate project --name task04
syndicate generate lambda --name sqs_handler --runtime nodejs
syndicate generate lambda --name sns_handler --runtime nodejs
syndicate generate meta sqs_queue --resource_name async_queue 
syndicate generate meta sns_topic --resource_name lambda_topic



syndicate generate project --name task05
syndicate generate lambda --name api_handler --runtime nodejs
syndicate generate meta api_gateway --resource_name task5_api --deploy_stage api --minimum_compression_size 0
syndicate generate meta api_gateway_resource --api_name task5_api --path /events --enable_cors false 
syndicate generate meta api_gateway_resource_method --api_name task5_api --path /events --method POST
syndicate generate meta dynamodb --resource_name Events --hash_key_name id --hash_key_type S


syndicate generate project --name task06
syndicate generate lambda --name audit_producer --runtime nodejs
syndicate generate meta dynamodb --resource_name Configuration --hash_key_name key --hash_key_type S
syndicate generate meta dynamodb --resource_name Audit --hash_key_name id --hash_key_type S


syndicate generate project --name task07
syndicate generate lambda --name uuid_generator --runtime nodejs
syndicate generate meta s3_bucket --resource_name uuid-storage
syndicate generate meta cloudwatch_event_rule --resource_name uuid_trigger --rule_type schedule



