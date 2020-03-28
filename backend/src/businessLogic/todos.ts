import * as uuid from "uuid";

import { TodoItem } from "./../models/TodoItem";
import { TodoAccess } from './../dataLayer/todosAccess';
import { CreateTodoRequest } from "./../requests/CreateTodoRequest";
import { parseUserId } from '../auth/utils';

const todosAccess = new TodoAccess();

export async function getTodos(jwtToken: string): Promise<TodoItem[]> {
    const userId = parseUserId(jwtToken);
    return todosAccess.getTodos(userId);
}

export async function createTodo(todo: CreateTodoRequest, jwtToken: string): Promise<TodoItem> {

    const todoId = uuid.v4();
    const userId = parseUserId(jwtToken);

    return await todosAccess.createTodo({
        todoId: todoId,
        userId,
        createdAt: new Date().toISOString(),
        name: todo.name,
        dueDate: todo.dueDate,
        done: false,
        attachmentUrl: "test"
    });
}

export async function deleteTodo(todoId: string, userId: string) {
    return await todosAccess.deleteTodo(todoId, userId);
}

