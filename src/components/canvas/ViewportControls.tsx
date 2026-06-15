import { Plus, Minus, RotateCcw, Maximize2 } from 'lucide-react';
import { useGardenStore } from '@/store/useGardenStore';
import { DEFAULT_CANVAS } from '@/types';

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 5;
const ZOOM_STEP = 0.2;

export default function ViewportControls() {
  const { canvas, nodes, setCanvas } = useGardenStore();

  const zoomIn = () => {
    const newZoom = Math.min(canvas.zoom + ZOOM_STEP, MAX_ZOOM);
    setCanvas({ zoom: newZoom });
  };

  const zoomOut = () => {
    const newZoom = Math.max(canvas.zoom - ZOOM_STEP, MIN_ZOOM);
    setCanvas({ zoom: newZoom });
  };

  const resetView = () => {
    setCanvas({ ...DEFAULT_CANVAS });
  };

  const fitToView = () => {
    if (nodes.length === 0) {
      resetView();
      return;
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    nodes.forEach((node) => {
      if (node.x < minX) minX = node.x;
      if (node.y < minY) minY = node.y;
      if (node.x > maxX) maxX = node.x;
      if (node.y > maxY) maxY = node.y;
    });

    const padding = 100;
    const width = maxX - minX + padding * 2;
    const height = maxY - minY + padding * 2;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const zoom = Math.min(viewportWidth / width, viewportHeight / height, 1);
    const offsetX = viewportWidth / 2 - ((minX + maxX) / 2) * zoom;
    const offsetY = viewportHeight / 2 - ((minY + maxY) / 2) * zoom;

    setCanvas({ zoom, offsetX, offsetY });
  };

  return (
    <div className="fixed bottom-6 left-6 z-30 flex items-center gap-2 rounded-xl bg-slate-800/80 backdrop-blur-md p-2 border border-slate-700/50 shadow-xl">
      <button
        onClick={zoomOut}
        className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-700/50 hover:bg-slate-600/70 text-slate-300 hover:text-white transition-colors"
        title="缩小"
      >
        <Minus size={18} />
      </button>
      <div className="px-2 min-w-[56px] text-center text-sm font-medium text-slate-300 tabular-nums">
        {Math.round(canvas.zoom * 100)}%
      </div>
      <button
        onClick={zoomIn}
        className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-700/50 hover:bg-slate-600/70 text-slate-300 hover:text-white transition-colors"
        title="放大"
      >
        <Plus size={18} />
      </button>
      <div className="w-px h-6 bg-slate-600/50 mx-1" />
      <button
        onClick={resetView}
        className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-700/50 hover:bg-slate-600/70 text-slate-300 hover:text-white transition-colors"
        title="重置视图"
      >
        <RotateCcw size={18} />
      </button>
      <button
        onClick={fitToView}
        className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-700/50 hover:bg-slate-600/70 text-slate-300 hover:text-white transition-colors"
        title="适合视图"
      >
        <Maximize2 size={18} />
      </button>
    </div>
  );
}
