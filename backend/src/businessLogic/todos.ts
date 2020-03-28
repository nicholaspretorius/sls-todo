import * as uuid from "uuid";

import { TodoItem } from "./../models/TodoItem";
import { TodoUpdate } from "./../models/TodoUpdate";
import { TodoAccess } from './../dataLayer/todosAccess';
import { CreateTodoRequest } from "./../requests/CreateTodoRequest";
import { parseUserId } from '../auth/utils';
import { createLogger } from "./../utils/logger";

const logger = createLogger("Todos:Business Logic: ");

const todosAccess = new TodoAccess();

export function getTodos(jwtToken: string): Promise<TodoItem[]> {
    const userId = parseUserId(jwtToken);

    logger.info("getTodos: ", userId);

    return todosAccess.getTodos(userId);
}

export function getTodobyId(todoId: string): Promise<TodoItem> {

    logger.info("getTodo: ", { todoId });

    return todosAccess.getTodo(todoId);
}

export async function createTodo(todo: CreateTodoRequest, userId: string): Promise<TodoItem> {

    const todoId = uuid.v4();
    logger.info("createTodo: ", { todoId, userId, todo });

    return await todosAccess.createTodo({
        todoId,
        userId,
        createdAt: new Date().toISOString(),
        name: todo.name,
        dueDate: todo.dueDate,
        done: false,
        attachmentUrl: "test"
    });
}

export async function updateTodo(todoId: string, updatedTodo: TodoUpdate): Promise<TodoItem> {
    logger.info("updateTodo: ", { todoId, updatedTodo });

    return await todosAccess.updateTodo(todoId, updatedTodo);
}

export async function deleteTodo(todoId: string) {
    logger.info("deleteTodo: ", {
        todoId
    });
    return await todosAccess.deleteTodo(todoId);
}

