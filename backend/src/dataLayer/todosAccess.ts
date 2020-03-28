import * as AWS from "aws-sdk";
import { createLogger } from "./../utils/logger";

const AWSXRay = require("aws-xray-sdk");

import { DocumentClient } from "aws-sdk/clients/dynamodb";

import { TodoItem } from "./../models/TodoItem";

const XAWS = AWSXRay.captureAWS(AWS);
const logger = createLogger("todosAccess");
const todosIndex = process.env.TODOS_USERID_INDEX;

export class TodoAccess {

    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
    ) { }

    async getTodos(userId: string): Promise<TodoItem[]> {

        const result = await this.docClient.query({
            TableName: this.todosTable,
            IndexName: todosIndex,
            KeyConditionExpression: "userId = :userId",
            ExpressionAttributeValues: {
                ":userId": userId
            }
        }).promise();

        const todos = result.Items;
        logger.info("Todos: ", todos);

        return todos as TodoItem[];
    }

    async createTodo(todo: TodoItem): Promise<TodoItem> {
        logger.info("Create Todo: ", todo);

        await this.docClient.put({
            TableName: this.todosTable,
            Item: todo
        }).promise();

        return todo;
    }

    async deleteTodo(todoId: string, userId: string): Promise<Object> {
        logger.info("Delete Todo: ", todoId);

        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                "todoId": todoId,
                "userId": userId
            }
        }).promise();


        return {}
    }
}

function createDynamoDBClient() {

    logger.info("Creating DynamoDB Client...");
    return new XAWS.DynamoDB.DocumentClient();
}