import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import type { ReactNode } from "react";

/**
 * Shared site shell: fixed minimal header, atmospheric content band and
 * minimal footer. The film-grain overlay is applied once here so every route
 * inherits the same cinematic treatment.
 */
export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="grain-overlay flex min-h-dvh flex-col bg-background">
      <Header />
      <main data-ocid="site.main" className="flex-1 bg-background">
        {children}
      </main>
      <Footer />
    </div>
  );
}
