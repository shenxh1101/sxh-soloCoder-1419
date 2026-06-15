import React, { useState } from 'react';
import {
  FileText,
  Code,
  Image,
  Bookmark,
  Mic,
  GitBranch,
} from 'lucide-react';
import type { NodeType } from '@/types';
import { NODE_TYPE_LABELS, NODE_COLORS } from '@/types';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ToolbarProps {
  pendingNodeType: NodeType | null;
  setPendingNodeType: (type: NodeType | null) => void;
}

interface ToolItem {
  type: NodeType;
  icon: React.ReactNode;
  color: string;
}

const tools: ToolItem[] = [
  { type: 'text', icon: <FileText className="w-5 h-5" />, color: NODE_COLORS[0] },
  { type: 'code', icon: <Code className="w-5 h-5" />, color: NODE_COLORS[3] },
  { type: 'image', icon: <Image className="w-5 h-5" />, color: NODE_COLORS[4] },
  { type: 'bookmark', icon: <Bookmark className="w-5 h-5" />, color: NODE_COLORS[1] },
  { type: 'audio', icon: <Mic className="w-5 h-5" />, color: NODE_COLORS[5] },
  { type: 'mindmap', icon: <GitBranch className="w-5 h-5" />, color: NODE_COLORS[2] },
];

export default function Toolbar({ pendingNodeType, setPendingNodeType }: ToolbarProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleToolClick = (type: NodeType) => {
    setPendingNodeType(pendingNodeType === type ? null : type);
  };

  return (
    <aside className="absolute left-4 top-1/2 -translate-y-1/2 z-30">
      <div className="glass-panel shadow-panel p-2 flex flex-col gap-1.5">
        {tools.map((tool, index) => (
          <div
            key={tool.type}
            className="relative"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <button
              onClick={() => handleToolClick(tool.type)}
              className={cn(
                'relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 border',
                pendingNodeType === tool.type
                  ? 'bg-white/15 border-white/20 scale-105'
                  : 'bg-transparent border-transparent hover:bg-white/10 hover:border-white/10'
              )}
              style={{
                color: pendingNodeType === tool.type ? tool.color : undefined,
              }}
            >
              <span
                className={cn(
                  'transition-all duration-200',
                  pendingNodeType === tool.type && 'drop-shadow-lg'
                )}
                style={{
                  color:
                    pendingNodeType === tool.type || hoveredIndex === index
                      ? tool.color
                      : '#94a3b8',
                }}
              >
                {tool.icon}
              </span>
              {pendingNodeType === tool.type && (
                <motion.div
                  layoutId="active-tool"
                  className="absolute inset-0 rounded-xl border-2 pointer-events-none"
                  style={{ borderColor: tool.color }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
            <AnimatePresence>
              {hoveredIndex === index && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-garden-panel border border-white/10 shadow-panel text-sm text-garden-text whitespace-nowrap pointer-events-none z-50"
                >
                  {NODE_TYPE_LABELS[tool.type]}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {pendingNodeType && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -bottom-16 left-0 right-0 text-center"
        >
          <p className="text-xs text-garden-muted">
            双击画布空白处
            <br />
            创建节点
          </p>
        </motion.div>
      )}
    </aside>
  );
}
