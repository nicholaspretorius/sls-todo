import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from "middy";
import { cors } from "middy/middlewares";

import { createLogger } from './../../utils/logger';
import { deleteTodo, getTodoById } from "./../../businessLogic/todos";
import { getUserId } from "./../utils";

const logger = createLogger("deleteTodo.handler");

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId

  logger.info("Deleting Todo: ", {
    todoId
  });

  // TODO: Remove a TODO item by id
  const userId = await getUserId(event);

  const todo = await getTodoById(todoId);

  if (!todo) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: `Todo with ID ${todoId} not found` })
    }
  }

  if (userId === todo.userId) {
    try {
      await deleteTodo(todoId);

      logger.info(`todoId: ${todoId} deleted`);

      return {
        statusCode: 200,
        body: JSON.stringify({ message: `Todo with Id ${todoId} was deleted` })
      }
    } catch (e) {
      logger.error(`Error deleting todo with id: ${todoId}`, {
        error: e
      })
    }
  }

  logger.info(`User ${userId} attempted to delete todo ${todoId} owned by ${todo.userId}`);

  return {
    statusCode: 403,
    body: JSON.stringify({ message: `Unauthorised, you may not delete todos you did not create` })
  }


});

handler.use(
  cors({
    credentials: true,
    origin: "*"
  })
)
