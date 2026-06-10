import { Suspense } from "react";
import { AuthButton } from "@/components/auth-button";
import { HomePageClient } from "@/components/home-page-client";
import { EnvVarWarning } from "@/components/env-var-warning";
import { hasEnvVars } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { mapTodoRow, type Todo, type TodoRow } from "@/lib/todo";

async function HomeContent({ authSlot }: { authSlot: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initialTodos: Todo[] = [];

  if (user) {
    const { data } = await supabase
      .from("todos")
      .select("id, user_id, text, completed, priority, category, image_url, created_at, updated_at")
      .order("created_at", { ascending: false });

    initialTodos = (data ?? []).map((row) => mapTodoRow(row as TodoRow));
  }

  return (
    <HomePageClient
      authSlot={authSlot}
      initialTodos={initialTodos}
      canEdit={Boolean(user)}
      userId={user?.id ?? null}
    />
  );
}

export default function Home() {
  const authSlot = !hasEnvVars ? (
    <EnvVarWarning />
  ) : (
    <Suspense>
      <AuthButton />
    </Suspense>
  );

  if (!hasEnvVars) {
    return <HomePageClient authSlot={authSlot} initialTodos={[]} canEdit={false} userId={null} />;
  }

  return (
    <Suspense>
      <HomeContent authSlot={authSlot} />
    </Suspense>
  );
}
