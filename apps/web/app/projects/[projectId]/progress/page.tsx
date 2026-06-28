import { ProgressClient } from "@/components/analysis/progress-client";

export default async function ProgressPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <ProgressClient projectId={projectId} />;
}
