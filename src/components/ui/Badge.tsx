import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  text: string;
  color?: string;
  onClose?: () => void;
  className?: string;
}

export default function Badge({ text, color, onClose, className }: BadgeProps) {
  const backgroundColor = color ? `${color}20` : 'rgba(255,255,255,0.08)';
  const borderColor = color ? `${color}40` : 'rgba(255,255,255,0.1)';
  const textColor = color || '#e2e8f0';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border',
        className
      )}
      style={{
        backgroundColor,
        borderColor,
        color: textColor,
      }}
    >
      {text}
      {onClose && (
        <button
          onClick={onClose}
          className="ml-0.5 p-0.5 rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}
