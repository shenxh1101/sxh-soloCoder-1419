import { useCallback, useRef } from 'react';
import { useGardenStore } from '@/store/useGardenStore';
import { createNodeAtPosition } from '@/store/useGardenStore';

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 5;

export function useCanvas() {
  const { canvas, setCanvas } = useGardenStore();
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 });

  const screenToCanvas = useCallback(
    (screenX: number, screenY: number) => {
      return {
        x: (screenX - canvas.offsetX) / canvas.zoom,
        y: (screenY - canvas.offsetY) / canvas.zoom,
      };
    },
    [canvas.offsetX, canvas.offsetY, canvas.zoom]
  );

  const canvasToScreen = useCallback(
    (canvasX: number, canvasY: number) => {
      return {
        x: canvasX * canvas.zoom + canvas.offsetX,
        y: canvasY * canvas.zoom + canvas.offsetY,
      };
    },
    [canvas.offsetX, canvas.offsetY, canvas.zoom]
  );

  const startPanning = useCallback(
    (clientX: number, clientY: number) => {
      isPanningRef.current = true;
      panStartRef.current = {
        x: clientX,
        y: clientY,
        offsetX: canvas.offsetX,
        offsetY: canvas.offsetY,
      };
    },
    [canvas.offsetX, canvas.offsetY]
  );

  const updatePanning = useCallback(
    (clientX: number, clientY: number) => {
      if (!isPanningRef.current) return;
      const dx = clientX - panStartRef.current.x;
      const dy = clientY - panStartRef.current.y;
      setCanvas({
        offsetX: panStartRef.current.offsetX + dx,
        offsetY: panStartRef.current.offsetY + dy,
      });
    },
    [setCanvas]
  );

  const stopPanning = useCallback(() => {
    isPanningRef.current = false;
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const isMiddleButton = e.button === 1;
      const isLeftOnEmpty = e.button === 0 && e.target === e.currentTarget;

      if (isMiddleButton || isLeftOnEmpty) {
        e.preventDefault();
        startPanning(e.clientX, e.clientY);
      }
    },
    [startPanning]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      updatePanning(e.clientX, e.clientY);
    },
    [updatePanning]
  );

  const handleMouseUp = useCallback(() => {
    stopPanning();
  }, [stopPanning]);

  const handleMouseLeave = useCallback(() => {
    stopPanning();
  }, [stopPanning]);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, canvas.zoom * delta));

      const rect = e.currentTarget.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const canvasX = (mouseX - canvas.offsetX) / canvas.zoom;
      const canvasY = (mouseY - canvas.offsetY) / canvas.zoom;

      const newOffsetX = mouseX - canvasX * newZoom;
      const newOffsetY = mouseY - canvasY * newZoom;

      setCanvas({ zoom: newZoom, offsetX: newOffsetX, offsetY: newOffsetY });
    },
    [canvas.zoom, canvas.offsetX, canvas.offsetY, setCanvas]
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target !== e.currentTarget) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;
      const { x, y } = screenToCanvas(screenX, screenY);
      createNodeAtPosition(x, y, 'text');
    },
    [screenToCanvas]
  );

  const handlers = {
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: handleMouseUp,
    onMouseLeave: handleMouseLeave,
    onWheel: handleWheel,
    onDoubleClick: handleDoubleClick,
  };

  return {
    handlers,
    screenToCanvas,
    canvasToScreen,
    isPanning: isPanningRef.current,
  };
}
