import { motion } from 'framer-motion';
import { FileText, Code2, Image, Link, Mic, GitBranch } from 'lucide-react';
import type { KnowledgeNode, NodeType } from '@/types';
import { NODE_TYPE_LABELS } from '@/types';
import { cn } from '@/lib/utils';
import TextNode from './TextNode';
import CodeNode from './CodeNode';
import ImageNode from './ImageNode';
import BookmarkNode from './BookmarkNode';
import AudioNode from './AudioNode';
import MindMapNode from './MindMapNode';

const NODE_ICONS: Record<NodeType, typeof FileText> = {
  text: FileText,
  code: Code2,
  image: Image,
  bookmark: Link,
  audio: Mic,
  mindmap: GitBranch,
};

const glowColorMap: Record<string, string> = {
  '#10b981': 'rgba(16, 185, 129, 0.5)',
  '#f59e0b': 'rgba(245, 158, 11, 0.5)',
  '#ec4899': 'rgba(236, 72, 153, 0.5)',
  '#8b5cf6': 'rgba(139, 92, 246, 0.5)',
  '#3b82f6': 'rgba(59, 130, 246, 0.5)',
  '#ef4444': 'rgba(239, 68, 68, 0.5)',
  '#14b8a6': 'rgba(20, 184, 166, 0.5)',
  '#f97316': 'rgba(249, 115, 22, 0.5)',
};

interface NodeRendererProps {
  node: KnowledgeNode;
  isSelected: boolean;
  isDimmed: boolean;
  onClick: (node: KnowledgeNode) => void;
  onDoubleClick: (node: KnowledgeNode) => void;
  onStartConnect: (node: KnowledgeNode, e: React.MouseEvent) => void;
  onMouseDown: (node: KnowledgeNode, e: React.MouseEvent) => void;
}

function renderNodeContent(node: KnowledgeNode) {
  switch (node.type) {
    case 'text':
      return <TextNode node={node} />;
    case 'code':
      return <CodeNode node={node} />;
    case 'image':
      return <ImageNode node={node} />;
    case 'bookmark':
      return <BookmarkNode node={node} />;
    case 'audio':
      return <AudioNode node={node} />;
    case 'mindmap':
      return <MindMapNode node={node} />;
    default:
      return null;
  }
}

export default function NodeRenderer({
  node,
  isSelected,
  isDimmed,
  onClick,
  onDoubleClick,
  onStartConnect,
  onMouseDown,
}: NodeRendererProps) {
  const Icon = NODE_ICONS[node.type];
  const glowColor = glowColorMap[node.color] || 'rgba(16, 185, 129, 0.5)';

  return (
    <motion.div
      layout
      drag
      dragMomentum={false}
      dragElastic={0}
      onDragStart={(e) => onMouseDown(node, e as unknown as React.MouseEvent)}
      onMouseDown={(e) => onMouseDown(node, e)}
      onClick={(e) => {
        e.stopPropagation();
        onClick(node);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onDoubleClick(node);
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onStartConnect(node, e as unknown as React.MouseEvent);
      }}
      style={{
        position: 'absolute',
        left: node.x,
        top: node.y,
      }}
      whileHover={{ scale: isDimmed ? 1 : 1.02 }}
      whileTap={{ scale: isDimmed ? 1 : 0.98 }}
      className={cn(
        'w-[280px] select-none cursor-grab active:cursor-grabbing',
        isDimmed && 'opacity-30 pointer-events-none'
      )}
    >
      <div
        className={cn(
          'node-card relative overflow-hidden',
          isSelected && 'shadow-[0_0_0_2px_var(--glow-color),0_0_30px_var(--glow-color)]'
        )}
        style={{
          borderLeft: `4px solid ${node.color}`,
          '--glow-color': glowColor,
        } as React.CSSProperties & { '--glow-color': string }}
      >
        <div className="px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div
              className="flex items-center justify-center w-7 h-7 rounded-lg"
              style={{ backgroundColor: `${node.color}20`, color: node.color }}
            >
              <Icon size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-garden-text truncate">
                {node.title}
              </h3>
              <p className="text-xs text-garden-muted">
                {NODE_TYPE_LABELS[node.type]}
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 py-3">
          {renderNodeContent(node)}
        </div>

        {node.tags.length > 0 && (
          <div className="px-4 py-2.5 border-t border-white/10 flex flex-wrap gap-1.5">
            {node.tags.map((tag, idx) => (
              <span
                key={idx}
                className="badge bg-white/5 text-garden-muted border border-white/10"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
