import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tag, Layers, RotateCcw } from 'lucide-react';
import { useGardenStore } from '@/store/useGardenStore';
import { NODE_TYPE_LABELS } from '@/types';
import type { NodeType } from '@/types';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

const NODE_TYPES: NodeType[] = ['text', 'code', 'image', 'bookmark', 'audio', 'mindmap'];

const NODE_TYPE_ICONS: Record<NodeType, string> = {
  text: '📝',
  code: '💻',
  image: '🖼️',
  bookmark: '🔖',
  audio: '🎙️',
  mindmap: '🧠',
};

export default function FilterPanel() {
  const showFilterPanel = useGardenStore((s) => s.showFilterPanel);
  const toggleFilterPanel = useGardenStore((s) => s.toggleFilterPanel);
  const tags = useGardenStore((s) => s.tags);
  const filter = useGardenStore((s) => s.filter);
  const setFilter = useGardenStore((s) => s.setFilter);
  const getFilteredNodes = useGardenStore((s) => s.getFilteredNodes);
  const nodes = useGardenStore((s) => s.nodes);

  const filteredCount = getFilteredNodes().length;
  const totalCount = nodes.length;

  const toggleTag = (tagId: string) => {
    const selected = filter.selectedTags.includes(tagId)
      ? filter.selectedTags.filter((t) => t !== tagId)
      : [...filter.selectedTags, tagId];
    setFilter({ selectedTags: selected });
  };

  const toggleNodeType = (type: NodeType) => {
    const selected = filter.nodeTypes.includes(type)
      ? filter.nodeTypes.filter((t) => t !== type)
      : [...filter.nodeTypes, type];
    setFilter({ nodeTypes: selected });
  };

  const resetFilter = () => {
    setFilter({
      selectedTags: [],
      nodeTypes: [],
      searchText: '',
      dateRange: null,
    });
  };

  return (
    <AnimatePresence>
      {showFilterPanel && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30"
            onClick={toggleFilterPanel}
          />
          <motion.div
            initial={{ x: 380, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 380, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-80 glass-panel shadow-panel z-40 border-l border-white/10 flex flex-col"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <h2 className="font-display text-lg font-semibold text-garden-text">
                筛选器
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="icon"
                  size="sm"
                  onClick={resetFilter}
                  title="重置筛选"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
                <Button
                  variant="icon"
                  size="sm"
                  onClick={toggleFilterPanel}
                  title="关闭"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-garden-primary/10 border border-garden-primary/20">
                <span className="text-garden-primary font-medium text-sm">
                  筛选结果：{filteredCount} / {totalCount} 个节点
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Layers className="w-4 h-4 text-garden-muted" />
                  <h3 className="text-sm font-medium text-garden-text">节点类型</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {NODE_TYPES.map((type) => {
                    const isSelected = filter.nodeTypes.includes(type);
                    return (
                      <button
                        key={type}
                        onClick={() => toggleNodeType(type)}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all duration-200',
                          isSelected
                            ? 'bg-garden-primary/15 border-garden-primary/30 text-garden-text'
                            : 'bg-white/5 border-white/10 text-garden-muted hover:bg-white/10 hover:text-garden-text'
                        )}
                      >
                        <span className="text-base">{NODE_TYPE_ICONS[type]}</span>
                        <span className="truncate">{NODE_TYPE_LABELS[type]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-4 h-4 text-garden-muted" />
                  <h3 className="text-sm font-medium text-garden-text">标签</h3>
                </div>
                {tags.length === 0 ? (
                  <p className="text-sm text-garden-muted/60 px-2">
                    暂无标签
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => {
                      const isSelected = filter.selectedTags.includes(tag.id);
                      return (
                        <button
                          key={tag.id}
                          onClick={() => toggleTag(tag.id)}
                          className={cn(
                            'transition-all duration-200',
                            isSelected && 'scale-105'
                          )}
                        >
                          <Badge
                            text={tag.name}
                            color={isSelected ? tag.color : undefined}
                            className={cn(
                              !isSelected && 'opacity-60 hover:opacity-100'
                            )}
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
