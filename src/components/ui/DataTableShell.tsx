import { cn } from '@/lib/utils';

export function DataTableShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn('table-shell', className)}>{children}</div>;
}
