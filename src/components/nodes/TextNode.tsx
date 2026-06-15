import type { KnowledgeNode, TextContent } from '@/types';

interface TextNodeProps {
  node: KnowledgeNode;
}

export default function TextNode({ node }: TextNodeProps) {
  const content = node.content as TextContent;

  return (
    <div
      className="text-sm text-garden-text/90 leading-relaxed whitespace-pre-wrap"
      style={{
        display: '-webkit-box',
        WebkitLineClamp: 5,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      {content.text || '暂无内容'}
    </div>
  );
}
