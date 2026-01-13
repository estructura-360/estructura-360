import { Sidebar } from "./Sidebar";
import { Toaster } from "@/components/ui/toaster";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/20 flex">
      <Sidebar />
      <main className="flex-1 md:ml-72 transition-all duration-300 ease-in-out p-4 sm:p-6 md:p-8 lg:p-12 overflow-x-hidden w-full">
        <div className="max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
          {children}
        </div>
      </main>
      <Toaster />
    </div>
  );
}
