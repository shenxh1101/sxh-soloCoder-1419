export type NodeType = 'text' | 'code' | 'image' | 'bookmark' | 'audio' | 'mindmap';

export type ConnectionType = 'relation' | 'causal' | 'reference' | 'branch';

export interface TextContent {
  text: string;
}

export interface CodeContent {
  code: string;
  language: string;
}

export interface ImageItem {
  id: string;
  url: string;
  thumbnail?: string;
  name: string;
}

export interface ImageContent {
  images: ImageItem[];
}

export interface BookmarkContent {
  url: string;
  title?: string;
  description?: string;
  favicon?: string;
}

export interface AudioContent {
  audioUrl: string;
  duration?: number;
  waveform?: number[];
  name?: string;
}

export interface MindmapBranch {
  id: string;
  text: string;
  color?: string;
  children?: MindmapBranch[];
}

export interface MindmapContent {
  rootText: string;
  branches: MindmapBranch[];
}

export type NodeContent =
  | TextContent
  | CodeContent
  | ImageContent
  | BookmarkContent
  | AudioContent
  | MindmapContent;

export interface KnowledgeNode {
  id: string;
  type: NodeType;
  title: string;
  content: NodeContent;
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  locked: boolean;
  color: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface KnowledgeConnection {
  id: string;
  fromId: string;
  toId: string;
  type: ConnectionType;
  label?: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface CanvasState {
  zoom: number;
  offsetX: number;
  offsetY: number;
}

export interface FilterState {
  selectedTags: string[];
  nodeTypes: NodeType[];
  searchText: string;
  dateRange: [number, number] | null;
}

export interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  offsetStartX: number;
  offsetStartY: number;
}

export interface NodeDragState {
  nodeId: string | null;
  startX: number;
  startY: number;
  nodeStartX: number;
  nodeStartY: number;
}

export interface ConnectState {
  isConnecting: boolean;
  fromNodeId: string | null;
  mouseX: number;
  mouseY: number;
}

export interface GardenState {
  nodes: KnowledgeNode[];
  connections: KnowledgeConnection[];
  tags: Tag[];
  canvas: CanvasState;
  filter: FilterState;
  selectedNodeId: string | null;
  focusMode: boolean;
  forceLayoutEnabled: boolean;
  editorNodeId: string | null;
  showFilterPanel: boolean;
}

export interface GardenActions {
  addNode: (node: Omit<KnowledgeNode, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateNode: (id: string, updates: Partial<KnowledgeNode>) => void;
  deleteNode: (id: string) => void;
  addConnection: (connection: Omit<KnowledgeConnection, 'id'>) => string;
  updateConnection: (id: string, updates: Partial<KnowledgeConnection>) => void;
  deleteConnection: (id: string) => void;
  addTag: (tag: Omit<Tag, 'id'>) => string;
  updateTag: (id: string, updates: Partial<Tag>) => void;
  deleteTag: (id: string) => void;
  setCanvas: (canvas: Partial<CanvasState>) => void;
  setFilter: (filter: Partial<FilterState>) => void;
  selectNode: (id: string | null) => void;
  toggleFocusMode: () => void;
  toggleForceLayout: () => void;
  openEditor: (id: string | null) => void;
  toggleFilterPanel: () => void;
  exportJSON: () => string;
  importJSON: (data: string) => void;
  resetAll: () => void;
  getFilteredNodes: () => KnowledgeNode[];
  getConnectedNodes: (nodeId: string, depth?: number) => Set<string>;
}

export const NODE_COLORS = [
  '#10b981',
  '#f59e0b',
  '#ec4899',
  '#8b5cf6',
  '#3b82f6',
  '#ef4444',
  '#14b8a6',
  '#f97316',
];

export const CONNECTION_TYPE_COLORS: Record<ConnectionType, string> = {
  relation: '#64748b',
  causal: '#ef4444',
  reference: '#3b82f6',
  branch: '#10b981',
};

export const CONNECTION_TYPE_LABELS: Record<ConnectionType, string> = {
  relation: '关联',
  causal: '因果',
  reference: '引用',
  branch: '分支',
};

export const NODE_TYPE_LABELS: Record<NodeType, string> = {
  text: '文本笔记',
  code: '代码片段',
  image: '图片画廊',
  bookmark: '网页书签',
  audio: '音频备忘',
  mindmap: '思维导图',
};

export const DEFAULT_CANVAS: CanvasState = {
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
};

export const DEFAULT_FILTER: FilterState = {
  selectedTags: [],
  nodeTypes: [],
  searchText: '',
  dateRange: null,
};
