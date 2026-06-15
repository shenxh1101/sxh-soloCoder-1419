import { useEffect, useRef } from 'react';
import { useGardenStore } from '@/store/useGardenStore';
import { ForceLayout } from '@/components/layout/ForceLayout';

const THROTTLE_MS = 16;

export function useForceLayout() {
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const isRunningRef = useRef(false);

  const forceLayoutEnabled = useGardenStore((s) => s.forceLayoutEnabled);
  const nodes = useGardenStore((s) => s.nodes);
  const connections = useGardenStore((s) => s.connections);
  const updateNode = useGardenStore((s) => s.updateNode);

  useEffect(() => {
    if (!forceLayoutEnabled) {
      isRunningRef.current = false;
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    isRunningRef.current = true;

    const animate = (timestamp: number) => {
      if (!isRunningRef.current) return;

      const updatedNodes = ForceLayout.step(nodes, connections);

      if (timestamp - lastUpdateRef.current >= THROTTLE_MS) {
        lastUpdateRef.current = timestamp;

        updatedNodes.forEach((node) => {
          updateNode(node.id, {
            x: node.x,
            y: node.y,
            vx: node.vx,
            vy: node.vy,
          });
        });
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      isRunningRef.current = false;
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [forceLayoutEnabled, nodes, connections, updateNode]);
}
