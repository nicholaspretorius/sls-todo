import * as uuid from "uuid";

import { TodoItem } from "./../models/TodoItem";
import { TodoUpdate } from "./../models/TodoUpdate";
import { TodoAccess } from './../dataLayer/todosAccess';
import { CreateTodoRequest } from "./../requests/CreateTodoRequest";
import { parseUserId } from '../auth/utils';
import { createLogger } from "./../utils/logger";
// import { createImage } from "./../businessLogic/todoImages";

const logger = createLogger("Todos:Business Logic: ");

const todosAccess = new TodoAccess();

export function getTodos(jwtToken: string, nextKey?, limit?: number) {
    const userId = parseUserId(jwtToken);

    logger.info("getTodos: ", userId);

    return todosAccess.getTodos(userId, nextKey, limit);
}

export function getTodoById(todoId: string): Promise<TodoItem> {

    logger.info("getTodo: ", { todoId });

    return todosAccess.getTodo(todoId);
}

export async function createTodo(todo: CreateTodoRequest, userId: string): Promise<TodoItem> {

    const todoId = uuid.v4();
    // const image = await createImage(todoId);
    logger.info("createTodo: ", { todoId, userId, todo });

    return await todosAccess.createTodo({
        todoId,
        userId,
        createdAt: new Date().toISOString(),
        name: todo.name,
        dueDate: todo.dueDate,
        done: false
        // attachmentUrl: "NoImage"
    });
}

export async function updateTodo(todoId: string, updatedTodo: TodoUpdate): Promise<TodoItem> {
    logger.info("updateTodo: ", { todoId, updatedTodo });
    return await todosAccess.updateTodo(todoId, updatedTodo);
}

export async function updateAttachmentUrl(todoId, attachmentUrl) {
    logger.info("updateAttachmentUrl: ", { todoId, attachmentUrl });
    return await todosAccess.updateAttachmentUrl(todoId, attachmentUrl);
}

export async function deleteTodo(todoId: string) {
    logger.info("deleteTodo: ", {
        todoId
    });
    return await todosAccess.deleteTodo(todoId);
}

