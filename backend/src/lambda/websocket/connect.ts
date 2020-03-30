import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import "source-map-support/register";

import { createConnection } from "./../../businessLogic/connections";
import { createLogger } from './../../utils/logger';

const logger = createLogger("WebSocket Connect");

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info("connect.handler", { event });

    await createConnection(event.requestContext.connectionId);

    return {
        statusCode: 201,
        body: ""
    };
}