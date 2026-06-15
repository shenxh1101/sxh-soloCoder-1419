import type { KnowledgeNode, KnowledgeConnection } from '@/types';

export class ForceLayout {
  static readonly REPULSION = 5000;
  static readonly SPRING = 0.01;
  static readonly IDEAL_DIST = 200;
  static readonly CENTER_GRAVITY = 0.001;
  static readonly DAMPING = 0.85;
  static readonly MAX_SPEED = 20;
  static readonly MIN_DISTANCE = 1;

  static step(
    nodes: KnowledgeNode[],
    connections: KnowledgeConnection[]
  ): KnowledgeNode[] {
    const nodeMap = new Map<string, KnowledgeNode>();
    nodes.forEach((n) => nodeMap.set(n.id, { ...n, vx: n.vx ?? 0, vy: n.vy ?? 0 }));

    const nodeArr = Array.from(nodeMap.values());

    for (let i = 0; i < nodeArr.length; i++) {
      for (let j = i + 1; j < nodeArr.length; j++) {
        const a = nodeArr[i];
        const b = nodeArr[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const distSq = Math.max(dx * dx + dy * dy, ForceLayout.MIN_DISTANCE);
        const dist = Math.sqrt(distSq);
        const force = ForceLayout.REPULSION / distSq;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        if (!a.locked) {
          a.vx! -= fx;
          a.vy! -= fy;
        }
        if (!b.locked) {
          b.vx! += fx;
          b.vy! += fy;
        }
      }
    }

    connections.forEach((conn) => {
      const from = nodeMap.get(conn.fromId);
      const to = nodeMap.get(conn.toId);
      if (!from || !to) return;

      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const dist = Math.max(
        Math.sqrt(dx * dx + dy * dy),
        ForceLayout.MIN_DISTANCE
      );
      const displacement = dist - ForceLayout.IDEAL_DIST;
      const force = displacement * ForceLayout.SPRING;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;

      if (!from.locked) {
        from.vx! += fx;
        from.vy! += fy;
      }
      if (!to.locked) {
        to.vx! -= fx;
        to.vy! -= fy;
      }
    });

    nodeArr.forEach((node) => {
      if (node.locked) return;

      node.vx! -= node.x * ForceLayout.CENTER_GRAVITY;
      node.vy! -= node.y * ForceLayout.CENTER_GRAVITY;

      node.vx! *= ForceLayout.DAMPING;
      node.vy! *= ForceLayout.DAMPING;

      const speedSq = node.vx! ** 2 + node.vy! ** 2;
      if (speedSq > ForceLayout.MAX_SPEED ** 2) {
        const speed = Math.sqrt(speedSq);
        node.vx! = (node.vx! / speed) * ForceLayout.MAX_SPEED;
        node.vy! = (node.vy! / speed) * ForceLayout.MAX_SPEED;
      }

      node.x += node.vx!;
      node.y += node.vy!;
    });

    return nodeArr;
  }
}
