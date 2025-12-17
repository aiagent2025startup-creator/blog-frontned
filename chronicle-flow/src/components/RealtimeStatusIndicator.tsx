import { useRealtime } from '@/context/RealtimeContext';
import { Circle } from 'lucide-react';

export function RealtimeStatusIndicator() {
  const { connected } = useRealtime();

  return (
    <div className="flex items-center gap-2 text-sm">
      <Circle
        size={8}
        className={`fill-current ${
          connected
            ? 'text-green-500'
            : 'text-red-500'
        }`}
      />
      <span className="hidden sm:inline text-xs font-medium">
        {connected ? 'Live' : 'Offline'}
      </span>
    </div>
  );
}
