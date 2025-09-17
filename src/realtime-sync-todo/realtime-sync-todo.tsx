import { useState } from "react";
import type { Todo } from "./util";
import { type TodoPayload, useOnMount } from "./util";

export function RealtimeSyncTodo({
  subscribe,
  createTodo,
  updateTodo,
  deleteTodo,
}: {
  subscribe: (callback: (todos: Todo[]) => void) => () => void;
  createTodo: (todo: TodoPayload) => void;
  updateTodo: (id: string, todo: Partial<Todo>) => void;
  deleteTodo: (id: string) => void;
}) {
  const [todos, setTodos] = useState<Todo[]>([]);

  useOnMount(() => {
    const unsubscribe = subscribe((todos) => {
      setTodos(todos);
    });

    return () => unsubscribe();
  });

  const handleClickCreate = async (data: FormData) => {
    const title = data.get("title")?.toString() || "";
    if (title.trim() === "") return;

    createTodo({
      title,
      done: false,
    });
  };

  const handleClickComplete = (id: string, done: boolean) => {
    updateTodo(id, { done });
  };

  const handleClickDelete = (id: string) => {
    deleteTodo(id);
  };

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          handleClickCreate(formData);
          e.currentTarget.reset();
        }}
      >
        <input name="title" type="text" />
        <button type="submit">Add Todo</button>
      </form>

      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.done}
              onChange={(e) => handleClickComplete(todo.id, e.target.checked)}
            />
            {todo.title}
            <button type="button" onClick={() => handleClickDelete(todo.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
