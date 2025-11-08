import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background relative overflow-hidden">
        <div className="fixed inset-0 grid-pattern opacity-20 pointer-events-none" />
        <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-success/5 pointer-events-none" />
        <AppSidebar />
        <main className="flex-1 flex flex-col relative z-0">
          <header className="h-14 border-b border-border glass-strong flex items-center px-4 sticky top-0 z-10 shadow-glow">
            <SidebarTrigger />
          </header>
          <div className="flex-1 p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
