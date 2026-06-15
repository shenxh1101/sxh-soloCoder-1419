import { useMemo, useRef, useEffect } from 'react';
import { useGardenStore } from '@/store/useGardenStore';
import type { ConnectState, KnowledgeNode } from '@/types';
import Connection from './Connection';

interface ConnectionLayerProps {
  connectState?: ConnectState;
  onConnectionClick?: (id: string) => void;
  selectedConnectionId?: string | null;
  useInnerTransform?: boolean;
}

export default function ConnectionLayer({
  connectState,
  onConnectionClick,
  selectedConnectionId = null,
  useInnerTransform = false,
}: ConnectionLayerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const nodes = useGardenStore((s) => s.nodes);
  const connections = useGardenStore((s) => s.connections);
  const canvas = useGardenStore((s) => s.canvas);
  const selectedNodeId = useGardenStore((s) => s.selectedNodeId);
  const focusMode = useGardenStore((s) => s.focusMode);
  const getConnectedNodes = useGardenStore((s) => s.getConnectedNodes);

  const nodeMap = useMemo(() => {
    const map = new Map<string, KnowledgeNode>();
    nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [nodes]);

  const highlightedNodeIds = useMemo(() => {
    if (focusMode && selectedNodeId) {
      return getConnectedNodes(selectedNodeId, 2);
    }
    return null;
  }, [focusMode, selectedNodeId, getConnectedNodes]);

  const visibleConnections = useMemo(() => {
    if (!highlightedNodeIds) return connections;
    return connections.filter(
      (c) => highlightedNodeIds.has(c.fromId) && highlightedNodeIds.has(c.toId)
    );
  }, [connections, highlightedNodeIds]);

  useEffect(() => {
    const updateSize = () => {
      if (svgRef.current) {
        const parent = svgRef.current.parentElement;
        if (parent) {
          svgRef.current.setAttribute('width', parent.clientWidth.toString());
          svgRef.current.setAttribute('height', parent.clientHeight.toString());
          svgRef.current.style.width = parent.clientWidth + 'px';
          svgRef.current.style.height = parent.clientHeight + 'px';
        }
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const renderConnection = (fromNode: KnowledgeNode, toNode: KnowledgeNode) => {
    const fromX = fromNode.x;
    const fromY = fromNode.y;
    const toX = toNode.x;
    const toY = toNode.y;
    return { fromX, fromY, toX, toY };
  };

  const SVG_WIDTH = 10000;
  const SVG_HEIGHT = 10000;

  return (
    <svg
      ref={svgRef}
      className="absolute left-0 top-0 overflow-visible"
      style={{
        pointerEvents: 'none',
        width: SVG_WIDTH,
        height: SVG_HEIGHT,
      }}
      width={SVG_WIDTH}
      height={SVG_HEIGHT}
    >
      <g>
        {visibleConnections.map((conn) => {
          const fromNode = nodeMap.get(conn.fromId);
          const toNode = nodeMap.get(conn.toId);
          if (!fromNode || !toNode) return null;

          const { fromX, fromY, toX, toY } = renderConnection(fromNode, toNode);
          const isSelected = selectedConnectionId === conn.id;
          const isDimmed =
            highlightedNodeIds !== null &&
            !(highlightedNodeIds.has(conn.fromId) && highlightedNodeIds.has(conn.toId));

          return (
            <Connection
              key={conn.id}
              fromX={fromX + 140}
              fromY={fromY + 100}
              toX={toX + 140}
              toY={toY + 100}
              type={conn.type}
              label={conn.label}
              selected={isSelected}
              dimmed={isDimmed}
              onClick={onConnectionClick ? () => onConnectionClick(conn.id) : undefined}
            />
          );
        })}

        {connectState?.isConnecting && connectState.fromNodeId && (
          (() => {
            const fromNode = nodeMap.get(connectState.fromNodeId);
            if (!fromNode) return null;

            let mouseXInWorld: number;
            let mouseYInWorld: number;

            if (useInnerTransform) {
              mouseXInWorld = connectState.mouseX;
              mouseYInWorld = connectState.mouseY;
            } else {
              mouseXInWorld = (connectState.mouseX - canvas.offsetX) / canvas.zoom;
              mouseYInWorld = (connectState.mouseY - canvas.offsetY) / canvas.zoom;
            }

            return (
              <Connection
                fromX={fromNode.x + 140}
                fromY={fromNode.y + 100}
                toX={mouseXInWorld}
                toY={mouseYInWorld}
                type="relation"
                temporary
                animated={false}
              />
            );
          })()
        )}
      </g>
    </svg>
  );
}
