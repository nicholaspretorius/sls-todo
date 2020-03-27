import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from "middy";
import { cors } from "middy/middlewares";

import { getTodos } from "./../../businessLogic/todos";
import { createLogger } from './../../utils/logger';

const logger = createLogger("getTodos");

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // TODO: Get all TODO items for a current user
  logger.info("Processing Event: ", {
    event
  });

  const authorization = event.headers.Authorization;
  const split = authorization.split(" ");
  const jwtToken = split[1];

  const todos = await getTodos(jwtToken);

  return {
    statusCode: 200,
    body: JSON.stringify({
      todos
    })
  }
});

handler.use(
  cors({
    credentials: true,
    origin: "*"
  })
);
