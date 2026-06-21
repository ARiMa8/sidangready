import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface LoadingStateProps {
  title: string;
  description?: string;
}

export function LoadingState({ title, description }: LoadingStateProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-5">
        <Loader2 className="h-5 w-5 animate-spin text-indigo-300" />
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          {description ? <p className="text-sm text-slate-400">{description}</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}
