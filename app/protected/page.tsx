import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthButton } from "@/components/auth-button";
import { HomePageClient } from "@/components/home-page-client";
import { createClient } from "@/lib/supabase/server";
import { mapTodoRow, type TodoRow } from "@/lib/todo";

async function ProtectedPageContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data } = await supabase
    .from("todos")
    .select("id, user_id, text, completed, priority, category, image_url, created_at, updated_at")
    .order("created_at", { ascending: false });

  return (
    <HomePageClient
      authSlot={
        <Suspense>
          <AuthButton />
        </Suspense>
      }
      initialTodos={(data ?? []).map((row) => mapTodoRow(row as TodoRow))}
      canEdit={true}
      userId={user.id}
    />
  );
}

export default function ProtectedPage() {
  return (
    <Suspense>
      <ProtectedPageContent />
    </Suspense>
  );
}
