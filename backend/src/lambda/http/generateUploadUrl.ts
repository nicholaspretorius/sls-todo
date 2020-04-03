import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import * as middy from "middy";
import { cors } from "middy/middlewares";

import { createLogger } from './../../utils/logger';
import { createImage } from "./../../businessLogic/todoImages";
import { getTodoById } from "./../../businessLogic/todos";
import { getUserId } from "./../utils";

const logger = createLogger("generateUploadUrl.handler");

// todos/{todoId}/attachment
export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId;

  const userId = await getUserId(event);
  const todo = await getTodoById(userId, todoId);

  logger.info(`Generating UploadUrl for Todo ${todoId} by ${userId}: `, {
    todoId,
    userId
  });

  if (!todo) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: `Todo with ID ${todoId} not found` })
    }
  }

  if (userId === todo.userId) {
    const todoImage = await createImage(userId, todoId);

    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    return {
      statusCode: 201,
      body: JSON.stringify({
        uploadUrl: todoImage.uploadUrl
      })
    }
  }


  logger.info(`User ${userId} attempted to generate an upload URL for todo ${todoId} owned by ${todo.userId}`);

  return {
    statusCode: 403,
    body: JSON.stringify({ message: `Unauthorised, you may not generate upload URLs for todos you did not create.` })
  }


});

handler.use(
  cors({
    credentials: true,
    origin: "*"
  })
);
