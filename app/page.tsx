"use client";

import { useEffect, useRef, useState } from "react";
import { type FilterMode, type Todo, countRemaining, createTodo, filterTodos } from "@/lib/todos";

export default function Page() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<FilterMode>("all");
  const [nextId, setNextId] = useState(1);
  const [darkMode, setDarkMode] = useState(false);
  // Track whether the mount effect has run, so the class-sync effect skips the
  // initial render and doesn't remove the class set by the layout inline script.
  const didMount = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // On mount, read system preference and set state + class together so there
    // is no intermediate render where the class is absent (eliminates FOUC).
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDarkMode(prefersDark);
    document.documentElement.classList.toggle("dark", prefersDark);
  }, []);

  useEffect(() => {
    if (!didMount.current) { didMount.current = true; return; }
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Ambient particle background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    type Particle = { x: number; y: number; size: number; speed: number; opacity: number; drift: number };
    let animId: number;
    const particles: Particle[] = [];

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }

    function spawnParticles() {
      particles.length = 0;
      const count = Math.max(40, Math.floor((canvas!.width * canvas!.height) / 12000));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas!.width,
          y: Math.random() * canvas!.height,
          size: Math.random() * 2 + 0.5,
          speed: Math.random() * 0.2 + 0.05,
          opacity: Math.random() * 0.35 + 0.08,
          drift: (Math.random() - 0.5) * 0.12,
        });
      }
    }

    function handleResize() { resize(); spawnParticles(); }
    resize();
    spawnParticles();
    window.addEventListener("resize", handleResize);

    const color = darkMode ? "200, 190, 255" : "102, 80, 200";

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      for (const p of particles) {
        p.y -= p.speed;
        p.x += p.drift;
        if (p.y < -10) { p.y = canvas!.height + 10; p.x = Math.random() * canvas!.width; }
        if (p.x < -10) p.x = canvas!.width + 10;
        if (p.x > canvas!.width + 10) p.x = -10;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${color}, ${p.opacity})`;
        ctx!.fill();
      }
      animId = requestAnimationFrame(animate);
    }
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, [darkMode]);

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
    <div className="particles-bg min-h-screen">
      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none" />
      <div className="relative z-10 flex flex-col items-center pt-16 px-4 pb-12 min-h-screen">

      {/* Dark / Light mode toggle */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setDarkMode((d) => !d)}
          className="mode-toggle px-4 py-2 text-sm font-medium"
          aria-label="Toggle dark mode"
        >
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>
      </div>

      <div className="w-full max-w-md">
        <h1 className="text-5xl font-light text-center text-white/90 mb-1 tracking-widest drop-shadow-lg">
          todos
        </h1>
        <p className="text-center text-white/45 text-xs mb-8 tracking-widest uppercase">
          what&apos;s on the agenda?
        </p>

        {/* Input */}
        <div className="glass-card rounded-2xl overflow-hidden shadow-2xl mb-4">
          <div className="flex items-center px-2">
            <input
              className="flex-1 px-4 py-4 text-base bg-transparent outline-none text-white placeholder-white/35 font-light"
              placeholder="add something to do..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTodo()}
            />
            <button
              onClick={addTodo}
              className={`btn-gradient mx-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm ${input.trim() ? "pulse-glow" : ""}`}
            >
              Add ✦
            </button>
          </div>
        </div>

        {/* Todo list */}
        {todos.length > 0 && (
          <div className="glass-card rounded-2xl overflow-hidden shadow-2xl">
            <ul className="divide-y divide-white/10">
              {visible.map((todo) => (
                <li
                  key={todo.id}
                  className="todo-item flex items-center px-5 py-4 group"
                >
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={todo.completed}
                    onClick={() => toggleTodo(todo.id)}
                    className={`todo-checkbox mr-4 ${todo.completed ? "is-checked" : ""}`}
                  >
                    <svg viewBox="0 0 12 10" width="10" height="8" fill="none" aria-hidden="true" className="todo-checkmark" style={{ pointerEvents: "none" }}>
                      <path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <span
                    className={`flex-1 text-base font-light ${
                      todo.completed
                        ? "line-through text-white/30"
                        : "text-white/90"
                    }`}
                    style={{ transition: "color 0.3s ease, text-decoration 0.3s ease" }}
                  >
                    {todo.text}
                  </span>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="delete-btn text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 text-2xl leading-none ml-2"
                    style={{ transition: "color 0.2s ease, opacity 0.2s ease, transform 0.2s ease" }}
                    aria-label="Delete todo"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-3 text-sm text-white/45 border-t border-white/10">
              <span className="font-light text-xs">
                {remaining} item{remaining !== 1 ? "s" : ""} left
              </span>
              <div className="flex gap-1">
                {(["all", "active", "completed"] as FilterMode[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer ${
                      filter === f
                        ? "bg-white/20 text-white border border-white/30"
                        : "text-white/40 hover:text-white/70 hover:bg-white/10"
                    }`}
                    style={{ transition: "all 0.2s ease" }}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
              <button
                onClick={clearCompleted}
                className="text-white/40 hover:text-white/70 text-xs cursor-pointer"
                style={{ transition: "color 0.2s ease" }}
              >
                Clear done
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {todos.length === 0 && (
          <p className="text-center text-white/30 text-sm mt-14 font-light tracking-wide">
            nothing here yet — add something ✦
          </p>
        )}
      </div>

      {/* Bottom links */}
      <div className="mt-auto pt-10 flex items-center justify-center gap-6 text-white/35 text-xs">
        <a
          href="https://github.com/dcow/ai-day-agentic-triage-fix"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white/70"
          style={{ transition: "color 0.2s ease" }}
        >
          source ↗
        </a>
        <a
          href="/slides.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white/70"
          style={{ transition: "color 0.2s ease" }}
        >
          slides ↗
        </a>
      </div>
      </div>
    </div>
  );
}
