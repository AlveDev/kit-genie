import * as React from "react";
import { createFileRoute, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/app/app-shell";
import { profileRepo } from "@/services/db";
import { useDb } from "@/hooks/use-db";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  const profile = useDb(() => profileRepo.get());
  const nav = useNavigate();
  const path = typeof window !== "undefined" ? window.location.pathname : "/app";

  React.useEffect(() => {
    if (!profile && !path.includes("/app/onboarding")) {
      nav({ to: "/app/onboarding" });
    }
  }, [profile, path, nav]);

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
