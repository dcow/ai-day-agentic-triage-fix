export interface Todo {
  id: number;
  text: string;
  completed: boolean;
  createdAt: Date;
}

export type FilterMode = "all" | "active" | "completed";

export function filterTodos(todos: Todo[], mode: FilterMode): Todo[] {
  if (mode === "active") return todos.filter((t) => !t.completed);
  if (mode === "completed") return todos.filter((t) => t.completed);
  return todos;
}

// Returns the number of remaining (incomplete) todos.
export function countRemaining(todos: Todo[]): number {
  let count = 0;
  for (let i = 1; i < todos.length; i++) {
    if (!todos[i].completed) count++;
  }
  return count;
}

export function createTodo(id: number, text: string): Todo {
  return { id, text, completed: false, createdAt: new Date() };
}
