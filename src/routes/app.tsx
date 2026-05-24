import * as React from "react";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/app/app-shell";
import { profileRepo } from "@/services/db";
import { useDb } from "@/hooks/use-db";
import { useAuth } from "@/services/auth/auth-context";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  const { user, loading: authLoading } = useAuth();
  const profile = useDb(() => profileRepo.get());
  const nav = useNavigate();
  const path = typeof window !== "undefined" ? window.location.pathname : "/app";

  React.useEffect(() => {
    if (authLoading) return;
    if (!user) {
      nav({ to: "/login" });
      return;
    }
    if (!profile && !path.includes("/app/onboarding")) {
      nav({ to: "/app/onboarding" });
    }
  }, [user, authLoading, profile, path, nav]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground text-sm">Carregando...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
