import type { KnowledgeNode, KnowledgeConnection, Tag } from '../types';

export interface ExportData {
  nodes: KnowledgeNode[];
  connections: KnowledgeConnection[];
  tags: Tag[];
  exportedAt: number;
  version: string;
}

export function exportToJSON(
  nodes: KnowledgeNode[],
  connections: KnowledgeConnection[],
  tags: Tag[]
): string {
  const data: ExportData = {
    nodes,
    connections,
    tags,
    exportedAt: Date.now(),
    version: '1.0.0',
  };
  return JSON.stringify(data, null, 2);
}

export function downloadJSON(content: string, filename: string = 'knowledge-garden.json'): void {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function generateStaticHTML(
  nodes: KnowledgeNode[],
  connections: KnowledgeConnection[],
  tags: Tag[]
): string {
  const nodesStr = JSON.stringify(nodes);
  const connectionsStr = JSON.stringify(connections);
  const tagsStr = JSON.stringify(tags);

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>知识花园 - 静态导出</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0f172a;
      color: #e2e8f0;
      padding: 20px;
      min-height: 100vh;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 {
      font-size: 2rem;
      margin-bottom: 8px;
      background: linear-gradient(135deg, #10b981, #3b82f6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .subtitle { color: #64748b; margin-bottom: 32px; }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }
    .stat-card {
      background: linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02));
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      padding: 20px;
    }
    .stat-value { font-size: 2rem; font-weight: 700; margin-bottom: 4px; }
    .stat-label { color: #64748b; font-size: 0.875rem; }
    .section-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .node-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
      margin-bottom: 40px;
    }
    .node-card {
      background: linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.01));
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      padding: 16px;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .node-card:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.4); }
    .node-type {
      display: inline-block;
      font-size: 0.75rem;
      padding: 2px 8px;
      border-radius: 10px;
      margin-bottom: 8px;
      background: rgba(16,185,129,0.2);
      color: #10b981;
    }
    .node-title { font-weight: 600; margin-bottom: 8px; word-break: break-word; }
    .node-content {
      font-size: 0.875rem;
      color: #94a3b8;
      line-height: 1.5;
      max-height: 120px;
      overflow: hidden;
      white-space: pre-wrap;
    }
    .node-meta { margin-top: 12px; display: flex; justify-content: space-between; font-size: 0.75rem; color: #64748b; }
    .tag-list { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
    .tag {
      font-size: 0.7rem;
      padding: 2px 8px;
      border-radius: 10px;
      opacity: 0.9;
    }
    .connections-list { display: flex; flex-direction: column; gap: 8px; }
    .connection-item {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 12px;
      padding: 12px 16px;
      font-size: 0.875rem;
    }
    .footer {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 1px solid rgba(255,255,255,0.1);
      text-align: center;
      color: #64748b;
      font-size: 0.875rem;
    }
    pre {
      background: #1e293b;
      padding: 12px;
      border-radius: 8px;
      overflow-x: auto;
      font-size: 0.75rem;
      max-height: 100px;
    }
    code { font-family: 'JetBrains Mono', monospace; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🌱 知识花园</h1>
    <p class="subtitle">导出时间：${new Date().toLocaleString('zh-CN')}</p>

    <div class="stats">
      <div class="stat-card">
        <div class="stat-value">${nodes.length}</div>
        <div class="stat-label">知识节点</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${connections.length}</div>
        <div class="stat-label">节点关联</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${tags.length}</div>
        <div class="stat-label">标签数量</div>
      </div>
    </div>

    <div>
      <h2 class="section-title">📝 知识节点列表</h2>
      <div class="node-grid" id="node-grid"></div>
    </div>

    <div>
      <h2 class="section-title">🔗 节点关联关系</h2>
      <div class="connections-list" id="conn-list"></div>
    </div>

    <div class="footer">由知识花园 Knowledge Garden 生成</div>
  </div>

  <script>
    const nodes = ${nodesStr};
    const connections = ${connectionsStr};
    const tags = ${tagsStr};
    const tagMap = {};
    tags.forEach(t => tagMap[t.id] = t);

    const typeLabels = {
      text: '📄 文本',
      code: '💻 代码',
      image: '🖼️ 图片',
      bookmark: '🔖 书签',
      audio: '🎵 音频',
      mindmap: '🧠 思维导图'
    };

    function getNodeContentPreview(node) {
      switch (node.type) {
        case 'text': return node.content.text;
        case 'code': return node.content.code;
        case 'image': return \`包含 \${node.content.images.length} 张图片\`;
        case 'bookmark': return node.content.url;
        case 'audio': return node.content.name || '音频备忘录';
        case 'mindmap': return node.content.rootText + \` (\${node.content.branches.length} 个分支)\`;
        default: return '';
      }
    }

    const nodeMap = {};
    nodes.forEach(n => nodeMap[n.id] = n);

    const grid = document.getElementById('node-grid');
    nodes.forEach(n => {
      const preview = getNodeContentPreview(n);
      const tagHtml = n.tags.map(tid => {
        const tag = tagMap[tid];
        if (!tag) return '';
        return \`<span class="tag" style="background: \${tag.color}20; color: \${tag.color}">\${tag.name}</span>\`;
      }).join('');
      const isCode = n.type === 'code';
      const contentHtml = isCode
        ? \`<pre><code>\${preview.slice(0, 300)}</code></pre>\`
        : \`<div class="node-content">\${preview.slice(0, 300)}</div>\`;
      const card = document.createElement('div');
      card.className = 'node-card';
      card.style.borderLeft = \`3px solid \${n.color}\`;
      card.innerHTML = \`
        <span class="node-type">\${typeLabels[n.type]}</span>
        <div class="node-title">\${n.title}</div>
        \${contentHtml}
        <div class="tag-list">\${tagHtml}</div>
        <div class="node-meta">
          <span>\${new Date(n.createdAt).toLocaleDateString('zh-CN')}</span>
        </div>
      \`;
      grid.appendChild(card);
    });

    const connList = document.getElementById('conn-list');
    connections.forEach(c => {
      const from = nodeMap[c.fromId];
      const to = nodeMap[c.toId];
      if (!from || !to) return;
      const item = document.createElement('div');
      item.className = 'connection-item';
      item.innerHTML = \`<strong>\${from.title}</strong> → <strong>\${to.title}</strong> \${c.label ? \`(\${c.label})\` : ''}\`;
      connList.appendChild(item);
    });
  </script>
</body>
</html>`;
}

export function downloadHTML(content: string, filename: string = 'knowledge-garden.html'): void {
  const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importFromJSON(json: string): ExportData | null {
  try {
    const data = JSON.parse(json);
    if (!data.nodes || !Array.isArray(data.nodes)) {
      throw new Error('Invalid data format: nodes array missing');
    }
    return data as ExportData;
  } catch (e) {
    console.error('Import failed:', e);
    return null;
  }
}
