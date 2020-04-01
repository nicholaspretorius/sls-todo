import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as elasticsearch from "elasticsearch";
import * as httpAwsEs from "http-aws-es";
import * as middy from "middy";
import { cors } from "middy/middlewares";

import { createLogger } from '../../utils/logger';

const logger = createLogger("elasticSearch");

const esHost = process.env.ES_ENDPOINT;

const es = new elasticsearch.Client({
    hosts: [esHost],
    connectionClass: httpAwsEs
});

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info("Processing Search Event: ", { event });

    let query = getQueryParameter(event, "q");

    logger.info("Query: ", { query });

    try {
        const results = await es.search({
            index: "todos-index",
            body: {
                query: {
                    fuzzy: {
                        name: {
                            value: query,
                            fuzziness: 1
                        }
                    }
                }
            }
        });

        const total = results.hits.total;
        const todos = results.hits.hits.map(result => result._source);

        logger.info("Search: ", { query, results, todos, total });

        return {
            statusCode: 200,
            body: JSON.stringify({
                total,
                todos,
            })
        }

    } catch (e) {
        logger.error("Failed to parse search query parameters: ", { error: e });

        return {
            statusCode: 400,
            body: JSON.stringify({
                error: "Invalid search parameters"
            })
        }
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