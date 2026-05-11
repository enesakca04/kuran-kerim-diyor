import { AppShell } from "@/components/AppShell";
import { AuthForm } from "@/components/AuthForm";

export default function RegisterPage() {
  return (
    <AppShell>
      <AuthForm mode="register" />
    </AppShell>
  );
}
