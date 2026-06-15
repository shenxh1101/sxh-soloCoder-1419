import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Trash2,
  Save,
  FileText,
  Code,
  Image as ImageIcon,
  Bookmark as BookmarkIcon,
  Mic,
  GitBranch,
  Settings,
  Palette,
  Lock,
  Unlock,
  Upload,
  RefreshCw,
  Plus,
  GripVertical,
  Tag as TagIcon,
} from 'lucide-react';
import { useGardenStore } from '@/store/useGardenStore';
import {
  NODE_COLORS,
  NODE_TYPE_LABELS,
  type NodeContent,
  type TextContent,
  type CodeContent,
  type ImageContent,
  type BookmarkContent,
  type AudioContent,
  type MindmapContent,
  type MindmapBranch,
} from '@/types';
import { generateRandomId, getColorWithOpacity } from '@/utils/colors';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import TagInput from './TagInput';

const CODE_LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'java',
  'cpp',
  'csharp',
  'go',
  'rust',
  'html',
  'css',
  'sql',
  'bash',
  'json',
  'markdown',
];

const NODE_TYPE_ICONS: Record<string, typeof FileText> = {
  text: FileText,
  code: Code,
  image: ImageIcon,
  bookmark: BookmarkIcon,
  audio: Mic,
  mindmap: GitBranch,
};

