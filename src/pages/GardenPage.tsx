import React, { useState } from 'react';
import TopBar from '@/components/panels/TopBar';
import Toolbar from '@/components/panels/Toolbar';
import FilterPanel from '@/components/panels/FilterPanel';
import Canvas from '@/components/canvas/Canvas';
import { useGardenStore } from '@/store/useGardenStore';
import type { NodeType } from '@/types';

export default function GardenPage() {
  const [pendingNodeType, setPendingNodeType] = useState<NodeType | null>(null);
  const editorNodeId = useGardenStore((s) => s.editorNodeId);

  return (
    <div className="h-full flex flex-col bg-garden-bg overflow-hidden">
      <TopBar />
      <div className="flex-1 relative overflow-hidden flex">
        <Toolbar
          pendingNodeType={pendingNodeType}
          setPendingNodeType={setPendingNodeType}
        />
        <Canvas
          pendingNodeType={pendingNodeType}
          setPendingNodeType={setPendingNodeType}
        />
        <FilterPanel />
        {editorNodeId && (
          <div className="fixed inset-0 z-50 pointer-events-none" />
        )}
      </div>
    </div>
  );
}
