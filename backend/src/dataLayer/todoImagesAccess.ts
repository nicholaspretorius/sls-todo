import * as AWS from "aws-sdk";
import { createLogger } from "./../utils/logger";

const AWSXRay = require("aws-xray-sdk");

import { DocumentClient } from "aws-sdk/clients/dynamodb";

import { TodoImageItem } from "./../models/TodoImageItem";
import { CreateTodoImageRequest } from './../requests/CreateTodoImageRequest';

const XAWS = AWSXRay.captureAWS(AWS);
const logger = createLogger("todoImagesAccess:DataLayer: ");
const todoImagesIndex = process.env.TODO_IMAGES_ID_INDEX;
const bucketName = process.env.TODO_IMAGES_S3_BUCKET;
const urlExpiration = process.env.SIGNED_URL_EXPIRATION;

export class TodoImagesAccess {
    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly s3 = createS3Bucket(),
        private readonly todoImagesTable = process.env.TODO_IMAGES_TABLE,
    ) { }

    getUploadUrl(imageId: string) {
        return this.s3.getSignedUrl("putObject", {
            Bucket: bucketName,
            Key: imageId,
            Expires: parseInt(urlExpiration)
        });
    }

    async createImage(image: CreateTodoImageRequest): Promise<TodoImageItem> {

        const newImage = {
            userId: image.userId,
            todoId: image.todoId,
            imageId: image.imageId,
            createdAt: new Date().toISOString(),
            uploadUrl: this.getUploadUrl(image.imageId),
        }

        logger.info("Create Image: ", { image: newImage });

        await this.docClient.put({
            TableName: this.todoImagesTable,
            Item: newImage
        }).promise();

        return newImage;
    }

    async getImages(userId: string): Promise<TodoImageItem[]> {
        const result = await this.docClient.query({
            TableName: this.todoImagesTable,
            IndexName: todoImagesIndex,
            KeyConditionExpression: "userId = :userId",
            ExpressionAttributeValues: {
                ":userId": userId
            }
        }).promise();

        const images = result.Items;
        logger.info("Images per userId: ", { images });

        return images as TodoImageItem[];
    }

    async getImageById(imageId: string): Promise<TodoImageItem> {
        const result = await this.docClient.query({
            TableName: this.todoImagesTable,
            IndexName: todoImagesIndex,
            KeyConditionExpression: "imageId = :imageId",
            ExpressionAttributeValues: {
                ":imageId": imageId
            }
        }).promise();

        const image = result.Items[0];
        logger.info("Image by ID: ", { image });

        return image as TodoImageItem;
    }

    async getS3Object(key) {
        const response = await this.s3.getObject({
            Bucket: bucketName,
            Key: key
        }).promise();

        const body = response.Body;

        return body;
    }

}

function createDynamoDBClient() {
    logger.info("Creating TodoImages DynamoDB Client...");
    return new XAWS.DynamoDB.DocumentClient();
}

function createS3Bucket() {
    return new AWS.S3({
        signatureVersion: 'v4'
    })
}