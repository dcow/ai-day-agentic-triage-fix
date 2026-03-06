"use client";

import { useState } from "react";
import { type FilterMode, type Todo, countRemaining, createTodo, filterTodos } from "@/lib/todos";

export default function Page() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<FilterMode>("all");
  const [nextId, setNextId] = useState(1);

  function addTodo() {
    const text = input.trim();
    if (!text) return;
    setTodos((prev) => [...prev, createTodo(nextId, text)]);
    setNextId((id) => id + 1);
    setInput("");
  }

  function toggleTodo(id: number) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }

  function deleteTodo(id: number) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  function clearCompleted() {
    setTodos((prev) => prev.filter((t) => !t.completed));
  }

  const visible = filterTodos(todos, filter);
  const remaining = countRemaining(todos);

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center pt-20 px-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-thin text-center text-gray-600 mb-6">todos</h1>

        {/* Input */}
        <div className="flex bg-white shadow">
          <input
            className="flex-1 px-4 py-3 text-lg outline-none placeholder-gray-300"
            placeholder="What needs to be done?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
          />
          <button
            onClick={addTodo}
            className="px-4 text-gray-400 hover:text-gray-600"
          >
            Add
          </button>
        </div>

        {/* List */}
        {todos.length > 0 && (
          <div className="bg-white shadow mt-0 border-t border-gray-100">
            <ul>
              {visible.map((todo) => (
                <li
                  key={todo.id}
                  className="flex items-center px-4 py-3 border-b border-gray-100 group"
                >
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    className="mr-3 w-5 h-5 cursor-pointer"
                  />
                  <span
                    className={`flex-1 text-lg ${
                      todo.completed ? "line-through text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {todo.text}
                  </span>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 text-xl leading-none"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2 text-sm text-gray-400">
              <span>{remaining} item{remaining !== 1 ? "s" : ""} left</span>
              <div className="flex gap-2">
                {(["all", "active", "completed"] as FilterMode[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-2 py-0.5 rounded border ${
                      filter === f
                        ? "border-red-300 text-red-400"
                        : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
              <button
                onClick={clearCompleted}
                className="hover:text-gray-600"
              >
                Clear completed
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Project context */}
      <p className="mt-10 text-center text-xs text-gray-400">
        Part of an{" "}
        <a
          href="https://github.com/dcow/ai-day-agentic-triage-fix"
          className="underline hover:text-gray-500"
          target="_blank"
          rel="noopener noreferrer"
        >
          AI Day example project
        </a>{" "}
        demonstrating agentic GitHub issue triage.{" "}
        <a
          href="/slides.pdf"
          className="underline hover:text-gray-500"
          target="_blank"
          rel="noopener noreferrer"
        >
          View slides
        </a>
        .
      </p>
    </main>
  );
}
