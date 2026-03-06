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
      <footer className="mt-4 text-xs text-gray-400 flex items-center gap-1.5">
        <span>Part of AI Day Agentic Workflows</span>
        <a
          href="https://github.com/dcow/ai-day-agentic-triage-fix"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub repository"
          className="inline-flex items-center bg-gray-200 hover:bg-gray-300 text-gray-500 rounded px-1.5 py-0.5 transition-colors"
        >
          <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor" aria-hidden="true">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
          </svg>
        </a>
        <span className="mx-0.5">·</span>
        <span>Slides</span>
        <a
          href="/slides.pdf"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View slides PDF"
          className="inline-flex items-center bg-gray-200 hover:bg-gray-300 text-gray-500 rounded px-1.5 py-0.5 transition-colors"
        >
          <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
          </svg>
        </a>
      </footer>
    </main>
  );
}
