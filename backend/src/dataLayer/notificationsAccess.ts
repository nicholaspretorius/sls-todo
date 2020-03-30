import * as AWS from "aws-sdk";
import { S3Event, SNSHandler, SNSEvent } from "aws-lambda";
import { createLogger } from "./../utils/logger";

const AWSXRay = require("aws-xray-sdk");

import { DocumentClient } from "aws-sdk/clients/dynamodb";

const XAWS = AWSXRay.captureAWS(AWS);
const stage = process.env.STAGE;
const apiId = process.env.API_ID;

const connectionParams = {
    apiVersion: "2018-11-29",
    endpoint: `${apiId}.execute-api.us-east.amazonaws.com/${stage}`
};

const apiGateway = createApiGateway();

const logger = createLogger("NotificationsAccess:DataLayer: ");

export class NotificationsAccess {

    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly connectionsTable = process.env.CONNECTIONS_TABLE,
    ) { }

    async createConnection(connection) {
        logger.info("Create Connection: ", { connection });

        await this.docClient.put({
            TableName: this.connectionsTable,
            Item: connection
        }).promise();

        return connection;
    }

    async deleteConnection(key) {
        logger.info("Delete Connection with key: ", { key });

        await this.docClient.delete({
            TableName: this.connectionsTable,
            Key: key,
        }).promise();

        return key;
    }

    async processS3Event(s3Event: S3Event) {
        for (const record of s3Event.Records) {
            const key = record.s3.object.key;
            logger.info("Processing S3 event record with key: ", { key });

            const connections = await this.docClient.scan({
                TableName: this.connectionsTable
            }).promise();

            for (const connection of connections.Items) {
                const connectionId = connection.id;
                await sendMessageToClient(connectionId, { id: key });
            }
        }
    }
}

function createDynamoDBClient() {
    logger.info("Creating Connections DynamoDB Client...");
    return new XAWS.DynamoDB.DocumentClient();
}

function createApiGateway() {
    logger.info("Creating Notifications API Gateway...");
    return new XAWS.ApiGatewayManagementApi(connectionParams);
}

async function postToConnection(connectionId, payload) {
    logger.info("Post to connection: ", { connectionId, payload });

    return await apiGateway.postToConnection({
        ConnectionId: connectionId,
        Data: JSON.stringify(payload)
    }).promise();
}

async function sendMessageToClient(connectionId, payload) {
    try {
        await postToConnection(connectionId, payload);
    } catch (e) {
        logger.error("ApiGateway exception postToConnection: ", { exception: e });

        if (e.statusCode === 410) {
            logger.info("Stale Connection: ", { connectionId });

            await this.docClient.delete({
                TableName: this.connectionsTable,
                Key: {
                    id: connectionId
                }
            }).promise();
        }
    }
}
