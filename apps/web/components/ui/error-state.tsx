import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title: string;
  description: string;
  actionLabel?: string;
}

export function ErrorState({ title, description, actionLabel }: ErrorStateProps) {
  return (
    <Card className="border-rose-500/40 bg-rose-500/5">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-rose-500/10 text-rose-300">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-rose-100">{title}</h3>
            <p className="mt-1 text-sm text-rose-100/75">{description}</p>
          </div>
        </div>
        {actionLabel ? (
          <Button variant="secondary" size="sm">
            {actionLabel}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
