import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import * as middy from "middy";
import { cors } from "middy/middlewares";

import { createTodo } from "./../../businessLogic/todos";
import { createLogger } from './../../utils/logger';
import { getUserId } from "./../utils";

const logger = createLogger("createTodo.handler");

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // TODO: Implement creating a new TODO item

  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  const userId = getUserId(event);

  logger.info("Creating Todo: ", {
    todo: newTodo,
    userId
  });

  const todo = await createTodo(newTodo, userId);

  return {
    statusCode: 201,
    body: JSON.stringify(todo)
  };

});

handler.use(
  cors({
    credentials: true,
    origin: "*"
  })
);
