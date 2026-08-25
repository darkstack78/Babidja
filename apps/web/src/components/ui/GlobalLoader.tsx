import { Loader2 } from 'lucide-react';

export default function GlobalLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="size-10 animate-spin text-primary" />
    </div>
  );
}
