import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  Code,
  Image,
  Bookmark,
  Mic,
  GitBranch,
  ArrowRight,
  Calendar,
  Clock,
  Edit3,
} from 'lucide-react';
import { useGardenStore } from '@/store/useGardenStore';
import { NODE_TYPE_LABELS, DEFAULT_CANVAS } from '@/types';
import type { KnowledgeNode, NodeType } from '@/types';
import { cn } from '@/lib/utils';

const NODE_TYPE_ICONS: Record<NodeType, React.ReactNode> = {
  text: <FileText className="w-4 h-4" />,
  code: <Code className="w-4 h-4" />,
  image: <Image className="w-4 h-4" />,
  bookmark: <Bookmark className="w-4 h-4" />,
  audio: <Mic className="w-4 h-4" />,
  mindmap: <GitBranch className="w-4 h-4" />,
};

type DateGroup = 'today' | 'yesterday' | 'thisWeek' | 'thisMonth' | 'earlier';

const DATE_GROUP_LABELS: Record<DateGroup, string> = {
  today: '今天',
  yesterday: '昨天',
  thisWeek: '本周',
  thisMonth: '本月',
  earlier: '更早',
};

function getDateGroup(timestamp: number): DateGroup {
  const now = new Date();
  const date = new Date(timestamp);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart.getTime() - 86400000);
  const weekStart = new Date(todayStart.getTime() - todayStart.getDay() * 86400000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  if (date >= todayStart) return 'today';
  if (date >= yesterdayStart) return 'yesterday';
  if (date >= weekStart) return 'thisWeek';
  if (date >= monthStart) return 'thisMonth';
  return 'earlier';
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatFullDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function TimelineView() {
  const navigate = useNavigate();
  const nodes = useGardenStore((s) => s.nodes);
  const tags = useGardenStore((s) => s.tags);
  const getFilteredNodes = useGardenStore((s) => s.getFilteredNodes);
  const setCanvas = useGardenStore((s) => s.setCanvas);
  const selectNode = useGardenStore((s) => s.selectNode);

  const [timeMode, setTimeMode] = useState<'createdAt' | 'updatedAt'>('createdAt');

  const filteredNodes = getFilteredNodes();
  const sortedNodes = [...filteredNodes].sort((a, b) => b[timeMode] - a[timeMode]);

  const grouped: Record<DateGroup, KnowledgeNode[]> = {
    today: [],
    yesterday: [],
    thisWeek: [],
    thisMonth: [],
    earlier: [],
  };

  sortedNodes.forEach((node) => {
    const group = getDateGroup(node[timeMode]);
    grouped[group].push(node);
  });

  const isEdited = (node: KnowledgeNode) =>
    Math.abs(node.updatedAt - node.createdAt) > 2000;

  const handleNodeClick = (node: KnowledgeNode) => {
    setCanvas({
      ...DEFAULT_CANVAS,
      offsetX: -node.x + 400,
      offsetY: -node.y + 300,
    });
    selectNode(node.id);
    navigate('/');
  };

  const getNodeTags = (node: KnowledgeNode) =>
    node.tags
      .map((tid) => tags.find((t) => t.id === tid))
      .filter(Boolean)
      .slice(0, 3);

  return (
    <div className="flex-1 overflow-x-auto overflow-y-hidden">
      <div className="min-w-full h-full px-8 py-8">
        <div className="flex items-center justify-between mb-8 px-4 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-garden-primary" />
            <h2 className="font-display text-2xl font-semibold text-garden-text">
              时间轴视图
            </h2>
            <span className="text-sm text-garden-muted">
              共 {sortedNodes.length} 个节点
            </span>
          </div>
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
            <button
              onClick={() => setTimeMode('createdAt')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
                timeMode === 'createdAt'
                  ? 'bg-garden-primary/20 text-garden-primary shadow-sm'
                  : 'text-garden-muted hover:text-garden-text'
              )}
            >
              <Clock className="w-3.5 h-3.5" />
              创建时间
            </button>
            <button
              onClick={() => setTimeMode('updatedAt')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
                timeMode === 'updatedAt'
                  ? 'bg-garden-primary/20 text-garden-primary shadow-sm'
                  : 'text-garden-muted hover:text-garden-text'
              )}
            >
              <Edit3 className="w-3.5 h-3.5" />
              修改时间
            </button>
          </div>
        </div>

        <div className="relative">
          {(Object.keys(grouped) as DateGroup[]).map((groupKey) => {
            const groupNodes = grouped[groupKey];
            if (groupNodes.length === 0) return null;

            return (
              <div key={groupKey} className="mb-10">
                <div className="sticky left-0 flex items-center gap-3 mb-4 px-4">
                  <div className="w-2 h-2 rounded-full bg-garden-primary shadow-glow-emerald" />
                  <h3 className="font-semibold text-garden-text">
                    {DATE_GROUP_LABELS[groupKey]}
                  </h3>
                  <span className="text-xs text-garden-muted">
                    {groupNodes.length} 个
                  </span>
                  <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
                </div>

                <div className="flex gap-4 overflow-x-auto pb-4 px-4">
                  {groupNodes.map((node, index) => (
                    <motion.div
                      key={node.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.03 }}
                      onClick={() => handleNodeClick(node)}
                      className="flex-shrink-0 w-64 cursor-pointer group"
                    >
                      <div
                        className="glass-panel shadow-node p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border-l-4 relative overflow-hidden"
                        style={{ borderLeftColor: node.color }}
                      >
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                          style={{
                            background: `linear-gradient(135deg, ${node.color}08 0%, transparent 60%)`,
                          }}
                        />

                        <div className="relative">
                          <div className="flex items-start justify-between mb-3">
                            <div
                              className="flex items-center gap-2 px-2 py-1 rounded-lg border"
                              style={{
                                backgroundColor: `${node.color}15`,
                                borderColor: `${node.color}30`,
                                color: node.color,
                              }}
                            >
                              {NODE_TYPE_ICONS[node.type]}
                              <span className="text-xs font-medium">
                                {NODE_TYPE_LABELS[node.type]}
                              </span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-garden-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                          </div>

                          <h4 className="font-medium text-garden-text mb-2 line-clamp-2 group-hover:text-white transition-colors">
                            {node.title}
                          </h4>

                          {getNodeTags(node).length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {getNodeTags(node).map((tag) =>
                                tag ? (
                                  <span
                                    key={tag.id}
                                    className="px-2 py-0.5 rounded-full text-xs border"
                                    style={{
                                      backgroundColor: `${tag.color}15`,
                                      borderColor: `${tag.color}30`,
                                      color: tag.color,
                                    }}
                                  >
                                    {tag.name}
                                  </span>
                                ) : null
                              )}
                            </div>
                          )}

                          <div
                            className={cn(
                              'flex items-center gap-1.5 text-xs text-garden-muted pt-2 border-t border-white/5'
                            )}
                          >
                            <span>{formatTime(node[timeMode])}</span>
                            <span className="opacity-30">•</span>
                            <span>{formatFullDate(node[timeMode])}</span>
                            {isEdited(node) && timeMode === 'createdAt' && (
                              <>
                                <span className="opacity-30">•</span>
                                <span className="flex items-center gap-0.5 text-amber-400">
                                  <Edit3 className="w-3 h-3" />
                                  已编辑
                                </span>
                              </>
                            )}
                            {timeMode === 'updatedAt' && isEdited(node) && (
                              <>
                                <span className="opacity-30">•</span>
                                <span className="text-garden-primary">最近修改</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {sortedNodes.length === 0 && (
          <div className="flex flex-col items-center justify-center h-[60vh] text-garden-muted">
            <div className="text-6xl mb-4 opacity-30">🌱</div>
            <p className="text-lg">暂无匹配的节点</p>
            <p className="text-sm mt-2">尝试调整筛选条件</p>
          </div>
        )}
      </div>
    </div>
  );
}
