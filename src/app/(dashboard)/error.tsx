'use client';

import { DashboardErrorPanel } from '@/components/ui/DashboardErrorPanel';

export default function DashboardError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <DashboardErrorPanel error={error} />;
}
