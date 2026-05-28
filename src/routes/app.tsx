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

  const isOnboarding = path.includes("/app/onboarding");

  React.useEffect(() => {
    if (authLoading) return;

    // Não autenticado → login
    if (!user) {
      nav({ to: "/login" });
      return;
    }

    // Onboarding incompleto → força onboarding (exceto se já estiver lá)
    if (!profile?.onboardingCompleted && !isOnboarding) {
      nav({ to: "/app/onboarding" });
      return;
    }

    // Onboarding já concluído mas tentou acessar /app/onboarding → dashboard
    if (profile?.onboardingCompleted && isOnboarding) {
      nav({ to: "/app" });
    }
  }, [user, authLoading, profile, isOnboarding, nav]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 rounded-xl bg-primary/10 animate-pulse" />
          <p className="text-muted-foreground text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Onboarding roda fora do AppShell (tela cheia, sem sidebar)
  if (isOnboarding) {
    return <Outlet />;
  }

  // Aguarda resolução do perfil antes de renderizar o app
  if (!profile?.onboardingCompleted) return null;

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}