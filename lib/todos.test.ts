import { describe, it, expect } from "vitest";
import { createTodo, filterTodos, countRemaining } from "./todos";

describe("createTodo", () => {
  it("creates an incomplete todo with the given text", () => {
    const todo = createTodo(1, "buy milk");
    expect(todo).toMatchObject({ id: 1, text: "buy milk", completed: false });
  });
});

describe("filterTodos", () => {
  it("returns all todos in 'all' mode", () => {
    const todos = [createTodo(1, "a"), createTodo(2, "b")];
    expect(filterTodos(todos, "all")).toHaveLength(2);
  });

  it("returns only incomplete todos in 'active' mode", () => {
    const todos = [
      { ...createTodo(1, "a"), completed: true },
      createTodo(2, "b"),
    ];
    expect(filterTodos(todos, "active")).toEqual([todos[1]]);
  });

  it("returns only completed todos in 'completed' mode", () => {
    const todos = [
      { ...createTodo(1, "a"), completed: true },
      createTodo(2, "b"),
    ];
    expect(filterTodos(todos, "completed")).toEqual([todos[0]]);
  });
});

describe("countRemaining", () => {
  it("returns 0 for an empty list", () => {
    expect(countRemaining([])).toBe(0);
  });

  // this test would have failed before this fix
  it("counts all todos when none are completed", () => {
    const todos = [createTodo(1, "a"), createTodo(2, "b"), createTodo(3, "c")];
    expect(countRemaining(todos)).toBe(3);
  });

  it("excludes completed todos from the count", () => {
    const todos = [
      { ...createTodo(1, "a"), completed: true },
      createTodo(2, "b"),
    ];
    expect(countRemaining(todos)).toBe(1);
  });
});
