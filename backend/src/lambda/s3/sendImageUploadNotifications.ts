import { SNSEvent, SNSHandler, S3Event } from "aws-lambda";
import "source-map-support";

import { createLogger } from './../../utils/logger';
import { processS3Event } from "./../../businessLogic/notifications";

const logger = createLogger("WebSocket Connect");

export const handler: SNSHandler = async (event: SNSEvent) => {
    logger.info("sendImageUploadNotification", { event });

    for (const snsRecord of event.Records) {
        const s3EventStr = snsRecord.Sns.Message;
        const s3Event: S3Event = JSON.parse(s3EventStr);

        await processS3Event(s3Event);
    }
}
