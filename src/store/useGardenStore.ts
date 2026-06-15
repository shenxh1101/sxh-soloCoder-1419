import { create } from 'zustand';
import type {
  GardenState,
  GardenActions,
  KnowledgeNode,
  KnowledgeConnection,
  Tag,
  CanvasState,
  FilterState,
  ConnectionType,
  NodeType,
  NodeContent,
} from '../types';
import {
  DEFAULT_CANVAS,
  DEFAULT_FILTER,
  NODE_COLORS,
} from '../types';
import { generateRandomId } from '../utils/colors';
import { loadFromStorage, saveToStorage, clearStorage } from '../utils/storage';
import { generateSampleData } from '../utils/sampleData';
import { exportToJSON, importFromJSON, downloadJSON, generateStaticHTML, downloadHTML } from '../utils/export';

type Store = GardenState & GardenActions;

function getInitialState(): Omit<GardenState, keyof GardenActions> {
  const saved = loadFromStorage();
  if (saved && saved.nodes && saved.nodes.length > 0) {
    return {
      nodes: saved.nodes,
      connections: saved.connections || [],
      tags: saved.tags || [],
      canvas: saved.canvas || DEFAULT_CANVAS,
      filter: DEFAULT_FILTER,
      selectedNodeId: null,
      focusMode: false,
      forceLayoutEnabled: false,
      editorNodeId: null,
      showFilterPanel: false,
    };
  }

  const sample = generateSampleData();
  return {
    nodes: sample.nodes,
    connections: sample.connections,
    tags: sample.tags,
    canvas: { ...DEFAULT_CANVAS },
    filter: { ...DEFAULT_FILTER },
    selectedNodeId: null,
    focusMode: false,
    forceLayoutEnabled: false,
    editorNodeId: null,
    showFilterPanel: false,
  };
}

