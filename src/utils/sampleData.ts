import type { KnowledgeNode, KnowledgeConnection, Tag, NodeType } from '../types';
import { generateRandomId } from './colors';

const now = Date.now();

const sampleTags: Tag[] = [
  { id: generateRandomId(), name: '编程', color: '#3b82f6' },
  { id: generateRandomId(), name: '设计', color: '#ec4899' },
  { id: generateRandomId(), name: '学习', color: '#10b981' },
  { id: generateRandomId(), name: '灵感', color: '#f59e0b' },
  { id: generateRandomId(), name: '待办', color: '#ef4444' },
  { id: generateRandomId(), name: '项目', color: '#8b5cf6' },
];

function makeNode(
  type: NodeType,
  title: string,
  x: number,
  y: number,
  color: string,
  tags: string[],
  content: any,
  offsetMs: number = 0
): KnowledgeNode {
  return {
    id: generateRandomId(),
    type,
    title,
    content,
    x,
    y,
    vx: 0,
    vy: 0,
    locked: false,
    color,
    tags,
    createdAt: now - offsetMs * 60 * 60 * 1000,
    updatedAt: now - (offsetMs - 0.5) * 60 * 60 * 1000,
  };
}

function getTagIds(indices: number[]): string[] {
  return indices.map((i) => sampleTags[i].id);
}

