import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import * as middy from "middy";
import { cors } from "middy/middlewares";

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { createLogger } from './../../utils/logger';
import { updateTodo, getTodobyId } from "./../../businessLogic/todos";
import { getUserId } from "./../utils";

const logger = createLogger("updateTodo.handler");

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

  logger.info("Updating Todo: ", {
    todoId,
    todo: updatedTodo
  });

  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
  const userId = await getUserId(event);
  const existingTodo = await getTodobyId(todoId);

  if (!existingTodo) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: `Todo with ID ${todoId} not found` })
    }
  }

  if (userId === existingTodo.userId) {
    try {
      const todo = await updateTodo(todoId, updatedTodo);

      return {
        statusCode: 200,
        body: JSON.stringify(todo)
      };
    } catch (e) {
      logger.error(`Error deleting todo with id: ${todoId}`, {
        error: e
      })
    }
  }

  logger.info(`User ${userId} attempted to update todo ${todoId} owned by ${existingTodo.userId}`);

  return {
    statusCode: 403,
    body: JSON.stringify({ message: `Unauthorised, you may not update todos you did not create` })
  }
});

handler.use(
  cors({
    credentials: true,
    origin: "*"
  })
);
