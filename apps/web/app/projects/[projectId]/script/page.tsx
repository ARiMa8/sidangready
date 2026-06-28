import { ResultViewClient } from "@/components/results/result-view-client";

export default async function ScriptPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <ResultViewClient projectId={projectId} view="script" />;
}
