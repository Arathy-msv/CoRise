"use client";

import { DemoFab } from "@/components/demo/DemoFab";
import { AppProvider } from "@/context/AppContext";
import { CoriseProvider } from "@/context/CoriseContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CoriseProvider>
      <AppProvider>
        {children}
        <DemoFab />
      </AppProvider>
    </CoriseProvider>
  );
}
