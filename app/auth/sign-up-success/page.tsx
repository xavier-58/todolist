import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Page() {
  return (
    <Card className="border-white/10 bg-white/5 text-white shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl text-white">注册成功</CardTitle>
        <CardDescription className="text-slate-300">请前往邮箱完成确认</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm leading-6 text-slate-300">
          你已经成功创建账号。请先前往邮箱完成验证，然后再返回登录。
        </p>
        <Button
          asChild
          className="w-full border-0 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 text-white shadow-lg shadow-cyan-950/40 hover:from-blue-600 hover:via-cyan-600 hover:to-teal-600"
        >
          <Link href="/auth/login">前往登录</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
