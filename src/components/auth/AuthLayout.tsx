import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { ProfileMenu } from "@/components/profile/ProfileMenu";
import { ToastHost } from "@/components/ui/Toast";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="flex h-16 items-center justify-between px-6">
        <Link href="/" aria-label="Corise home">
          <Logo size="sm" />
        </Link>
        <ProfileMenu />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">{children}</div>
      </main>
      <ToastHost />
    </div>
  );
}
