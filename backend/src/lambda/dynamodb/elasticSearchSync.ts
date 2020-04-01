import { DynamoDBStreamEvent, DynamoDBStreamHandler } from "aws-lambda";
import "source-map-support";
import * as elasticsearch from "elasticsearch";
import * as httpAwsEs from "http-aws-es";

import { createLogger } from './../../utils/logger';

const logger = createLogger("elasticSearchSync");

const esHost = process.env.ES_ENDPOINT;

const es = new elasticsearch.Client({
    hosts: [esHost],
    connectionClass: httpAwsEs
});

export const handler: DynamoDBStreamHandler = async (event: DynamoDBStreamEvent) => {
    logger.info("Processing Events Batch from DynamoDB: ", { event });

    for (const record of event.Records) {
        logger.info("Processing record: ", record);

        if (record.eventName !== "INSERT") {
            continue
        }

        const newItem = record.dynamodb.NewImage;

        logger.info("New ES Record Sync: ", { item: newItem });

        const body = {
            todoId: newItem.todoId.S,
            userId: newItem.userId.S,
            name: newItem.name.S,
            dueDate: newItem.dueDate.S,
            done: newItem.done.BOOL,
            createdAt: newItem.createdAt.S
        }

        await es.index({
            index: "todos-index",
            type: "todos",
            id: newItem.todoId.S,
            body
        })
    }
}