export const useGardenStore = create<Store>((set, get) => ({
  ...getInitialState(),

  addNode: (node) => {
    const id = generateRandomId();
    const now = Date.now();
    const newNode: KnowledgeNode = {
      ...node,
      id,
      createdAt: now,
      updatedAt: now,
      vx: 0,
      vy: 0,
    };
    set((s) => ({ nodes: [...s.nodes, newNode] }));
    return id;
  },

  updateNode: (id, updates) => {
    set((s) => ({
      nodes: s.nodes.map((n) =>
        n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n
      ),
    }));
  },

  deleteNode: (id) => {
    set((s) => ({
      nodes: s.nodes.filter((n) => n.id !== id),
      connections: s.connections.filter(
        (c) => c.fromId !== id && c.toId !== id
      ),
      selectedNodeId: s.selectedNodeId === id ? null : s.selectedNodeId,
      editorNodeId: s.editorNodeId === id ? null : s.editorNodeId,
    }));
  },

  addConnection: (connection) => {
    const id = generateRandomId();
    const newConn: KnowledgeConnection = { ...connection, id };
    const exists = get().connections.some(
      (c) =>
        (c.fromId === connection.fromId && c.toId === connection.toId) ||
        (c.fromId === connection.toId && c.toId === connection.fromId)
    );
    if (exists || connection.fromId === connection.toId) return '';
    set((s) => ({ connections: [...s.connections, newConn] }));
    return id;
  },

  updateConnection: (id, updates) => {
    set((s) => ({
      connections: s.connections.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    }));
  },

  deleteConnection: (id) => {
    set((s) => ({
      connections: s.connections.filter((c) => c.id !== id),
    }));
  },

  addTag: (tag) => {
    const id = generateRandomId();
    const newTag: Tag = { ...tag, id };
    set((s) => ({ tags: [...s.tags, newTag] }));
    return id;
  },

  updateTag: (id, updates) => {
    set((s) => ({
      tags: s.tags.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  },

  deleteTag: (id) => {
    set((s) => ({
      tags: s.tags.filter((t) => t.id !== id),
      nodes: s.nodes.map((n) => ({
        ...n,
        tags: n.tags.filter((tid) => tid !== id),
      })),
      filter: {
        ...s.filter,
        selectedTags: s.filter.selectedTags.filter((tid) => tid !== id),
      },
    }));
  },

  setCanvas: (canvas) => {
    set((s) => ({ canvas: { ...s.canvas, ...canvas } }));
  },

  setFilter: (filter) => {
    set((s) => ({ filter: { ...s.filter, ...filter } }));
  },

  selectNode: (id) => {
    set({ selectedNodeId: id });
  },

  toggleFocusMode: () => {
    set((s) => ({ focusMode: !s.focusMode }));
  },

  toggleForceLayout: () => {
    set((s) => ({ forceLayoutEnabled: !s.forceLayoutEnabled }));
  },

  openEditor: (id) => {
    set({ editorNodeId: id });
  },

  toggleFilterPanel: () => {
    set((s) => ({ showFilterPanel: !s.showFilterPanel }));
  },

  exportJSON: () => {
    const { nodes, connections, tags } = get();
    const json = exportToJSON(nodes, connections, tags);
    const filename = `knowledge-garden-${new Date().toISOString().slice(0, 10)}.json`;
    downloadJSON(json, filename);
    return json;
  },

  importJSON: (data) => {
    const parsed = importFromJSON(data);
    if (!parsed) return;
    set({
      nodes: parsed.nodes,
      connections: parsed.connections || [],
      tags: parsed.tags || [],
    });
  },

  resetAll: () => {
    clearStorage();
    const sample = generateSampleData();
    set({
      nodes: sample.nodes,
      connections: sample.connections,
      tags: sample.tags,
      canvas: { ...DEFAULT_CANVAS },
      filter: { ...DEFAULT_FILTER },
      selectedNodeId: null,
      focusMode: false,
      forceLayoutEnabled: false,
      editorNodeId: null,
      showFilterPanel: false,
    });
  },

  getFilteredNodes: () => {
    const { nodes, filter, tags } = get();
    return nodes.filter((node) => {
      if (filter.nodeTypes.length > 0 && !filter.nodeTypes.includes(node.type)) {
        return false;
      }
      if (
        filter.selectedTags.length > 0 &&
        !filter.selectedTags.some((t) => node.tags.includes(t))
      ) {
        return false;
      }
      if (filter.searchText.trim()) {
        const search = filter.searchText.toLowerCase();
        const nodeTags = node.tags
          .map((tid) => tags.find((t) => t.id === tid)?.name || '')
          .join(' ')
          .toLowerCase();
        const contentStr = JSON.stringify(node.content).toLowerCase();
        if (
          !node.title.toLowerCase().includes(search) &&
          !contentStr.includes(search) &&
          !nodeTags.includes(search)
        ) {
          return false;
        }
      }
      if (filter.dateRange) {
        const [start, end] = filter.dateRange;
        if (node.createdAt < start || node.createdAt > end) return false;
      }
      return true;
    });
  },

  getConnectedNodes: (nodeId, depth = 3) => {
    const { connections } = get();
    const connected = new Set<string>([nodeId]);
    let frontier = new Set<string>([nodeId]);
    for (let d = 0; d < depth; d++) {
      const next = new Set<string>();
      frontier.forEach((id) => {
        connections.forEach((c) => {
          if (c.fromId === id && !connected.has(c.toId)) {
            connected.add(c.toId);
            next.add(c.toId);
          }
          if (c.toId === id && !connected.has(c.fromId)) {
            connected.add(c.fromId);
            next.add(c.fromId);
          }
        });
      });
      frontier = next;
      if (frontier.size === 0) break;
    }
    return connected;
  },
}));

export function exportGardenHTML(): void {
  const { nodes, connections, tags } = useGardenStore.getState();
  const html = generateStaticHTML(nodes, connections, tags);
  const filename = `knowledge-garden-${new Date().toISOString().slice(0, 10)}.html`;
  downloadHTML(html, filename);
}

const SAVE_DEBOUNCE_MS = 1000;
let saveTimeout: ReturnType<typeof setTimeout> | null = null;

useGardenStore.subscribe((state) => {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveToStorage({
      nodes: state.nodes,
      connections: state.connections,
      tags: state.tags,
      canvas: state.canvas,
      version: 1,
    });
  }, SAVE_DEBOUNCE_MS);
});

export function createNodeAtPosition(
  x: number,
  y: number,
  type: NodeType = 'text'
): string {
  const colorIndex = Math.floor(Math.random() * NODE_COLORS.length);
  let content: NodeContent;
  const defaultTitle = {
    text: '新笔记',
    code: '新代码片段',
    image: '新图片画廊',
    bookmark: '新书签',
    audio: '新语音备忘',
    mindmap: '新思维导图',
  };

  switch (type) {
    case 'text':
      content = { text: '' };
      break;
    case 'code':
      content = { code: '// 在此输入代码\n', language: 'javascript' };
      break;
    case 'image':
      content = { images: [] };
      break;
    case 'bookmark':
      content = { url: 'https://' };
      break;
    case 'audio':
      content = { audioUrl: '', duration: 0, waveform: [], name: '点击录制' };
      break;
    case 'mindmap':
      content = { rootText: '中心主题', branches: [] };
      break;
  }

  return useGardenStore.getState().addNode({
    type,
    title: defaultTitle[type],
    content,
    x,
    y,
    locked: false,
    color: NODE_COLORS[colorIndex],
    tags: [],
  });
}
