import * as AWS from "aws-sdk";
import { createLogger } from "./../utils/logger";

const AWSXRay = require("aws-xray-sdk");

import { DocumentClient } from "aws-sdk/clients/dynamodb";

const XAWS = AWSXRay.captureAWS(AWS);
const logger = createLogger("connectionsAccess:DataLayer: ");

export class ConnectionsAccess {

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
}

function createDynamoDBClient() {
    logger.info("Creating Connections DynamoDB Client...");
    return new XAWS.DynamoDB.DocumentClient();
}