export function generateSampleData(): {
  nodes: KnowledgeNode[];
  connections: KnowledgeConnection[];
  tags: Tag[];
} {
  const nodes: KnowledgeNode[] = [];
  const connections: KnowledgeConnection[] = [];

  nodes.push(
    makeNode(
      'text',
      '欢迎来到知识花园',
      0,
      0,
      '#10b981',
      getTagIds([2, 3]),
      { text: '在这里种植你的知识之树 🌱\n\n双击空白处创建新节点\n拖拽节点调整位置\n连接节点建立关联' },
      72
    )
  );

  nodes.push(
    makeNode(
      'code',
      '力导向布局算法',
      320,
      -180,
      '#3b82f6',
      getTagIds([0, 5]),
      {
        code: `// 力导向布局核心逻辑
function applyForces(nodes, connections) {
  // 1. 斥力 - 库仑定律
  nodes.forEach(a => {
    nodes.forEach(b => {
      if (a === b) return;
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const force = REPULSION / (dist * dist);
      a.vx += (dx / dist) * force;
      a.vy += (dy / dist) * force;
    });
  });
  
  // 2. 引力 - 胡克定律
  connections.forEach(c => {
    const a = nodes.find(n => n.id === c.fromId);
    const b = nodes.find(n => n.id === c.toId);
    if (!a || !b) return;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const force = (dist - IDEAL_DIST) * SPRING;
    a.vx += (dx / dist) * force;
    a.vy += (dy / dist) * force;
    b.vx -= (dx / dist) * force;
    b.vy -= (dy / dist) * force;
  });
  
  // 3. 中心引力
  nodes.forEach(n => {
    n.vx -= n.x * CENTER_GRAVITY;
    n.vy -= n.y * CENTER_GRAVITY;
  });
}`,
        language: 'javascript',
      },
      48
    )
  );

  nodes.push(
    makeNode(
      'text',
      'React 学习笔记',
      -320,
      -150,
      '#8b5cf6',
      getTagIds([0, 2]),
      {
        text: '## React 核心概念\n\n1. **组件化** - 可复用的 UI 单元\n2. **状态管理** - useState, useReducer, Zustand\n3. **Props 传递** - 单向数据流\n4. **Hooks** - 函数组件的副作用处理\n\n## 性能优化\n- 使用 memo 避免不必要重渲染\n- useMemo / useCallback 缓存值和函数\n- 懒加载组件和代码分割',
      },
      120
    )
  );

  nodes.push(
    makeNode(
      'image',
      'UI 设计灵感',
      420,
      180,
      '#ec4899',
      getTagIds([1, 3]),
      {
        images: [
          {
            id: generateRandomId(),
            name: 'garden-1',
            url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600&q=80',
          },
          {
            id: generateRandomId(),
            name: 'garden-2',
            url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&q=80',
          },
          {
            id: generateRandomId(),
            name: 'garden-3',
            url: 'https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=600&q=80',
          },
        ],
      },
      24
    )
  );

  nodes.push(
    makeNode(
      'bookmark',
      'Tailwind CSS 文档',
      -400,
      200,
      '#14b8a6',
      getTagIds([0, 1]),
      {
        url: 'https://tailwindcss.com',
        title: 'Tailwind CSS - Rapidly build modern websites',
        description: 'A utility-first CSS framework packed with classes that can be composed to build any design, directly in your markup.',
        favicon: 'https://tailwindcss.com/favicons/favicon.ico',
      },
      36
    )
  );

  nodes.push(
    makeNode(
      'mindmap',
      '项目计划',
      0,
      350,
      '#f59e0b',
      getTagIds([5, 4]),
      {
        rootText: '知识花园 v1.0',
        branches: [
          {
            id: generateRandomId(),
            text: '核心功能',
            children: [
              { id: generateRandomId(), text: '节点系统' },
              { id: generateRandomId(), text: '力导向布局' },
              { id: generateRandomId(), text: '画布交互' },
            ],
          },
          {
            id: generateRandomId(),
            text: '数据管理',
            children: [
              { id: generateRandomId(), text: 'LocalStorage' },
              { id: generateRandomId(), text: 'JSON 导出' },
              { id: generateRandomId(), text: 'HTML 分享' },
            ],
          },
          {
            id: generateRandomId(),
            text: '用户体验',
            children: [
              { id: generateRandomId(), text: '专注模式' },
              { id: generateRandomId(), text: '时间轴视图' },
              { id: generateRandomId(), text: '标签筛选' },
            ],
          },
        ],
      },
      12
    )
  );

  nodes.push(
    makeNode(
      'text',
      '今日待办事项',
      700,
      -50,
      '#ef4444',
      getTagIds([4]),
      {
        text: '✅ 完成核心数据模型\n✅ 实现画布缩放\n⬜ 添加新节点类型\n⬜ 优化布局算法\n⬜ 编写导出功能',
      },
      2
    )
  );

  nodes.push(
    makeNode(
      'audio',
      '语音备忘录',
      -700,
      100,
      '#f97316',
      getTagIds([3]),
      {
        audioUrl: '',
        duration: 0,
        waveform: Array.from({ length: 50 }, () => Math.random()),
        name: '暂无录音，点击录制语音备忘',
      },
      6
    )
  );

  nodes.push(
    makeNode(
      'text',
      '设计理念',
      0,
      -380,
      '#10b981',
      getTagIds([1, 3]),
      {
        text: '**深夜花园**主题\n\n🌙 深色背景 - 保护视力，沉浸专注\n✨ 微光粒子 - 营造花园氛围\n💎 玻璃拟态 - 现代精致感\n🎨 柔和渐变 - 温暖不刺眼\n\n知识应该像花园一样，自由生长，有机连接。',
      },
      60
    )
  );

  for (let i = 0; i < nodes.length - 1; i++) {
    const j = (i + 1) % nodes.length;
    connections.push({
      id: generateRandomId(),
      fromId: nodes[i].id,
      toId: nodes[j].id,
      type: 'relation',
    });
  }

  connections.push({
    id: generateRandomId(),
    fromId: nodes[1].id,
    toId: nodes[2].id,
    type: 'reference',
    label: '参考',
  });

  connections.push({
    id: generateRandomId(),
    fromId: nodes[0].id,
    toId: nodes[1].id,
    type: 'branch',
    label: '核心算法',
  });

  connections.push({
    id: generateRandomId(),
    fromId: nodes[5].id,
    toId: nodes[6].id,
    type: 'causal',
    label: '包含',
  });

  connections.push({
    id: generateRandomId(),
    fromId: nodes[0].id,
    toId: nodes[8].id,
    type: 'branch',
    label: '设计',
  });

  connections.push({
    id: generateRandomId(),
    fromId: nodes[3].id,
    toId: nodes[4].id,
    type: 'reference',
  });

  return { nodes, connections, tags: sampleTags };
}
