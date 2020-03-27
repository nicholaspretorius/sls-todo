import * as uuid from "uuid";

import { TodoItem } from "./../models/TodoItem";
import { TodoAccess } from './../dataLayer/todosAccess';
import { CreateTodoRequest } from "./../requests/CreateTodoRequest";
import { parseUserId } from '../auth/utils';

const todosAccess = new TodoAccess();

export async function getTodos(): Promise<TodoItem[]> {
    return todosAccess.getTodos();
}

export async function createTodo(todo: CreateTodoRequest, jwtToken: string): Promise<TodoItem> {

    const todoId = uuid.v4();
    const userId = parseUserId(jwtToken);

    return await todosAccess.createTodo({
        id: todoId,
        userId,
        createdAt: new Date().toISOString(),
        name: todo.name,
        dueDate: todo.dueDate,
        done: false,
        attachmentUrl: "test"
    });
}

