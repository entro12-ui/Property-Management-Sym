'use client';

import { useTransition } from 'react';

type DeleteEntityButtonProps = {
  action: () => Promise<void>;
  confirmMessage: string;
  label?: string;
};

export function DeleteEntityButton({
  action,
  confirmMessage,
  label = 'Delete',
}: DeleteEntityButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!window.confirm(confirmMessage)) return;
        startTransition(() => {
          void action();
        });
      }}
      className="text-red-500 hover:text-red-600 hover:underline disabled:opacity-50"
    >
      {isPending ? 'Deleting…' : label}
    </button>
  );
}
