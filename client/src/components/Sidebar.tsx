import { Link, useLocation } from "wouter";
import { Calculator, BarChart3, FileText, BookOpen, Menu, Hammer, HardHat, Info, ShoppingBag, CalendarDays, Camera, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Calculadora", href: "/", icon: Calculator },
  { name: "Catálogo", href: "/catalog", icon: Package },
  { name: "Cronograma", href: "/schedule", icon: CalendarDays },
  { name: "Bitácora", href: "/logbook", icon: Camera },
  { name: "Comparativa", href: "/comparative", icon: BarChart3 },
  { name: "Marketplace", href: "/marketplace", icon: ShoppingBag },
  { name: "Presupuesto", href: "/budget", icon: FileText },
  { name: "Info Técnica", href: "/technical", icon: BookOpen },
  { name: "Acerca de", href: "/about", icon: Info },
];

export function Sidebar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const NavContent = () => (
    <div className="flex flex-col h-full bg-primary text-primary-foreground">
      <div className="p-6 border-b border-primary-foreground/10">
        <div className="flex items-center gap-3">
          <div className="bg-accent p-2 rounded-lg">
            <HardHat className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display tracking-wide text-white">ESTRUCTURA</h1>
            <p className="text-xs text-white font-medium tracking-[0.2em] uppercase">360 Engineering</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group",
                  isActive
                    ? "bg-accent text-white shadow-lg shadow-accent/20 translate-x-1"
                    : "text-primary-foreground/70 hover:bg-white/5 hover:text-white"
                )}
                onClick={() => setIsOpen(false)}
              >
                <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "group-hover:text-accent")} />
                <span className="font-medium">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-primary-foreground/10 bg-black/20">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
            <Hammer className="h-5 w-5 text-accent" />
          </div>
          <div>
            <p className="text-sm font-medium">Soporte Técnico</p>
            <p className="text-xs text-primary-foreground/50">v1.0.0 PRO</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Trigger */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="bg-primary border-none text-white shadow-lg">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[280px] border-r-0" aria-describedby={undefined}>
            <VisuallyHidden>
              <SheetTitle>Menú de navegación</SheetTitle>
            </VisuallyHidden>
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-72 flex-col fixed inset-y-0 z-50 shadow-2xl">
        <NavContent />
      </div>
    </>
  );
}
