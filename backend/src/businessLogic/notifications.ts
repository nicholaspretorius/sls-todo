import { S3Event } from "aws-lambda";

import { NotificationsAccess } from './../dataLayer/notificationsAccess';
import { createLogger } from "./../utils/logger";

const logger = createLogger("Notifications: Business Logic: ");

const notificationsAccess = new NotificationsAccess();

export async function processS3Event(s3Event: S3Event) {
    logger.info("processS3Event: ", s3Event);
    return await notificationsAccess.processS3Event(s3Event)
}
