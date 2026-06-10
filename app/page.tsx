"use client";

import Link from "next/link";
import { useState, useCallback, useEffect, useRef } from "react";
import {
  Plus,
  Trash2,
  Flame,
  Sparkles,
  ListTodo,
  Circle,
  Clock,
  AlertCircle,
  Search,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Priority = "low" | "medium" | "high";
type FilterType = "all" | "active" | "completed";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  createdAt: Date;
  category: string;
}

const CATEGORIES = [
  { name: "工作", color: "from-blue-500 to-cyan-500", bg: "bg-blue-500/10" },
  {
    name: "个人",
    color: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-500/10",
  },
  { name: "健康", color: "from-rose-500 to-pink-500", bg: "bg-rose-500/10" },
  {
    name: "学习",
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-500/10",
  },
];

const PRIORITY_CONFIG = {
  low: { label: "低", icon: Circle, color: "text-slate-400" },
  medium: { label: "中", icon: Clock, color: "text-amber-400" },
  high: { label: "高", icon: AlertCircle, color: "text-rose-400" },
};

const FILTER_OPTIONS: Array<{ value: FilterType; label: string }> = [
  { value: "all", label: "全部" },
  { value: "active", label: "进行中" },
  { value: "completed", label: "已完成" },
];

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

const INITIAL_TODOS: Todo[] = [
  {
    id: "todo-work-landing-page",
    text: "完成新的首页视觉设计",
    completed: false,
    priority: "high",
    createdAt: new Date("2026-06-09T09:00:00"),
    category: "工作",
  },
  {
    id: "todo-personal-read-book",
    text: "阅读 30 分钟书籍",
    completed: true,
    priority: "low",
    createdAt: new Date("2026-06-09T09:10:00"),
    category: "个人",
  },
  {
    id: "todo-learning-typescript",
    text: "完成 TypeScript 课程模块",
    completed: false,
    priority: "medium",
    createdAt: new Date("2026-06-09T09:20:00"),
    category: "学习",
  },
  {
    id: "todo-health-run",
    text: "晨跑 5 公里",
    completed: false,
    priority: "high",
    createdAt: new Date("2026-06-09T09:30:00"),
    category: "健康",
  },
  {
    id: "todo-work-review-prs",
    text: "处理待审核的合并请求",
    completed: false,
    priority: "medium",
    createdAt: new Date("2026-06-09T09:40:00"),
    category: "工作",
  },
];

function FloatingOrb({ className }: { className: string }) {
  return (
    <div
      className={`absolute rounded-full blur-3xl opacity-20 pointer-events-none ${className}`}
    />
  );
}

