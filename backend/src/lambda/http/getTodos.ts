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

  let nextKey;
  let limit;
  let sort;

  try {
    nextKey = parseNextKeyParameter(event);
    limit = parseLimitParameter(event) || 20;
    sort = getQueryParameter(event, "sort") || "ASC";
  } catch (e) {
    logger.error("Failed to parse query parameters: ", { error: e });

    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Invalid query parameters. The allowed parameters are 'sort' (ASC/DESC. ASC is default), 'limit' (Positive integer i.e. 5,10,20), 'nextKey' (provided in response)."
      })
    }
  }

  const todos = await getTodos(jwtToken, nextKey, limit, sort);

  return {
    statusCode: 200,
    body: JSON.stringify({
      todos: todos.todos,
      nextKey: encodeNextKey(todos.nextKey)
    })
  }
});

handler.use(
  cors({
    credentials: true,
    origin: "*"
  })
);

function getQueryParameter(event, name) {
  const queryParams = event.queryStringParameters
  if (!queryParams) {
    return undefined
  }

  return queryParams[name]
}

function parseNextKeyParameter(event) {
  const nextKey = getQueryParameter(event, "nextKey");

  if (!nextKey) {
    return undefined;
  }

  const uriDecoded = decodeURIComponent(nextKey)
  return JSON.parse(uriDecoded);
}

function parseLimitParameter(event) {
  const limitStr = getQueryParameter(event, "limit");

  if (!limitStr) {
    return undefined;
  }

  const limit = parseInt(limitStr, 10);


  if (limit <= 0) {
    throw new Error("Limit should be greater than 0");
  }

  return limit;
}

function encodeNextKey(lastEvaluatedKey) {

  if (!lastEvaluatedKey) {
    return null
  }

  return encodeURIComponent(JSON.stringify(lastEvaluatedKey))
}
