"use client";

import { DemoFab } from "@/components/demo/DemoFab";
import { StaticExportNav } from "@/components/layout/StaticExportNav";
import { AppProvider } from "@/context/AppContext";
import { CoriseProvider } from "@/context/CoriseContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CoriseProvider>
      <AppProvider>
        {children}
        <StaticExportNav />
        <DemoFab />
      </AppProvider>
    </CoriseProvider>
  );
}
