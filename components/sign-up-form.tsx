"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("两次输入的密码不一致");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/protected`,
        },
      });
      if (error) throw error;
      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "发生了未知错误");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-white/10 bg-white/5 text-white shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl text-white">注册</CardTitle>
          <CardDescription className="text-slate-300">创建你的文子TODO 账号</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-slate-200">邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-white/10 bg-slate-950/40 text-white placeholder:text-slate-500 focus-visible:ring-cyan-500/50"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password" className="text-slate-200">密码</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-white/10 bg-slate-950/40 text-white placeholder:text-slate-500 focus-visible:ring-cyan-500/50"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="repeat-password" className="text-slate-200">确认密码</Label>
                </div>
                <Input
                  id="repeat-password"
                  type="password"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  className="border-white/10 bg-slate-950/40 text-white placeholder:text-slate-500 focus-visible:ring-cyan-500/50"
                />
              </div>
              {error && <p className="text-sm text-rose-300">{error}</p>}
              <Button
                type="submit"
                className="w-full border-0 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 text-white shadow-lg shadow-cyan-950/40 hover:from-blue-600 hover:via-cyan-600 hover:to-teal-600"
                disabled={isLoading}
              >
                {isLoading ? "注册中..." : "注册"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm text-slate-300">
              已有账号？{" "}
              <Link
                href="/auth/login"
                className="text-cyan-300 underline underline-offset-4 transition hover:text-cyan-200"
              >
                去登录
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
