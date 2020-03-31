import * as uuid from "uuid";

import { TodoImageItem } from "./../models/TodoImageItem";
import { TodoImagesAccess } from '../dataLayer/todoImagesAccess';
import { createLogger } from "./../utils/logger";

const logger = createLogger("TodoImages:Business Logic: ");

const todoImagesAccess = new TodoImagesAccess();

export async function createImage(todoId: string): Promise<TodoImageItem> {
    const imageId = uuid.v4();

    logger.info("createImage", { todoId, imageId });

    return await todoImagesAccess.createImage({
        todoId,
        imageId,
    });
}

export async function getTodoIdByImageId(imageId: string) {
    logger.info("getTodoIdByImageId: ", { imageId });

    return await todoImagesAccess.getImageById(imageId);
}

export async function getS3Object(key: string) {
    logger.info("getS3Object", { key });

    return await todoImagesAccess.getS3Object(key);
}
