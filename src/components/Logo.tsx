export function Logo({ className }: { className?: string }) {
  return (
    <span className={`text-lg font-extrabold tracking-tight ${className ?? ""}`}>
      Uni<span className="text-primary">Market</span>
    </span>
  );
}
