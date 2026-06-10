import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

export async function AuthButton() {
  const supabase = await createClient();

  // You can also use getUser() which will be slower.
  const { data } = await supabase.auth.getClaims();

  const user = data?.claims;

  return user ? (
    <LogoutButton />
  ) : (
    <div className="flex gap-2">
      <Button
        asChild
        size="sm"
        variant="outline"
        className="border-cyan-400/40 bg-slate-900/70 text-slate-100 shadow-sm shadow-cyan-950/30 hover:border-cyan-300/60 hover:bg-slate-800/80 hover:text-white"
      >
        <Link href="/auth/login">Sign in</Link>
      </Button>
      <Button
        asChild
        size="sm"
        variant="default"
        className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-950/40 hover:from-cyan-400 hover:to-blue-400"
      >
        <Link href="/auth/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
