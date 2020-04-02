import { SNSEvent, SNSHandler, S3Event, S3EventRecord } from "aws-lambda";
import "source-map-support";
// import * as AWS from "aws-sdk";

import { createLogger } from "./../../utils/logger";
import { updateAttachmentUrl } from "./../../businessLogic/todos";
import { getTodoIdByImageId } from "./../../businessLogic/todoImages";

const logger = createLogger("updateImage");

export const handler: SNSHandler = async (event: SNSEvent) => {
    logger.info("Processing SNS Event: ", { event });

    for (const snsRecord of event.Records) {
        logger.info("Processing SNS Record: ", { snsRecord });

        const s3EventStr = snsRecord.Sns.Message;
        logger.info("Processing SNS Message: ", { s3EventStr });

        const s3Event: S3Event = JSON.parse(s3EventStr);

        for (const record of s3Event.Records) {
            await updateImage(record);
        }
    }
}

async function updateImage(record: S3EventRecord) {
    logger.info("Record: ", { record });
    const key = record.s3.object.key;

    const url = `https://sls-todo-images-bucket-dev.s3.amazonaws.com/${key}`;

    const image = await getTodoIdByImageId(key);
    logger.info("Image: ", { image });

    try {
        await updateAttachmentUrl(image.todoId, url);
    } catch (e) {
        logger.error("Error updating attachmentUrl: ", { error: e });
    }
}