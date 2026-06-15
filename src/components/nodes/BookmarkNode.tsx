import { motion } from 'framer-motion';
import { Globe, ExternalLink } from 'lucide-react';
import type { KnowledgeNode, BookmarkContent } from '@/types';

interface BookmarkNodeProps {
  node: KnowledgeNode;
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function getFavicon(url: string, favicon?: string): string {
  if (favicon) return favicon;
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch {
    return '';
  }
}

export default function BookmarkNode({ node }: BookmarkNodeProps) {
  const content = node.content as BookmarkContent;
  const title = content.title || content.url;
  const domain = getDomain(content.url);
  const favicon = getFavicon(content.url, content.favicon);

  return (
    <motion.a
      href={content.url}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.01 }}
      onClick={(e) => e.stopPropagation()}
      className="block group"
    >
      <div className="flex items-start gap-3 p-3 rounded-lg bg-garden-bg/40 border border-white/5 hover:border-white/10 transition-colors duration-200">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-garden-panel flex items-center justify-center overflow-hidden border border-white/5">
          {favicon ? (
            <img
              src={favicon}
              alt=""
              className="w-6 h-6 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <Globe size={18} className="text-garden-muted" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-medium text-garden-text truncate group-hover:text-garden-primary transition-colors line-clamp-2">
              {title}
            </h4>
            <ExternalLink size={14} className="flex-shrink-0 mt-0.5 text-garden-muted opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="text-xs text-garden-muted mt-1 truncate">
            {domain}
          </p>
          {content.description && (
            <p
              className="text-xs text-garden-muted/80 mt-2 line-clamp-2 leading-relaxed"
            >
              {content.description}
            </p>
          )}
        </div>
      </div>
    </motion.a>
  );
}