export default function NodeEditor() {
  const editorNodeId = useGardenStore((s) => s.editorNodeId);
  const openEditor = useGardenStore((s) => s.openEditor);
  const updateNode = useGardenStore((s) => s.updateNode);
  const deleteNode = useGardenStore((s) => s.deleteNode);
  const nodes = useGardenStore((s) => s.nodes);

  const node = nodes.find((n) => n.id === editorNodeId) || null;

  const [activeTab, setActiveTab] = useState<'content' | 'metadata'>('content');
  const [title, setTitle] = useState('');
  const [color, setColor] = useState(NODE_COLORS[0]);
  const [tags, setTags] = useState<string[]>([]);
  const [locked, setLocked] = useState(false);
  const [content, setContent] = useState<NodeContent | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    if (node) {
      setTitle(node.title);
      setColor(node.color);
      setTags(node.tags);
      setLocked(node.locked);
      setContent(JSON.parse(JSON.stringify(node.content)));
    }
  }, [node]);

  const handleClose = () => {
    openEditor(null);
    setShowDeleteConfirm(false);
  };

  const handleSave = () => {
    if (!node || !content) return;
    updateNode(node.id, {
      title,
      color,
      tags,
      locked,
      content,
    });
    handleClose();
  };

  const handleDelete = () => {
    if (!node) return;
    deleteNode(node.id);
    setShowDeleteConfirm(false);
    handleClose();
  };

  const renderContentEditor = () => {
    if (!node || !content) return null;
    const TypeIcon = NODE_TYPE_ICONS[node.type] || FileText;

    switch (node.type) {
      case 'text': {
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-garden-muted">
              <TypeIcon className="w-4 h-4" />
              <span>文本内容</span>
            </div>
            <textarea
              value={(content as TextContent).text}
              onChange={(e) =>
                setContent({ text: e.target.value } as TextContent)
              }
              placeholder="输入你的笔记内容..."
              className={cn(
                'w-full h-64 p-4 rounded-xl resize-none text-sm',
                'bg-white/5 border border-white/10',
                'focus:border-garden-primary/50 focus:outline-none',
                'text-garden-text placeholder:text-garden-muted/50',
                'transition-colors duration-200'
              )}
            />
          </div>
        );
      }

      case 'code': {
        const codeContent = content as CodeContent;
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 text-sm text-garden-muted">
              <div className="flex items-center gap-2">
                <TypeIcon className="w-4 h-4" />
                <span>代码片段</span>
              </div>
              <select
                value={codeContent.language}
                onChange={(e) =>
                  setContent({ ...codeContent, language: e.target.value })
                }
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs',
                  'bg-white/5 border border-white/10',
                  'focus:border-garden-primary/50 focus:outline-none',
                  'text-garden-text'
                )}
              >
                {CODE_LANGUAGES.map((lang) => (
                  <option key={lang} value={lang} className="bg-slate-900">
                    {lang}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              value={codeContent.code}
              onChange={(e) =>
                setContent({ ...codeContent, code: e.target.value })
              }
              placeholder="// 在此输入代码..."
              className={cn(
                'w-full h-64 p-4 rounded-xl resize-none text-sm font-mono',
                'bg-slate-950/50 border border-white/10',
                'focus:border-garden-primary/50 focus:outline-none',
                'text-garden-text placeholder:text-garden-muted/50',
                'transition-colors duration-200'
              )}
            />
          </div>
        );
      }

      case 'image': {
        const imageContent = content as ImageContent;
        const handleAddImage = (files: FileList | null) => {
          if (!files) return;
          const newImages = Array.from(files).map((file) => ({
            id: generateRandomId(),
            url: URL.createObjectURL(file),
            name: file.name,
          }));
          setContent({
            images: [...imageContent.images, ...newImages],
          } as ImageContent);
        };
        const handleAddImageUrl = (url: string) => {
          if (!url.trim()) return;
          setContent({
            images: [
              ...imageContent.images,
              { id: generateRandomId(), url: url.trim(), name: url },
            ],
          } as ImageContent);
        };
        const handleRemoveImage = (id: string) => {
          setContent({
            images: imageContent.images.filter((img) => img.id !== id),
          } as ImageContent);
        };
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-garden-muted">
              <TypeIcon className="w-4 h-4" />
              <span>图片画廊</span>
            </div>
            <div className="flex gap-2">
              <label className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleAddImage(e.target.files)}
                />
                <div
                  className={cn(
                    'flex items-center justify-center gap-2 py-3 px-4 rounded-xl cursor-pointer',
                    'bg-white/5 border border-dashed border-white/20',
                    'hover:border-garden-primary/50 hover:bg-garden-primary/5',
                    'text-sm text-garden-muted transition-all duration-200'
                  )}
                >
                  <Upload className="w-4 h-4" />
                  <span>上传图片</span>
                </div>
              </label>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                id="image-url-input"
                placeholder="粘贴图片 URL..."
                className={cn(
                  'flex-1 px-4 py-2.5 rounded-xl text-sm',
                  'bg-white/5 border border-white/10',
                  'focus:border-garden-primary/50 focus:outline-none',
                  'text-garden-text placeholder:text-garden-muted/50',
                  'transition-colors duration-200'
                )}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddImageUrl((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
            </div>
            {imageContent.images.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {imageContent.images.map((img) => (
                  <motion.div
                    key={img.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative group aspect-square rounded-lg overflow-hidden border border-white/10"
                  >
                    <img
                      src={img.url}
                      alt={img.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(img.id)}
                      className={cn(
                        'absolute top-1 right-1 p-1.5 rounded-lg',
                        'bg-red-500/90 text-white opacity-0',
                        'group-hover:opacity-100 transition-opacity'
                      )}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        );
      }

      case 'bookmark': {
        const bookmarkContent = content as BookmarkContent;
        const handleFetchMetadata = async () => {
          if (!bookmarkContent.url.trim()) return;
          try {
            const url = bookmarkContent.url.startsWith('http')
              ? bookmarkContent.url
              : `https://${bookmarkContent.url}`;
            const response = await fetch(
              `https://api.microlink.io/?url=${encodeURIComponent(url)}`
            );
            const data = await response.json();
            if (data.data) {
              setContent({
                url,
                title: data.data.title || bookmarkContent.title,
                description: data.data.description || bookmarkContent.description,
                favicon:
                  data.data.logo?.url ||
                  data.data.favicon ||
                  bookmarkContent.favicon,
              } as BookmarkContent);
            }
          } catch {
            // 静默失败
          }
        };
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-garden-muted">
              <TypeIcon className="w-4 h-4" />
              <span>网页书签</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={bookmarkContent.url}
                onChange={(e) =>
                  setContent({ ...bookmarkContent, url: e.target.value })
                }
                placeholder="https://example.com"
                className={cn(
                  'flex-1 px-4 py-2.5 rounded-xl text-sm',
                  'bg-white/5 border border-white/10',
                  'focus:border-garden-primary/50 focus:outline-none',
                  'text-garden-text placeholder:text-garden-muted/50',
                  'transition-colors duration-200'
                )}
              />
              <Button
                variant="ghost"
                onClick={handleFetchMetadata}
                className="flex-shrink-0"
              >
                <RefreshCw className="w-4 h-4" />
                抓取
              </Button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-garden-muted mb-1.5">
                  标题
                </label>
                <input
                  type="text"
                  value={bookmarkContent.title || ''}
                  onChange={(e) =>
                    setContent({ ...bookmarkContent, title: e.target.value })
                  }
                  className={cn(
                    'w-full px-4 py-2.5 rounded-xl text-sm',
                    'bg-white/5 border border-white/10',
                    'focus:border-garden-primary/50 focus:outline-none',
                    'text-garden-text placeholder:text-garden-muted/50',
                    'transition-colors duration-200'
                  )}
                />
              </div>
              <div>
                <label className="block text-xs text-garden-muted mb-1.5">
                  描述
                </label>
                <textarea
                  value={bookmarkContent.description || ''}
                  onChange={(e) =>
                    setContent({
                      ...bookmarkContent,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className={cn(
                    'w-full px-4 py-2.5 rounded-xl text-sm resize-none',
                    'bg-white/5 border border-white/10',
                    'focus:border-garden-primary/50 focus:outline-none',
                    'text-garden-text placeholder:text-garden-muted/50',
                    'transition-colors duration-200'
                  )}
                />
              </div>
              <div>
                <label className="block text-xs text-garden-muted mb-1.5">
                  Favicon URL
                </label>
                <div className="flex gap-2 items-center">
                  {bookmarkContent.favicon && (
                    <img
                      src={bookmarkContent.favicon}
                      alt=""
                      className="w-6 h-6 rounded"
                    />
                  )}
                  <input
                    type="text"
                    value={bookmarkContent.favicon || ''}
                    onChange={(e) =>
                      setContent({
                        ...bookmarkContent,
                        favicon: e.target.value,
                      })
                    }
                    className={cn(
                      'flex-1 px-4 py-2.5 rounded-xl text-sm',
                      'bg-white/5 border border-white/10',
                      'focus:border-garden-primary/50 focus:outline-none',
                      'text-garden-text placeholder:text-garden-muted/50',
                      'transition-colors duration-200'
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      }

      case 'audio': {
        const audioContent = content as AudioContent;
        const handleFileUpload = (files: FileList | null) => {
          if (!files || files.length === 0) return;
          const file = files[0];
          const url = URL.createObjectURL(file);
          setContent({
            ...audioContent,
            audioUrl: url,
            name: file.name,
          } as AudioContent);
        };
        const toggleRecording = () => {
          if (!isRecording) {
            setIsRecording(true);
          } else {
            setIsRecording(false);
            setContent({
              ...audioContent,
              audioUrl: 'blob:recording-simulated',
              name: '新录音',
              duration: 30,
            } as AudioContent);
          }
        };
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-garden-muted">
              <TypeIcon className="w-4 h-4" />
              <span>语音备忘</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={isRecording ? 'danger' : 'ghost'}
                onClick={toggleRecording}
                className="py-4 h-auto"
              >
                <Mic
                  className={cn('w-5 h-5', isRecording && 'animate-pulse')}
                />
                {isRecording ? '停止录制' : '开始录制'}
              </Button>
              <label>
                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files)}
                />
                <div
                  className={cn(
                    'flex items-center justify-center gap-2 py-4 rounded-xl cursor-pointer h-full',
                    'bg-white/5 border border-white/10 text-garden-muted',
                    'hover:border-garden-primary/50 hover:text-garden-text',
                    'transition-all duration-200 font-medium text-sm'
                  )}
                >
                  <Upload className="w-5 h-5" />
                  上传音频
                </div>
              </label>
            </div>
            {audioContent.audioUrl && (
              <div className="space-y-2">
                <input
                  type="text"
                  value={audioContent.name || ''}
                  onChange={(e) =>
                    setContent({ ...audioContent, name: e.target.value })
                  }
                  className={cn(
                    'w-full px-4 py-2.5 rounded-xl text-sm',
                    'bg-white/5 border border-white/10',
                    'focus:border-garden-primary/50 focus:outline-none',
                    'text-garden-text placeholder:text-garden-muted/50',
                    'transition-colors duration-200'
                  )}
                />
                <audio
                  controls
                  src={audioContent.audioUrl}
                  className="w-full"
                />
              </div>
            )}
          </div>
        );
      }

      case 'mindmap': {
        const mindmapContent = content as MindmapContent;
        const addBranch = (parentId: string | null) => {
          const newBranch: MindmapBranch = {
            id: generateRandomId(),
            text: '新分支',
            children: [],
          };
          if (parentId === null) {
            setContent({
              ...mindmapContent,
              branches: [...mindmapContent.branches, newBranch],
            } as MindmapContent);
          } else {
            const updateTree = (branches: MindmapBranch[]): MindmapBranch[] => {
              return branches.map((b) => {
                if (b.id === parentId) {
                  return {
                    ...b,
                    children: [...(b.children || []), newBranch],
                  };
                }
                if (b.children) {
                  return { ...b, children: updateTree(b.children) };
                }
                return b;
              });
            };
            setContent({
              ...mindmapContent,
              branches: updateTree(mindmapContent.branches),
            } as MindmapContent);
          }
        };
        const updateBranchText = (branchId: string, text: string) => {
          const updateTree = (branches: MindmapBranch[]): MindmapBranch[] => {
            return branches.map((b) => {
              if (b.id === branchId) {
                return { ...b, text };
              }
              if (b.children) {
                return { ...b, children: updateTree(b.children) };
              }
              return b;
            });
          };
          setContent({
            ...mindmapContent,
            branches: updateTree(mindmapContent.branches),
          } as MindmapContent);
        };
        const deleteBranch = (branchId: string) => {
          const deleteFromTree = (
            branches: MindmapBranch[]
          ): MindmapBranch[] => {
            return branches
              .filter((b) => b.id !== branchId)
              .map((b) => ({
                ...b,
                children: b.children ? deleteFromTree(b.children) : undefined,
              }));
          };
          setContent({
            ...mindmapContent,
            branches: deleteFromTree(mindmapContent.branches),
          } as MindmapContent);
        };
        const renderBranch = (
          branch: MindmapBranch,
          level: number = 0
        ): React.ReactNode => {
          return (
            <div key={branch.id} className="space-y-1">
              <div
                className="flex items-center gap-2 group"
                style={{ paddingLeft: level * 16 }}
              >
                <GripVertical className="w-3 h-3 text-garden-muted/30 flex-shrink-0" />
                <input
                  type="text"
                  value={branch.text}
                  onChange={(e) => updateBranchText(branch.id, e.target.value)}
                  className={cn(
                    'flex-1 px-3 py-1.5 rounded-lg text-sm',
                    'bg-white/5 border border-white/10',
                    'focus:border-garden-primary/50 focus:outline-none',
                    'text-garden-text',
                    'transition-colors duration-200'
                  )}
                />
                <button
                  type="button"
                  onClick={() => addBranch(branch.id)}
                  className={cn(
                    'p-1.5 rounded-lg opacity-0 group-hover:opacity-100',
                    'bg-garden-primary/10 text-garden-primary',
                    'transition-opacity'
                  )}
                >
                  <Plus className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteBranch(branch.id)}
                  className={cn(
                    'p-1.5 rounded-lg opacity-0 group-hover:opacity-100',
                    'bg-red-500/10 text-red-400',
                    'transition-opacity'
                  )}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              {branch.children && branch.children.length > 0 && (
                <div className="space-y-1">
                  {branch.children.map((child) => renderBranch(child, level + 1))}
                </div>
              )}
            </div>
          );
        };
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-garden-muted">
              <TypeIcon className="w-4 h-4" />
              <span>思维导图</span>
            </div>
            <div>
              <label className="block text-xs text-garden-muted mb-1.5">
                中心主题
              </label>
              <input
                type="text"
                value={mindmapContent.rootText}
                onChange={(e) =>
                  setContent({
                    ...mindmapContent,
                    rootText: e.target.value,
                  })
                }
                className={cn(
                  'w-full px-4 py-2.5 rounded-xl text-sm font-medium',
                  'bg-garden-primary/10 border border-garden-primary/30',
                  'focus:border-garden-primary/50 focus:outline-none',
                  'text-garden-text',
                  'transition-colors duration-200'
                )}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-garden-muted">分支</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addBranch(null)}
                >
                  <Plus className="w-3 h-3" />
                  添加分支
                </Button>
              </div>
              <div className="space-y-1 max-h-64 overflow-y-auto pr-2">
                {mindmapContent.branches.length === 0 ? (
                  <div className="text-center py-8 text-sm text-garden-muted/50">
                    暂无分支，点击上方按钮添加
                  </div>
                ) : (
                  mindmapContent.branches.map((branch) => renderBranch(branch))
                )}
              </div>
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  if (!node) {
    return (
      <AnimatePresence>
        {editorNodeId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={handleClose}
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  const TypeIcon = NODE_TYPE_ICONS[node.type] || FileText;

  return (
    <AnimatePresence>
      {editorNodeId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, type: 'spring', bounce: 0 }}
            className={cn(
              'relative w-full max-w-2xl max-h-[90vh]',
              'bg-slate-900/95 backdrop-blur-xl',
              'rounded-2xl border border-white/10',
              'shadow-2xl shadow-black/50',
              'flex flex-col overflow-hidden'
            )}
            style={{
              boxShadow: `0 0 60px ${getColorWithOpacity(color, 0.15)}`,
            }}
          >
            <div
              className="h-1.5 w-full"
              style={{
                background: `linear-gradient(90deg, ${color}, ${getColorWithOpacity(color, 0.5)})`,
              }}
            />

            <div className="flex items-center justify-between gap-4 p-4 border-b border-white/5">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0"
                  style={{
                    backgroundColor: getColorWithOpacity(color, 0.15),
                    color: color,
                  }}
                >
                  <TypeIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-garden-muted mb-0.5">
                    {NODE_TYPE_LABELS[node.type]}
                  </div>
                  <div className="text-sm font-medium text-garden-text truncate">
                    {title || '无标题'}
                  </div>
                </div>
              </div>
              <button
                onClick={handleClose}
                className={cn(
                  'p-2 rounded-lg flex-shrink-0',
                  'bg-white/5 text-garden-muted border border-white/10',
                  'hover:bg-white/10 hover:text-garden-text',
                  'transition-all duration-200'
                )}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex border-b border-white/5 px-4">
              {[
                { id: 'content', label: '内容', icon: FileText },
                { id: 'metadata', label: '元数据', icon: Settings },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-3 text-sm font-medium',
                    'border-b-2 -mb-px transition-all duration-200',
                    activeTab === tab.id
                      ? 'border-current text-garden-primary'
                      : 'border-transparent text-garden-muted hover:text-garden-text'
                  )}
                  style={
                    activeTab === tab.id
                      ? { borderColor: color, color: color }
                      : undefined
                  }
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'content' ? (
                renderContentEditor()
              ) : (
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs text-garden-muted mb-1.5">
                      标题
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="输入节点标题..."
                      className={cn(
                        'w-full px-4 py-2.5 rounded-xl text-sm',
                        'bg-white/5 border border-white/10',
                        'focus:border-garden-primary/50 focus:outline-none',
                        'text-garden-text placeholder:text-garden-muted/50',
                        'transition-colors duration-200'
                      )}
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Palette className="w-4 h-4 text-garden-muted" />
                      <span className="text-xs text-garden-muted">颜色</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {NODE_COLORS.map((c) => (
                        <button
                          key={c}
                          onClick={() => setColor(c)}
                          className={cn(
                            'w-9 h-9 rounded-xl transition-all duration-200',
                            'border-2',
                            color === c
                              ? 'border-white scale-110 shadow-lg'
                              : 'border-transparent hover:scale-105'
                          )}
                          style={{
                            backgroundColor: c,
                            boxShadow:
                              color === c
                                ? `0 0 20px ${getColorWithOpacity(c, 0.5)}`
                                : undefined,
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <TagIcon className="w-4 h-4 text-garden-muted" />
                      <span className="text-xs text-garden-muted">标签</span>
                    </div>
                    <TagInput value={tags} onChange={setTags} />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      {locked ? (
                        <Lock className="w-5 h-5 text-amber-400" />
                      ) : (
                        <Unlock className="w-5 h-5 text-garden-muted" />
                      )}
                      <div>
                        <div className="text-sm font-medium text-garden-text">
                          {locked ? '已锁定' : '未锁定'}
                        </div>
                        <div className="text-xs text-garden-muted">
                          {locked
                            ? '节点位置固定，不会被力导向布局移动'
                            : '节点可自由移动，力导向布局会调整其位置'}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLocked(!locked)}
                      className={cn(
                        'relative w-12 h-7 rounded-full transition-all duration-200',
                        locked ? 'bg-amber-500' : 'bg-white/10'
                      )}
                    >
                      <motion.div
                        animate={{ x: locked ? 22 : 2 }}
                        transition={{ type: 'spring', bounce: 0 }}
                        className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md"
                      />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 p-4 border-t border-white/5">
              <AnimatePresence mode="wait">
                {!showDeleteConfirm ? (
                  <motion.button
                    key="delete"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    onClick={() => setShowDeleteConfirm(true)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium',
                      'bg-red-500/10 text-red-400 border border-red-500/30',
                      'hover:bg-red-500/20 transition-all duration-200'
                    )}
                  >
                    <Trash2 className="w-4 h-4" />
                    删除
                  </motion.button>
                ) : (
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex items-center gap-2"
                  >
                    <span className="text-xs text-red-400">确认删除?</span>
                    <Button variant="danger" size="sm" onClick={handleDelete}>
                      是
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      否
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center gap-2">
                <Button onClick={handleClose}>取消</Button>
                <Button
                  variant="primary"
                  onClick={handleSave}
                  style={
                    {
                      '--tw-shadow-color': getColorWithOpacity(color, 0.3),
                    } as React.CSSProperties
                  }
                >
                  <Save className="w-4 h-4" />
                  保存
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
