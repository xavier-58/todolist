export type Priority = "low" | "medium" | "high";

export interface TodoRow {
  id: string;
  user_id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  category: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  createdAt: Date;
  category: string;
  imageUrl: string | null;
}

export function mapTodoRow(row: TodoRow): Todo {
  return {
    id: row.id,
    text: row.text,
    completed: row.completed,
    priority: row.priority,
    createdAt: new Date(row.created_at),
    category: row.category,
    imageUrl: row.image_url,
  };
}
