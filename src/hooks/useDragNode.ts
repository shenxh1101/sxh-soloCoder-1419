import { useRef, useCallback } from 'react';
import { useGardenStore } from '@/store/useGardenStore';

interface UseDragNodeOptions {
  nodeId: string;
}

export function useDragNode({ nodeId }: UseDragNodeOptions) {
  const dragState = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    nodeStartX: 0,
    nodeStartY: 0,
    wasLocked: false,
  });

  const canvas = useGardenStore((s) => s.canvas);
  const nodes = useGardenStore((s) => s.nodes);
  const updateNode = useGardenStore((s) => s.updateNode);
  const selectNode = useGardenStore((s) => s.selectNode);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      e.stopPropagation();
      e.preventDefault();

      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      dragState.current = {
        isDragging: true,
        startX: e.clientX,
        startY: e.clientY,
        nodeStartX: node.x,
        nodeStartY: node.y,
        wasLocked: node.locked,
      };

      if (!node.locked) {
        updateNode(nodeId, { locked: true });
      }

      selectNode(nodeId);

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!dragState.current.isDragging) return;

        const dx = (moveEvent.clientX - dragState.current.startX) / canvas.zoom;
        const dy = (moveEvent.clientY - dragState.current.startY) / canvas.zoom;

        const newX = dragState.current.nodeStartX + dx;
        const newY = dragState.current.nodeStartY + dy;

        updateNode(nodeId, {
          x: newX,
          y: newY,
          vx: 0,
          vy: 0,
        });
      };

      const handleMouseUp = () => {
        dragState.current.isDragging = false;

        if (!dragState.current.wasLocked) {
          updateNode(nodeId, { locked: false });
        }

        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [nodeId, nodes, canvas.zoom, updateNode, selectNode]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length !== 1) return;
      e.stopPropagation();

      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      const touch = e.touches[0];
      dragState.current = {
        isDragging: true,
        startX: touch.clientX,
        startY: touch.clientY,
        nodeStartX: node.x,
        nodeStartY: node.y,
        wasLocked: node.locked,
      };

      if (!node.locked) {
        updateNode(nodeId, { locked: true });
      }

      selectNode(nodeId);

      const handleTouchMove = (moveEvent: TouchEvent) => {
        if (!dragState.current.isDragging || moveEvent.touches.length !== 1)
          return;
        moveEvent.preventDefault();

        const touchMove = moveEvent.touches[0];
        const dx = (touchMove.clientX - dragState.current.startX) / canvas.zoom;
        const dy = (touchMove.clientY - dragState.current.startY) / canvas.zoom;

        const newX = dragState.current.nodeStartX + dx;
        const newY = dragState.current.nodeStartY + dy;

        updateNode(nodeId, {
          x: newX,
          y: newY,
          vx: 0,
          vy: 0,
        });
      };

      const handleTouchEnd = () => {
        dragState.current.isDragging = false;

        if (!dragState.current.wasLocked) {
          updateNode(nodeId, { locked: false });
        }

        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };

      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    },
    [nodeId, nodes, canvas.zoom, updateNode, selectNode]
  );

  return {
    handleMouseDown,
    handleTouchStart,
    isDragging: dragState.current.isDragging,
  };
}
