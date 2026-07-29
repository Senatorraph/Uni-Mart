import { Loader2 } from "lucide-react";

export function LoadingSpinner({ label, className }: { label?: string; className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 py-10 text-muted-foreground ${className ?? ""}`}>
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}
