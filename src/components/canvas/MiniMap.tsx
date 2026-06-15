import { useRef, useState, useCallback, useEffect } from 'react';
import { useGardenStore } from '@/store/useGardenStore';
import type { KnowledgeNode } from '@/types';

const MINIMAP_WIDTH = 200;
const MINIMAP_HEIGHT = 150;
const NODE_RADIUS = 3;
const PADDING = 10;

export default function MiniMap() {
  const { nodes, canvas, setCanvas, getFilteredNodes } = useGardenStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const filteredNodes = getFilteredNodes();

  const bounds = calculateBounds(nodes);

  const scaleX = bounds.maxX === bounds.minX ? 1 : (MINIMAP_WIDTH - PADDING * 2) / (bounds.maxX - bounds.minX);
  const scaleY = bounds.maxY === bounds.minY ? 1 : (MINIMAP_HEIGHT - PADDING * 2) / (bounds.maxY - bounds.minY);
  const scale = Math.min(scaleX, scaleY, 1);

  const toMiniX = useCallback(
    (x: number) => PADDING + (x - bounds.minX) * scale,
    [bounds.minX, scale]
  );
  const toMiniY = useCallback(
    (y: number) => PADDING + (y - bounds.minY) * scale,
    [bounds.minY, scale]
  );

  const fromMiniX = useCallback(
    (mx: number) => (mx - PADDING) / scale + bounds.minX,
    [bounds.minX, scale]
  );
  const fromMiniY = useCallback(
    (my: number) => (my - PADDING) / scale + bounds.minY,
    [bounds.minY, scale]
  );

  const viewportX = toMiniX((0 - canvas.offsetX) / canvas.zoom);
  const viewportY = toMiniY((0 - canvas.offsetY) / canvas.zoom);
  const viewportW = (window.innerWidth / canvas.zoom) * scale;
  const viewportH = (window.innerHeight / canvas.zoom) * scale;

  const handleViewportMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      setIsDragging(true);
    },
    []
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const centerX = fromMiniX(mx);
      const centerY = fromMiniY(my);
      const newOffsetX = window.innerWidth / 2 - centerX * canvas.zoom;
      const newOffsetY = window.innerHeight / 2 - centerY * canvas.zoom;
      setCanvas({ offsetX: newOffsetX, offsetY: newOffsetY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, canvas.zoom, setCanvas, fromMiniX, fromMiniY]);

  const handleMiniMapClick = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const centerX = fromMiniX(mx);
      const centerY = fromMiniY(my);
      const newOffsetX = window.innerWidth / 2 - centerX * canvas.zoom;
      const newOffsetY = window.innerHeight / 2 - centerY * canvas.zoom;
      setCanvas({ offsetX: newOffsetX, offsetY: newOffsetY });
    },
    [canvas.zoom, setCanvas, fromMiniX, fromMiniY]
  );

  return (
    <div
      ref={containerRef}
      onClick={handleMiniMapClick}
      className="fixed bottom-6 right-6 z-30 rounded-xl bg-slate-800/80 backdrop-blur-md border border-slate-700/50 shadow-xl overflow-hidden cursor-crosshair select-none"
      style={{ width: MINIMAP_WIDTH, height: MINIMAP_HEIGHT }}
    >
      <svg
        width={MINIMAP_WIDTH}
        height={MINIMAP_HEIGHT}
        className="absolute inset-0"
      >
        {filteredNodes.map((node: KnowledgeNode) => (
          <circle
            key={node.id}
            cx={toMiniX(node.x)}
            cy={toMiniY(node.y)}
            r={NODE_RADIUS}
            fill={node.color}
            opacity={0.8}
          />
        ))}
        <rect
          x={viewportX - viewportW / 2}
          y={viewportY - viewportH / 2}
          width={viewportW}
          height={viewportH}
          fill="rgba(59, 130, 246, 0.15)"
          stroke="#3b82f6"
          strokeWidth={1.5}
          className={isDragging ? 'cursor-grabbing' : 'cursor-grab'}
          onMouseDown={handleViewportMouseDown}
        />
      </svg>
    </div>
  );
}

function calculateBounds(nodes: KnowledgeNode[]) {
  if (nodes.length === 0) {
    return { minX: -100, minY: -100, maxX: 100, maxY: 100 };
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
  const margin = 50;
  return {
    minX: minX - margin,
    minY: minY - margin,
    maxX: maxX + margin,
    maxY: maxY + margin,
  };
}
