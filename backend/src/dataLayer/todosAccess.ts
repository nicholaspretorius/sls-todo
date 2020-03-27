import * as AWS from "aws-sdk";
import { createLogger } from "./../utils/logger";

const AWSXRay = require("aws-xray-sdk");

import { DocumentClient } from "aws-sdk/clients/dynamodb";

import { TodoItem } from "./../models/TodoItem";

const XAWS = AWSXRay.captureAWS(AWS);
const logger = createLogger("todosAccess");

export class TodoAccess {

    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly todosTable = process.env.TODOS_TABLE
    ) { }

    async getTodos(): Promise<TodoItem[]> {

        const result = await this.docClient.scan({
            TableName: this.todosTable
        }).promise();

        const todos = result.Items;
        logger.info("Todos: ", {
            todos
        });

        return todos as TodoItem[];
    }

    async createTodo(todo: TodoItem): Promise<TodoItem> {
        logger.info("Create Todo: ", {
            todo
        });

        await this.docClient.put({
            TableName: this.todosTable,
            Item: todo
        }).promise();

        return todo;
    }
}

function createDynamoDBClient() {

    logger.info("Creating DynamoDB Client...");
    return new XAWS.DynamoDB.DocumentClient();
}