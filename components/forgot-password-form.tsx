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
import { useState } from "react";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      // The url which will be included in the email. This URL needs to be configured in your redirect URLs in the Supabase dashboard at https://supabase.com/dashboard/project/_/auth/url-configuration
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "发生了未知错误");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {success ? (
        <Card className="border-white/10 bg-white/5 text-white shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl text-white">请查收邮件</CardTitle>
            <CardDescription className="text-slate-300">重置密码邮件已发送</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-300">
              如果这个邮箱已注册文子TODO，我们会向你发送一封重置密码邮件。
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-white/10 bg-white/5 text-white shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl text-white">重置密码</CardTitle>
            <CardDescription className="text-slate-300">
              输入你的邮箱，我们会发送一封重置密码邮件。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword}>
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
                {error && <p className="text-sm text-rose-300">{error}</p>}
                <Button
                  type="submit"
                  className="w-full border-0 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 text-white shadow-lg shadow-cyan-950/40 hover:from-blue-600 hover:via-cyan-600 hover:to-teal-600"
                  disabled={isLoading}
                >
                  {isLoading ? "发送中..." : "发送重置邮件"}
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
      )}
    </div>
  );
}
