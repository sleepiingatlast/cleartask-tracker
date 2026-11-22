import { TriangleAlert } from "lucide-react";

import type { StorageStatus } from "@/hooks/use-tasks";

const MESSAGES: Partial<Record<StorageStatus, string>> = {
  unavailable: "Browser storage isn't available, so tasks will be lost when you close this tab.",
  corrupted: "Some saved data couldn't be read and was skipped. Valid tasks were kept.",
  "save-failed": "Your latest changes couldn't be saved to browser storage.",
};

export function StorageNotice({ status }: { status: StorageStatus }) {
  const message = MESSAGES[status];
  if (!message) return null;
  return (
    <div role="status" className="flex items-start gap-2 rounded-lg border bg-accent px-3 py-2 text-sm text-accent-foreground">
      <TriangleAlert className="mt-0.5 size-4 shrink-0" />
      <p>{message}</p>
    </div>
  );
}
