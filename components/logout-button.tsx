import { signOutAction } from "@/app/actions";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  return (
    <form action={signOutAction}>
      <Button type="submit">退出登录</Button>
    </form>
  );
}
