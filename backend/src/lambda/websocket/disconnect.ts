import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import "source-map-support/register";

import { deleteConnection } from "./../../businessLogic/connections";
import { createLogger } from './../../utils/logger';

const logger = createLogger("WebSocket Disconnect");

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info("disconnect.handler", { event });

    await deleteConnection(event.requestContext.connectionId);

    return {
        statusCode: 200,
        body: ""
    };
}