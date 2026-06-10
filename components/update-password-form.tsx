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
import { useRouter } from "next/navigation";
import { useState } from "react";

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      // Update this route to redirect to an authenticated route. The user already has an active session.
      router.push("/protected");
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
          <CardTitle className="text-2xl text-white">设置新密码</CardTitle>
          <CardDescription className="text-slate-300">
            请输入你的新密码后保存。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleForgotPassword}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-slate-200">新密码</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="请输入新密码"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-white/10 bg-slate-950/40 text-white placeholder:text-slate-500 focus-visible:ring-cyan-500/50"
                />
              </div>
              {error && <p className="text-sm text-rose-300">{error}</p>}
              <Button
                type="submit"
                className="w-full border-0 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 text-white shadow-lg shadow-cyan-950/40 hover:from-blue-600 hover:via-cyan-600 hover:to-teal-600"
                disabled={isLoading}
              >
                {isLoading ? "保存中..." : "保存新密码"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
