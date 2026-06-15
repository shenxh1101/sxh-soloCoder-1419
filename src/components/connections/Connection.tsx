import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { ConnectionType } from '@/types';
import { CONNECTION_TYPE_COLORS } from '@/types';
import { getColorWithOpacity } from '@/utils/colors';

interface ConnectionProps {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  type: ConnectionType;
  label?: string;
  selected?: boolean;
  dimmed?: boolean;
  animated?: boolean;
  onClick?: () => void;
  temporary?: boolean;
}

export default function Connection({
  fromX,
  fromY,
  toX,
  toY,
  type,
  label,
  selected = false,
  dimmed = false,
  animated = true,
  onClick,
  temporary = false,
}: ConnectionProps) {
  const color = CONNECTION_TYPE_COLORS[type];

  const { pathD, midX, midY } = useMemo(() => {
    const dx = toX - fromX;
    const controlOffset = Math.min(Math.abs(dx) * 0.5, 120);

    const cp1x = fromX + controlOffset;
    const cp1y = fromY;
    const cp2x = toX - controlOffset;
    const cp2y = toY;

    const midX = (fromX + toX) / 2;
    const midY = (fromY + toY) / 2;

    return {
      pathD: `M ${fromX} ${fromY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${toX} ${toY}`,
      midX,
      midY,
    };
  }, [fromX, fromY, toX, toY]);

  const strokeWidth = selected ? 3.5 : 2;
  const opacity = dimmed ? 0.2 : temporary ? 0.6 : 1;
  const glowColor = getColorWithOpacity(color, selected ? 0.6 : 0.3);

  return (
    <g
      style={{ pointerEvents: onClick ? 'auto' : 'none', cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
    >
      <motion.path
        d={pathD}
        fill="none"
        stroke={glowColor}
        strokeWidth={strokeWidth + 8}
        strokeLinecap="round"
        initial={{ opacity: 0 }}
        animate={{ opacity: selected ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      />
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        opacity={opacity}
      />
      {animated && !temporary && (
        <path
          d={pathD}
          fill="none"
          stroke="white"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeDasharray="6 18"
          opacity={dimmed ? 0 : 0.5}
        >
          <animate
            attributeName="stroke-dashoffset"
            from="0"
            to="-24"
            dur="1s"
            repeatCount="indefinite"
          />
        </path>
      )}
      {label && (
        <g transform={`translate(${midX}, ${midY})`}>
          <rect
            x={-label.length * 6 - 8}
            y={-10}
            width={label.length * 12 + 16}
            height={20}
            rx={6}
            fill="#0f172a"
            stroke={color}
            strokeWidth={1}
            opacity={dimmed ? 0.1 : 0.9}
          />
          <text
            textAnchor="middle"
            dominantBaseline="middle"
            fill={color}
            fontSize={11}
            fontWeight={500}
            opacity={dimmed ? 0.2 : 1}
          >
            {label}
          </text>
        </g>
      )}
    </g>
  );
}