function TodoItem({
  todo,
  onToggle,
  onDelete,
  index,
}: {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  index: number;
}) {
  const category = CATEGORIES.find((c) => c.name === todo.category);
  const priority = PRIORITY_CONFIG[todo.priority];
  const PriorityIcon = priority.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{
        delay: index * 0.03,
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      className={`group relative rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur transition-all duration-300 hover:border-blue-500/20 ${
        todo.completed ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          className="h-4 w-4 accent-cyan-500"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
        />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span
              className={`text-sm font-medium transition-all duration-300 ${
                todo.completed ? "text-muted-foreground line-through" : "text-foreground"
              }`}
            >
              {todo.text}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {category && (
              <span
                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium text-slate-300 ${category.bg}`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full bg-gradient-to-r ${category.color}`}
                />
                {category.name}
              </span>
            )}
            <span className={`inline-flex items-center gap-1 text-xs ${priority.color}`}>
              <PriorityIcon className="h-3 w-3" />
              {priority.label}
            </span>
          </div>
        </div>
        <button
          onClick={() => onDelete(todo.id)}
          className="rounded-lg p-1.5 text-slate-500 opacity-0 transition-all duration-200 hover:bg-rose-500/10 hover:text-rose-400 group-hover:opacity-100"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      {todo.completed && (
        <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-cyan-500/5" />
      )}
    </motion.div>
  );
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>(INITIAL_TODOS);
  const [newTodo, setNewTodo] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [category, setCategory] = useState("工作");
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCurrentTime(new Date());
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const addTodo = useCallback(() => {
    if (!newTodo.trim()) return;
    setTodos((prev) => [
      {
        id: generateId(),
        text: newTodo.trim(),
        completed: false,
        priority,
        createdAt: new Date(),
        category,
      },
      ...prev,
    ]);
    setNewTodo("");
    inputRef.current?.focus();
  }, [newTodo, priority, category]);

  const toggleTodo = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearCompleted = useCallback(() => {
    setTodos((prev) => prev.filter((t) => !t.completed));
  }, []);

  const filteredTodos = todos
    .filter((t) => {
      if (filter === "active") return !t.completed;
      if (filter === "completed") return t.completed;
      return true;
    })
    .filter((t) => t.text.toLowerCase().includes(searchQuery.toLowerCase()));

  const completedCount = todos.filter((t) => t.completed).length;
  const totalCount = todos.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const streak = completedCount;

  const currentHour = currentTime?.getHours() ?? 9;
  const greeting =
    currentHour < 12
      ? "早上好"
      : currentHour < 18
        ? "下午好"
        : "晚上好";
  const timeStr = currentTime
    ? currentTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "--:--";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[hsl(222,47%,6%)] text-white">
      <FloatingOrb className="animate-pulse w-[500px] h-[500px] bg-blue-600 -top-48 -left-48" />
      <FloatingOrb className="w-[400px] h-[400px] bg-cyan-600 -bottom-32 -right-32" />
      <FloatingOrb className="w-[300px] h-[300px] bg-indigo-600 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

      <div
        className="pointer-events-none fixed inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-2xl px-4 py-8 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="mb-2 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
                文子TODO
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {greeting} &middot; {timeStr}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 md:justify-end">
              {streak > 0 && (
                <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur">
                  <Flame className="h-4 w-4 text-orange-400" />
                  <span className="text-sm font-medium text-orange-300">{streak}</span>
                </div>
              )}
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 backdrop-blur transition hover:border-cyan-400/40 hover:bg-white/10 hover:text-white"
              >
                登录
              </Link>
              <Link
                href="/auth/sign-up"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-cyan-950/40 transition hover:from-blue-600 hover:via-cyan-600 hover:to-teal-600"
              >
                注册
              </Link>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-slate-300">今日进度</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {completedCount}/{totalCount} 项任务
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-800/50">
              <motion.div
                className="relative h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            {completedCount === totalCount && totalCount > 0 && (
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-center text-sm font-medium text-emerald-400"
              >
                全部完成，做得漂亮。
              </motion.p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-6"
        >
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <div className="mb-3 flex gap-2">
              <input
                ref={inputRef}
                type="text"
                placeholder="接下来要做什么？"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTodo()}
                className="flex-1 rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2.5 text-sm text-foreground placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
              />
              <button
                onClick={addTodo}
                disabled={!newTodo.trim()}
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:from-blue-600 hover:to-cyan-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Plus className="h-4 w-4" />
                添加
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-lg bg-slate-800/50 p-1">
                {(Object.keys(PRIORITY_CONFIG) as Priority[]).map((p) => {
                  const config = PRIORITY_CONFIG[p];
                  const Icon = config.icon;
                  return (
                    <button
                      key={p}
                      onClick={() => setPriority(p)}
                      className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                        priority === p
                          ? `${config.color} bg-slate-700/50`
                          : "text-slate-500 hover:text-slate-400"
                      }`}
                    >
                      <Icon className="h-3 w-3" />
                      {config.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-1 rounded-lg bg-slate-800/50 p-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => setCategory(cat.name)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                      category === cat.name
                        ? "bg-slate-700/50 text-slate-200"
                        : "text-slate-500 hover:text-slate-400"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-4 flex flex-wrap items-center gap-2"
        >
          <div className="flex items-center gap-1 rounded-lg bg-slate-800/30 p-1">
            {FILTER_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  filter === option.value
                    ? "bg-slate-700/70 text-white"
                    : "text-slate-500 hover:text-slate-400"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="relative min-w-[160px] flex-1">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="搜索任务..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-700/30 bg-slate-800/30 py-1.5 pl-9 pr-3 text-xs text-foreground placeholder:text-slate-500 focus:outline-none focus:border-blue-500/30 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          {completedCount > 0 && (
            <button
              onClick={clearCompleted}
              className="flex items-center gap-1 text-xs text-slate-500 transition-colors hover:text-rose-400"
            >
              <Trash2 className="h-3 w-3" />
              清除已完成
            </button>
          )}
        </motion.div>

        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filteredTodos.map((todo, index) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
                index={index}
              />
            ))}
          </AnimatePresence>

          {filteredTodos.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-16 text-center"
            >
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
                <ListTodo className="h-8 w-8 text-slate-600" />
              </div>
              <p className="text-sm text-slate-500">
                {searchQuery
                  ? "没有匹配当前搜索的任务"
                  : filter === "completed"
                    ? "还没有已完成的任务"
                    : filter === "active"
                      ? "当前没有进行中的任务"
                      : "先添加一条任务开始吧"}
              </p>
            </motion.div>
          )}
        </div>

        {totalCount > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 grid grid-cols-3 gap-3"
          >
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center backdrop-blur">
              <div className="text-lg font-bold text-blue-400">{totalCount}</div>
              <div className="text-xs text-muted-foreground">总数</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center backdrop-blur">
              <div className="text-lg font-bold text-emerald-400">{completedCount}</div>
              <div className="text-xs text-muted-foreground">已完成</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center backdrop-blur">
              <div className="text-lg font-bold text-amber-400">
                {totalCount - completedCount}
              </div>
              <div className="text-xs text-muted-foreground">待完成</div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
