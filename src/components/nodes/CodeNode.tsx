import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check } from 'lucide-react';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import type { KnowledgeNode, CodeContent } from '@/types';
import { cn } from '@/lib/utils';

interface CodeNodeProps {
  node: KnowledgeNode;
}

export default function CodeNode({ node }: CodeNodeProps) {
  const content = node.content as CodeContent;
  const [copied, setCopied] = useState(false);
  const [highlighted, setHighlighted] = useState('');

  useEffect(() => {
    const lang = content.language || 'javascript';
    try {
      const grammar = Prism.languages[lang] || Prism.languages.javascript;
      setHighlighted(Prism.highlight(content.code || '', grammar, lang));
    } catch {
      setHighlighted(content.code || '');
    }
  }, [content.code, content.language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content.code || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <span className="badge bg-garden-panel text-garden-muted border border-white/10 font-mono text-xs">
          {content.language || 'text'}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCopy();
          }}
          className={cn(
            'btn-icon !p-1.5 transition-all duration-300',
            copied && '!bg-garden-primary/20 !text-garden-primary !border-garden-primary/30'
          )}
        >
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.div
                key="check"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Check size={14} />
              </motion.div>
            ) : (
              <motion.div
                key="copy"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Copy size={14} />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>
      <div
        className="pre-code rounded-lg bg-garden-bg/60 p-3 overflow-y-auto border border-white/5"
        style={{ maxHeight: '150px' }}
      >
        <pre className="m-0">
          <code
            className={`language-${content.language || 'javascript'}`}
            dangerouslySetInnerHTML={{ __html: highlighted || '<span class="text-garden-muted">// 暂无代码</span>' }}
          />
        </pre>
      </div>
    </div>
  );
}
