/**
 * Fields in a request to create a single TODO item.
 */
export interface CreateTodoImageRequest {
    userId: string,
    todoId: string,
    imageId: string
}