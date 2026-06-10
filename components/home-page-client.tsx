"use client";

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
  Pencil,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { mapTodoRow, type Priority, type Todo, type TodoRow } from "@/lib/todo";

type FilterType = "all" | "active" | "completed";

type TodoRealtimePayload = {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: TodoRow | null;
  old: Partial<TodoRow> | null;
};

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

function createAttachmentPath(userId: string, file: File) {
  const safeFileName = file.name
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-");

  return `${userId}/${Date.now()}-${safeFileName || "image"}`;
}

function upsertTodo(list: Todo[], row: TodoRow) {
  const nextTodo = mapTodoRow(row);
  const index = list.findIndex((todo) => todo.id === nextTodo.id);

  if (index === -1) {
    return [nextTodo, ...list];
  }

  const next = [...list];
  next[index] = nextTodo;
  return next;
}

function sortTodosByCreatedAt(list: Todo[]) {
  return [...list].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

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
  onSave,
  index,
  canEdit,
}: {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onSave: (id: string, text: string) => void;
  index: number;
  canEdit: boolean;
}) {
  const category = CATEGORIES.find((c) => c.name === todo.category);
  const priority = PRIORITY_CONFIG[todo.priority];
  const PriorityIcon = priority.icon;
  const [isEditing, setIsEditing] = useState(false);
  const [draftText, setDraftText] = useState(todo.text);

  useEffect(() => {
    setDraftText(todo.text);
  }, [todo.text]);

  const submitEdit = () => {
    const nextText = draftText.trim();

    if (!nextText) {
      setDraftText(todo.text);
      setIsEditing(false);
      return;
    }

    onSave(todo.id, nextText);
    setIsEditing(false);
  };

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
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 accent-cyan-500"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
          disabled={!canEdit || isEditing}
        />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            {isEditing ? (
              <input
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitEdit();
                  if (e.key === "Escape") {
                    setDraftText(todo.text);
                    setIsEditing(false);
                  }
                }}
                className="w-full rounded-md border border-slate-700/50 bg-slate-900/60 px-2 py-1 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                autoFocus
              />
            ) : (
              <span
                className={`text-sm font-medium transition-all duration-300 ${
                  todo.completed ? "text-muted-foreground line-through" : "text-foreground"
                }`}
              >
                {todo.text}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
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
          {todo.imageUrl && (
            <div className="mt-3 overflow-hidden rounded-lg border border-white/10 bg-slate-900/40">
              <img
                src={todo.imageUrl}
                alt={`${todo.text} 附件`}
                className="h-48 w-full object-cover"
              />
            </div>
          )}
        </div>
        {canEdit && (
          <button
            onClick={() => {
              if (isEditing) {
                submitEdit();
                return;
              }

              setDraftText(todo.text);
              setIsEditing(true);
            }}
            className="rounded-lg p-1.5 text-slate-500 opacity-0 transition-all duration-200 hover:bg-cyan-500/10 hover:text-cyan-300 group-hover:opacity-100"
          >
            {isEditing ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
          </button>
        )}
        <button
          onClick={() => onDelete(todo.id)}
          disabled={!canEdit || isEditing}
          className="rounded-lg p-1.5 text-slate-500 opacity-0 transition-all duration-200 hover:bg-rose-500/10 hover:text-rose-400 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-30"
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

export function HomePageClient({
  authSlot,
  initialTodos,
  canEdit,
  userId,
}: {
  authSlot: React.ReactNode;
  initialTodos: Todo[];
  canEdit: boolean;
  userId: string | null;
}) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [newTodo, setNewTodo] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [category, setCategory] = useState("工作");
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTodos(initialTodos);
  }, [initialTodos]);

  useEffect(() => {
    setCurrentTime(new Date());
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`todos-realtime-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "todos",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const deletedId = (payload.old as Partial<TodoRow> | null)?.id;
          const nextRow = payload.new as TodoRow | null;

          setTodos((prev) => {
            if (payload.eventType === "DELETE") {
              if (!deletedId) return prev;
              return prev.filter((todo) => todo.id !== deletedId);
            }

            if (!nextRow) {
              return prev;
            }

            return sortTodosByCreatedAt(upsertTodo(prev, nextRow));
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId]);

  const clearAttachment = useCallback(() => {
    setAttachmentFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const addTodo = useCallback(async () => {
    const text = newTodo.trim();

    if (!canEdit || !userId || !text) return;

    setIsSubmitting(true);
    setError(null);

    const supabase = createClient();
    let imageUrl: string | null = null;
    let uploadedPath: string | null = null;

    if (attachmentFile) {
      uploadedPath = createAttachmentPath(userId, attachmentFile);

      const { error: uploadError } = await supabase.storage
        .from("my-todo")
        .upload(uploadedPath, attachmentFile, {
          upsert: false,
        });

      if (uploadError) {
        setError(uploadError.message);
        setIsSubmitting(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("my-todo")
        .getPublicUrl(uploadedPath);

      imageUrl = publicUrlData.publicUrl;
    }

    const { data, error } = await supabase
      .from("todos")
      .insert({
        user_id: userId,
        text,
        priority,
        category,
        image_url: imageUrl,
      })
      .select("id, user_id, text, completed, priority, category, image_url, created_at, updated_at")
      .single();

    if (error) {
      if (uploadedPath) {
        await supabase.storage.from("my-todo").remove([uploadedPath]);
      }
      setError(error.message);
      setIsSubmitting(false);
      return;
    }

    setTodos((prev) => sortTodosByCreatedAt(upsertTodo(prev, data as TodoRow)));
    setNewTodo("");
    clearAttachment();
    inputRef.current?.focus();
    setIsSubmitting(false);
  }, [attachmentFile, canEdit, category, clearAttachment, newTodo, priority, userId]);

  const updateTodoText = useCallback(
    async (id: string, text: string) => {
      if (!canEdit || !userId) return;

      setError(null);
      const supabase = createClient();
      const { error } = await supabase
        .from("todos")
        .update({ text })
        .eq("id", id)
        .eq("user_id", userId);

      if (error) {
        setError(error.message);
        return;
      }

      setTodos((prev) =>
        prev.map((todo) => (todo.id === id ? { ...todo, text } : todo)),
      );
    },
    [canEdit, userId],
  );

  const toggleTodo = useCallback(
    async (id: string) => {
      if (!canEdit || !userId) return;

      const currentTodo = todos.find((todo) => todo.id === id);
      if (!currentTodo) return;

      setError(null);
      const supabase = createClient();
      const { error } = await supabase
        .from("todos")
        .update({ completed: !currentTodo.completed })
        .eq("id", id)
        .eq("user_id", userId);

      if (error) {
        setError(error.message);
        return;
      }

      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo,
        ),
      );
    },
    [canEdit, todos, userId],
  );

  const deleteTodo = useCallback(
    async (id: string) => {
      if (!canEdit || !userId) return;

      setError(null);
      const supabase = createClient();
      const { error } = await supabase
        .from("todos")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (error) {
        setError(error.message);
        return;
      }

      setTodos((prev) => prev.filter((todo) => todo.id !== id));
    },
    [canEdit, userId],
  );

  const clearCompleted = useCallback(async () => {
    if (!canEdit || !userId) return;

    setError(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("todos")
      .delete()
      .eq("completed", true)
      .eq("user_id", userId);

    if (error) {
      setError(error.message);
      return;
    }

    setTodos((prev) => prev.filter((todo) => !todo.completed));
  }, [canEdit, userId]);

  const filteredTodos = todos
    .filter((todo) => {
      if (filter === "active") return !todo.completed;
      if (filter === "completed") return todo.completed;
      return true;
    })
    .filter((todo) => todo.text.toLowerCase().includes(searchQuery.toLowerCase()));

  const completedCount = todos.filter((todo) => todo.completed).length;
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
              {authSlot}
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
                placeholder={canEdit ? "接下来要做什么？" : "登录后可创建并同步你的待办事项"}
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && void addTodo()}
                disabled={!canEdit || isSubmitting}
                className="flex-1 rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all disabled:cursor-not-allowed disabled:text-slate-500 disabled:opacity-60"
              />
              <button
                onClick={() => void addTodo()}
                disabled={!canEdit || !newTodo.trim() || isSubmitting}
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:from-blue-600 hover:to-cyan-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Plus className="h-4 w-4" />
                添加
              </button>
            </div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <label className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-600/60 bg-slate-800/40 px-3 py-2 text-xs text-slate-300 transition-all ${!canEdit || isSubmitting ? "cursor-not-allowed opacity-50" : "hover:border-cyan-500/50 hover:text-cyan-300"}`}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAttachmentFile(e.target.files?.[0] ?? null)}
                  disabled={!canEdit || isSubmitting}
                  className="hidden"
                />
                <span>{attachmentFile ? "更换图片附件" : "上传图片附件"}</span>
              </label>
              {attachmentFile && (
                <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-slate-800/40 px-3 py-2 text-xs text-slate-300">
                  <span className="max-w-[220px] truncate">{attachmentFile.name}</span>
                  <button
                    onClick={clearAttachment}
                    disabled={isSubmitting}
                    className="text-slate-500 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
            {!canEdit && (
              <p className="mb-3 text-xs text-slate-400">登录后才能新增、修改和删除 Todo。</p>
            )}
            {canEdit && (
              <p className="mb-3 text-xs text-slate-500">每条 Todo 最多上传 1 张图片，保存时会同步到 `my-todo/{userId}/...`。</p>
            )}
            {error && <p className="mb-3 text-sm text-rose-300">{error}</p>}

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-lg bg-slate-800/50 p-1">
                {(Object.keys(PRIORITY_CONFIG) as Priority[]).map((value) => {
                  const config = PRIORITY_CONFIG[value];
                  const Icon = config.icon;
                  return (
                    <button
                      key={value}
                      onClick={() => setPriority(value)}
                      disabled={!canEdit}
                      className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                        priority === value
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
                    disabled={!canEdit}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
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
              onClick={() => void clearCompleted()}
              disabled={!canEdit}
              className="flex items-center gap-1 text-xs text-slate-500 transition-colors hover:text-rose-400 disabled:cursor-not-allowed disabled:opacity-40"
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
                onToggle={(id) => void toggleTodo(id)}
                onDelete={(id) => void deleteTodo(id)}
                onSave={(id, text) => void updateTodoText(id, text)}
                index={index}
                canEdit={canEdit}
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
                      : canEdit
                        ? "先添加一条任务开始吧"
                        : "登录后开始创建你的第一条任务"}
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
