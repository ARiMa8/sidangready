import { ResultViewClient } from "@/components/results/result-view-client";

export default async function ChecklistPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <ResultViewClient projectId={projectId} view="checklist" />;
}
