import { SNSEvent, SNSHandler, S3Event, S3EventRecord } from 'aws-lambda';
import "source-map-support";

import { getS3Object } from "./../../businessLogic/todoImages";
// import { updateAttachmentUrl } from "./../../businessLogic/todos";
import { createLogger } from './../../utils/logger';

const logger = createLogger("upadteImageUrl");

export const handler: SNSHandler = async (event: SNSEvent) => {
    logger.info("Processing SNS Event: ", { event });

    for (const snsRecord of event.Records) {
        const s3EventStr = snsRecord.Sns.Message;
        const s3Event: S3Event = JSON.parse(s3EventStr);

        for (const record of s3Event.Records) {
            await updateImageUrl(record);
        }
    }
}

async function updateImageUrl(record: S3EventRecord) {
    logger.info("Processing S3 Event: ", { record });
    const key = record.s3.object.key;

    const todoImage = await getS3Object(key);

    logger.info("TodoImage from S3: ", todoImage);

    // const updatedTodo = await updateAttachmentUrl()
}