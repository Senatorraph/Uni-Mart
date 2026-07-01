import type { LucideIcon } from "lucide-react";
import { PackageOpen } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  icon: Icon = PackageOpen,
  title,
  subtitle,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/30 px-6 py-16 text-center">
      <div className="mb-4 rounded-full bg-primary/10 p-4">
        <Icon className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      {subtitle && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{subtitle}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
