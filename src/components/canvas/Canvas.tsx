import React, { useState, useRef, useCallback, useMemo } from 'react';
import { useCanvas } from '@/hooks/useCanvas';
import { useGardenStore, createNodeAtPosition } from '@/store/useGardenStore';
import type { NodeType, KnowledgeNode, ConnectState } from '@/types';
import CanvasBackground from './CanvasBackground';
import ConnectionLayer from '../connections/ConnectionLayer';
import NodeRenderer from '../nodes/NodeRenderer';
import MiniMap from './MiniMap';
import ViewportControls from './ViewportControls';
import { cn } from '@/lib/utils';

interface CanvasProps {
  pendingNodeType: NodeType | null;
  setPendingNodeType: (type: NodeType | null) => void;
}

export default function Canvas({ pendingNodeType, setPendingNodeType }: CanvasProps) {
  const { handlers, screenToCanvas } = useCanvas();
  const canvasRef = useRef<HTMLDivElement>(null);

  const nodes = useGardenStore((s) => s.nodes);
  const canvas = useGardenStore((s) => s.canvas);
  const selectedNodeId = useGardenStore((s) => s.selectedNodeId);
  const selectNode = useGardenStore((s) => s.selectNode);
  const openEditor = useGardenStore((s) => s.openEditor);
  const focusMode = useGardenStore((s) => s.focusMode);
  const getConnectedNodes = useGardenStore((s) => s.getConnectedNodes);
  const getFilteredNodes = useGardenStore((s) => s.getFilteredNodes);
  const updateNode = useGardenStore((s) => s.updateNode);
  const addConnection = useGardenStore((s) => s.addConnection);

  const [connectState, setConnectState] = useState<ConnectState>({
    isConnecting: false,
    fromNodeId: null,
    mouseX: 0,
    mouseY: 0,
  });

  const [nodeDragState, setNodeDragState] = useState<{
    isDragging: boolean;
    nodeId: string | null;
    startX: number;
    startY: number;
    nodeStartX: number;
    nodeStartY: number;
  }>({
    isDragging: false,
    nodeId: null,
    startX: 0,
    startY: 0,
    nodeStartX: 0,
    nodeStartY: 0,
  });

  const filteredNodeIds = useMemo(() => {
    return new Set(getFilteredNodes().map((n) => n.id));
  }, [getFilteredNodes]);

  const connectedNodeIds = useMemo(() => {
    if (focusMode && selectedNodeId) {
      return getConnectedNodes(selectedNodeId, 3);
    }
    return null;
  }, [focusMode, selectedNodeId, getConnectedNodes]);

  const handleNodeClick = useCallback(
    (node: KnowledgeNode) => {
      selectNode(node.id);
    },
    [selectNode]
  );

  const handleNodeDoubleClick = useCallback(
    (node: KnowledgeNode) => {
      openEditor(node.id);
    },
    [openEditor]
  );

  const handleStartConnect = useCallback(
    (node: KnowledgeNode, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;
      const { x, y } = screenToCanvas(screenX, screenY);
      setConnectState({
        isConnecting: true,
        fromNodeId: node.id,
        mouseX: x,
        mouseY: y,
      });
    },
    [screenToCanvas]
  );

  const handleNodeMouseDown = useCallback(
    (node: KnowledgeNode, e: React.MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;
      setNodeDragState({
        isDragging: true,
        nodeId: node.id,
        startX: screenX,
        startY: screenY,
        nodeStartX: node.x,
        nodeStartY: node.y,
      });
      selectNode(node.id);
    },
    [selectNode]
  );

  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;
      const { x: worldX, y: worldY } = screenToCanvas(screenX, screenY);

      if (connectState.isConnecting) {
        setConnectState((prev) => ({
          ...prev,
          mouseX: worldX,
          mouseY: worldY,
        }));
      }

      if (nodeDragState.isDragging && nodeDragState.nodeId) {
        const dx = (screenX - nodeDragState.startX) / canvas.zoom;
        const dy = (screenY - nodeDragState.startY) / canvas.zoom;
        updateNode(nodeDragState.nodeId, {
          x: nodeDragState.nodeStartX + dx,
          y: nodeDragState.nodeStartY + dy,
        });
      }

      handlers.onMouseMove(e);
    },
    [connectState, nodeDragState, canvas.zoom, updateNode, handlers]
  );

  const handleCanvasMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (connectState.isConnecting && connectState.fromNodeId) {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          const screenX = e.clientX - rect.left;
          const screenY = e.clientY - rect.top;
          const { x, y } = screenToCanvas(screenX, screenY);

          const targetNode = nodes.find((n) => {
            const nodeWidth = 280;
            const nodeHeight = 200;
            return (
              n.id !== connectState.fromNodeId &&
              x >= n.x &&
              x <= n.x + nodeWidth &&
              y >= n.y &&
              y <= n.y + nodeHeight
            );
          });

          if (targetNode) {
            addConnection({
              fromId: connectState.fromNodeId,
              toId: targetNode.id,
              type: 'relation',
            });
          }
        }
        setConnectState({
          isConnecting: false,
          fromNodeId: null,
          mouseX: 0,
          mouseY: 0,
        });
      }

      setNodeDragState({
        isDragging: false,
        nodeId: null,
        startX: 0,
        startY: 0,
        nodeStartX: 0,
        nodeStartY: 0,
      });

      handlers.onMouseUp();
    },
    [connectState, nodes, addConnection, screenToCanvas, handlers]
  );

  const handleCanvasDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target !== e.currentTarget) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;
      const { x, y } = screenToCanvas(screenX, screenY);

      const type = pendingNodeType || 'text';
      createNodeAtPosition(x, y, type);
      setPendingNodeType(null);
    },
    [screenToCanvas, pendingNodeType, setPendingNodeType]
  );

  const isNodeDimmed = useCallback(
    (node: KnowledgeNode): boolean => {
      if (!filteredNodeIds.has(node.id)) return true;
      if (connectedNodeIds && !connectedNodeIds.has(node.id)) return true;
      return false;
    },
    [filteredNodeIds, connectedNodeIds]
  );

  return (
    <div className="absolute inset-0 overflow-hidden">
      <CanvasBackground />

      <div
        ref={canvasRef}
        className={cn(
          'absolute inset-0 cursor-grab active:cursor-grabbing',
          connectState.isConnecting && 'cursor-crosshair',
          pendingNodeType && 'cursor-copy'
        )}
        onMouseDown={handlers.onMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handlers.onMouseLeave}
        onWheel={handlers.onWheel}
        onDoubleClick={handleCanvasDoubleClick}
      >
        <div
          style={{
            transform: `translate(${canvas.offsetX}px, ${canvas.offsetY}px) scale(${canvas.zoom})`,
            transformOrigin: '0 0',
            position: 'absolute',
            left: 0,
            top: 0,
            width: '10000px',
            height: '10000px',
          }}
        >
          <ConnectionLayer connectState={connectState} useInnerTransform />

          {nodes.map((node) => (
            <NodeRenderer
              key={node.id}
              node={node}
              isSelected={selectedNodeId === node.id}
              isDimmed={isNodeDimmed(node)}
              onClick={handleNodeClick}
              onDoubleClick={handleNodeDoubleClick}
              onStartConnect={handleStartConnect}
              onMouseDown={handleNodeMouseDown}
            />
          ))}
        </div>
      </div>

      <MiniMap />
      <ViewportControls />
    </div>
  );
}
