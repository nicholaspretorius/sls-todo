import * as AWS from "aws-sdk";
import { createLogger } from "./../utils/logger";

const AWSXRay = require("aws-xray-sdk");

import { DocumentClient } from "aws-sdk/clients/dynamodb";

import { TodoItem } from "./../models/TodoItem";
import { TodoUpdate } from "./../models/TodoUpdate";

const XAWS = AWSXRay.captureAWS(AWS);
const logger = createLogger("todosAccess:DataLayer: ");
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
        logger.info("Todos: ", { todos });

        return todos as TodoItem[];
    }

    async getTodo(todoId: string): Promise<TodoItem> {
        logger.info("Get Todo: ", { todoId });

        const result = await this.docClient.get({
            TableName: this.todosTable,
            Key: {
                todoId
            }
        }).promise();

        const todo = result.Item;

        return todo as TodoItem;
    }

    async createTodo(todo: TodoItem): Promise<TodoItem> {
        logger.info("Create Todo: ", { todo });

        await this.docClient.put({
            TableName: this.todosTable,
            Item: todo
        }).promise();

        return todo;
    }

    async updateTodo(todoId: string, updatedTodo: TodoUpdate): Promise<TodoItem> {
        logger.info("Update Todo: ", { todoId, updatedTodo });

        const result = await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                todoId
            },
            UpdateExpression: "SET #todoName = :name, dueDate = :dueDate, done = :done",
            ExpressionAttributeValues: {
                ":name": updatedTodo.name,
                ":dueDate": updatedTodo.dueDate,
                ":done": updatedTodo.done

            },
            ExpressionAttributeNames: {
                "#todoName": "name"
            },
            ReturnValues: "ALL_NEW",
        }).promise();

        const todo = result.Attributes;

        logger.info("Updated Todo: ", { todo });

        return todo as TodoItem;
    }

    async updateAttachmentUrl(todoId: string, attachmentUrl: string): Promise<TodoItem> {
        logger.info("Update Todo attachmentUrl: ", { todoId, attachmentUrl });

        const result = await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                todoId
            },
            UpdateExpression: "SET attachmentUrl = :attachmentUrl",
            ExpressionAttributeValues: {
                ":attachmentUrl": attachmentUrl
            },
            ReturnValues: "ALL_NEW",
        }).promise();

        const todo = result.Attributes;

        logger.info("Updated Todo with attachmentUrl: ", { todo });

        return todo as TodoItem;
    }

    async deleteTodo(todoId: string): Promise<Object> {
        logger.info("Delete Todo: ", { todoId });

        return await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                todoId
            }
        }).promise();
    }
}

function createDynamoDBClient() {
    logger.info("Creating Todos DynamoDB Client...");
    return new XAWS.DynamoDB.DocumentClient();
}