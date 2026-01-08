import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
  highlight?: boolean;
}

export function MetricCard({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  className,
  highlight = false,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl p-6 transition-all duration-300 border",
        highlight
          ? "bg-primary text-primary-foreground border-primary shadow-xl shadow-primary/20"
          : "bg-card text-card-foreground border-border shadow-sm hover:shadow-md hover:border-accent/20",
        className
      )}
    >
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className={cn("text-sm font-medium", highlight ? "text-primary-foreground" : "text-muted-foreground")}>
            {title}
          </p>
          <div className="flex items-baseline gap-1">
            <h3 className="text-3xl font-bold font-display tracking-tight">
              {value}
            </h3>
            {unit && <span className={cn("text-sm font-medium", highlight ? "text-accent" : "text-muted-foreground")}>{unit}</span>}
          </div>
          {subtitle && (
            <p className={cn("text-xs mt-1", highlight ? "text-primary-foreground/80" : "text-muted-foreground/80")}>
              {subtitle}
            </p>
          )}
        </div>
        <div className={cn(
          "p-3 rounded-xl",
          highlight ? "bg-accent text-white" : "bg-primary/5 text-primary"
        )}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      
      {trendValue && (
        <div className="mt-4 flex items-center gap-2">
          <span className={cn(
            "text-xs font-bold px-2 py-0.5 rounded-full",
            trend === "up" 
              ? (highlight ? "bg-green-500/20 text-green-300" : "bg-green-100 text-green-700")
              : (highlight ? "bg-red-500/20 text-red-300" : "bg-red-100 text-red-700")
          )}>
            {trend === "up" ? "+" : "-"}{trendValue}
          </span>
          <span className={cn("text-xs", highlight ? "text-primary-foreground/50" : "text-muted-foreground")}>
            vs. Tradicional
          </span>
        </div>
      )}
      
      {/* Decorative gradient blob */}
      <div className={cn(
        "absolute -bottom-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none",
        highlight ? "bg-accent" : "bg-primary"
      )} />
    </div>
  );
}
