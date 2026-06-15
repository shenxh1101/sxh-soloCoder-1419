import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGardenStore, exportGardenHTML } from '@/store/useGardenStore';
import {
  Search,
  Layout,
  Clock,
  Focus,
  Network,
  Download,
  RotateCcw,
  Filter,
  FileJson,
  FileCode,
  ChevronDown,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function TopBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [exportOpen, setExportOpen] = useState(false);

  const filter = useGardenStore((s) => s.filter);
  const setFilter = useGardenStore((s) => s.setFilter);
  const focusMode = useGardenStore((s) => s.focusMode);
  const toggleFocusMode = useGardenStore((s) => s.toggleFocusMode);
  const forceLayoutEnabled = useGardenStore((s) => s.forceLayoutEnabled);
  const toggleForceLayout = useGardenStore((s) => s.toggleForceLayout);
  const toggleFilterPanel = useGardenStore((s) => s.toggleFilterPanel);
  const showFilterPanel = useGardenStore((s) => s.showFilterPanel);
  const exportJSON = useGardenStore((s) => s.exportJSON);
  const resetAll = useGardenStore((s) => s.resetAll);

  const isTimelinePage = location.pathname === '/timeline';

  const handleExportJSON = () => {
    exportJSON();
    setExportOpen(false);
  };

  const handleExportHTML = () => {
    exportGardenHTML();
    setExportOpen(false);
  };

  return (
    <header className="h-16 border-b border-white/10 bg-garden-bg/80 backdrop-blur-xl flex items-center px-6 gap-6 z-40 relative">
      <div
        className="flex items-center gap-3 cursor-pointer shrink-0"
        onClick={() => navigate('/')}
      >
        <span className="text-2xl">🌱</span>
        <h1 className="font-display text-xl font-semibold text-garden-text tracking-tight">
          知识花园
        </h1>
      </div>

      <div className="flex-1 max-w-xl mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-garden-muted" />
          <input
            type="text"
            placeholder="搜索笔记、标签、内容..."
            value={filter.searchText}
            onChange={(e) => setFilter({ searchText: e.target.value })}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-garden-panel/50 border border-white/10 text-garden-text placeholder-garden-muted/50 focus:outline-none focus:border-garden-primary/50 focus:ring-1 focus:ring-garden-primary/30 transition-all duration-200"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="flex bg-white/5 rounded-xl p-0.5 border border-white/10">
          <button
            onClick={() => navigate('/')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5',
              !isTimelinePage
                ? 'bg-garden-primary/20 text-garden-primary'
                : 'text-garden-muted hover:text-garden-text'
            )}
          >
            <Layout className="w-4 h-4" />
            画布
          </button>
          <button
            onClick={() => navigate('/timeline')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5',
              isTimelinePage
                ? 'bg-garden-primary/20 text-garden-primary'
                : 'text-garden-muted hover:text-garden-text'
            )}
          >
            <Clock className="w-4 h-4" />
            时间轴
          </button>
        </div>

        <Button
          variant={focusMode ? 'primary' : 'icon'}
          size="md"
          onClick={toggleFocusMode}
          title="专注模式"
        >
          <Focus className="w-4 h-4" />
        </Button>

        <Button
          variant={forceLayoutEnabled ? 'primary' : 'icon'}
          size="md"
          onClick={toggleForceLayout}
          title="力导向布局"
        >
          <Network className="w-4 h-4" />
        </Button>

        {!isTimelinePage && (
          <Button
            variant={showFilterPanel ? 'primary' : 'icon'}
            size="md"
            onClick={toggleFilterPanel}
            title="筛选面板"
          >
            <Filter className="w-4 h-4" />
          </Button>
        )}

        <div className="relative">
          <Button
            variant="icon"
            size="md"
            onClick={() => setExportOpen(!exportOpen)}
            title="导出"
          >
            <Download className="w-4 h-4" />
            <ChevronDown className={cn('w-3 h-3 transition-transform', exportOpen && 'rotate-180')} />
          </Button>
          <AnimatePresence>
            {exportOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-40 glass-panel shadow-panel overflow-hidden z-50"
              >
                <button
                  onClick={handleExportJSON}
                  className="w-full px-4 py-2.5 text-left text-sm text-garden-text hover:bg-white/10 flex items-center gap-2 transition-colors"
                >
                  <FileJson className="w-4 h-4 text-garden-amber" />
                  导出 JSON
                </button>
                <button
                  onClick={handleExportHTML}
                  className="w-full px-4 py-2.5 text-left text-sm text-garden-text hover:bg-white/10 flex items-center gap-2 transition-colors"
                >
                  <FileCode className="w-4 h-4 text-garden-blue" />
                  导出 HTML
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Button variant="icon" size="md" onClick={resetAll} title="重置">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
