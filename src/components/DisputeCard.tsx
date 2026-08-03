import { useState } from "react";
import { AlertTriangle, CheckCircle, Loader2, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatNaira } from "@/lib/format";
import type { Dispute } from "@/types";

export type AdminDispute = Dispute & {
  order: { id: string; total_amount: number } | null;
  raised_by_profile: { full_name: string } | null;
};

interface DisputeCardProps {
  dispute: AdminDispute;
  onResolve: (id: string, resolution: "resolved_refund" | "resolved_release", note: string) => Promise<void>;
}

const DISPUTE_STATUS_STYLES: Record<string, string> = {
  open: "bg-destructive/15 text-destructive",
  under_review: "bg-accent/15 text-accent",
  resolved_refund: "bg-success/15 text-success",
  resolved_release: "bg-success/15 text-success",
  closed: "bg-muted text-muted-foreground",
};

const DISPUTE_STATUS_LABELS: Record<string, string> = {
  open: "Open",
  under_review: "Under Review",
  resolved_refund: "Refunded",
  resolved_release: "Released to Vendor",
  closed: "Closed",
};

export function DisputeCard({ dispute, onResolve }: DisputeCardProps) {
  const [showResolveForm, setShowResolveForm] = useState(false);
  const [resolutionNote, setResolutionNote] = useState("");
  const [resolving, setResolving] = useState(false);

  async function handleResolve(resolution: "resolved_refund" | "resolved_release") {
    if (!resolutionNote.trim()) return;
    setResolving(true);
    await onResolve(dispute.id, resolution, resolutionNote.trim());
    setResolving(false);
  }

  const aiScore = dispute.classifier_score;
  const aiRecommendation = dispute.classifier_recommendation;
  const isResolved = !["open", "under_review"].includes(dispute.status);

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <p className="text-sm font-semibold">Dispute #{dispute.id.slice(0, 8).toUpperCase()}</p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Order #{dispute.order?.id?.slice(0, 8).toUpperCase()}
            {dispute.order && ` · ${formatNaira(dispute.order.total_amount)}`}
          </p>
          <p className="text-xs text-muted-foreground">Filed by: {dispute.raised_by_profile?.full_name}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              DISPUTE_STATUS_STYLES[dispute.status] ?? "bg-muted text-muted-foreground"
            }`}
          >
            {DISPUTE_STATUS_LABELS[dispute.status] ?? dispute.status}
          </span>
          {aiScore !== null && aiScore !== undefined && (
            <span
              className={`rounded-full px-2 py-0.5 font-mono text-xs ${
                aiScore > 0.6
                  ? "bg-destructive/15 text-destructive"
                  : aiScore > 0.4
                    ? "bg-accent/15 text-accent"
                    : "bg-success/15 text-success"
              }`}
            >
              AI: {(aiScore * 100).toFixed(0)}% refund
            </span>
          )}
        </div>
      </div>

      <p className="rounded-lg bg-background p-2 text-sm text-muted-foreground">"{dispute.reason}"</p>

      {aiRecommendation && (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-primary">⚡ AI recommends:</span>
          <span
            className={`font-medium ${
              aiRecommendation === "refund"
                ? "text-destructive"
                : aiRecommendation === "release"
                  ? "text-success"
                  : "text-accent"
            }`}
          >
            {aiRecommendation === "refund"
              ? "Issue refund to student"
              : aiRecommendation === "release"
                ? "Release payment to vendor"
                : "Manual review needed"}
          </span>
        </div>
      )}

      {isResolved ? (
        <div className="rounded-lg border border-border bg-background p-3 text-xs">
          <p className="font-medium text-muted-foreground">
            {dispute.resolved_at &&
              `Resolved ${new Date(dispute.resolved_at).toLocaleDateString("en-NG", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}`}
          </p>
          {dispute.resolution_note && <p className="mt-1 text-foreground">{dispute.resolution_note}</p>}
        </div>
      ) : !showResolveForm ? (
        <Button className="w-full rounded-lg glow-primary" onClick={() => setShowResolveForm(true)}>
          Review & Resolve
        </Button>
      ) : (
        <div className="space-y-3">
          <Textarea
            value={resolutionNote}
            onChange={(e) => setResolutionNote(e.target.value)}
            placeholder="Add resolution note (required)..."
            rows={2}
            className="rounded-lg border-border bg-background"
          />
          <div className="flex gap-2">
            <Button
              variant="destructive"
              size="sm"
              className="flex-1 gap-1 rounded-lg text-xs"
              disabled={resolving || !resolutionNote.trim()}
              onClick={() => handleResolve("resolved_refund")}
            >
              {resolving ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
              Refund Student
            </Button>
            <Button
              size="sm"
              className="flex-1 gap-1 rounded-lg bg-success text-xs text-success-foreground hover:bg-success/90"
              disabled={resolving || !resolutionNote.trim()}
              onClick={() => handleResolve("resolved_release")}
            >
              {resolving ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
              Release to Vendor
            </Button>
          </div>
          <button
            onClick={() => setShowResolveForm(false)}
            className="w-full py-1 text-xs text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
