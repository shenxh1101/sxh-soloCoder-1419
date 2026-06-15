import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Tag as TagIcon } from 'lucide-react';
import { useGardenStore } from '@/store/useGardenStore';
import { NODE_COLORS } from '@/types';
import { getColorWithOpacity } from '@/utils/colors';
import { cn } from '@/lib/utils';

interface TagInputProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export default function TagInput({ value, onChange }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownIndex, setDropdownIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const tags = useGardenStore((s) => s.tags);
  const addTag = useGardenStore((s) => s.addTag);

  const selectedTagObjects = useMemo(() => {
    return value
      .map((id) => tags.find((t) => t.id === id))
      .filter(Boolean);
  }, [value, tags]);

  const filteredTags = useMemo(() => {
    const search = inputValue.toLowerCase().trim();
    return tags.filter(
      (t) => !value.includes(t.id) && (!search || t.name.toLowerCase().includes(search))
    );
  }, [inputValue, tags, value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (dropdownIndex >= filteredTags.length) {
      setDropdownIndex(0);
    }
  }, [filteredTags, dropdownIndex]);

  const handleRemoveTag = (tagId: string) => {
    onChange(value.filter((id) => id !== tagId));
  };

  const handleSelectTag = (tagId: string) => {
    if (!value.includes(tagId)) {
      onChange([...value, tagId]);
    }
    setInputValue('');
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const handleCreateTag = () => {
    const name = inputValue.trim();
    if (!name) return;

    const existing = tags.find((t) => t.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      handleSelectTag(existing.id);
      return;
    }

    const usedColors = tags.map((t) => t.color);
    let color = NODE_COLORS[0];
    for (const c of NODE_COLORS) {
      if (!usedColors.includes(c)) {
        color = c;
        break;
      }
    }
    if (usedColors.length >= NODE_COLORS.length) {
      color = NODE_COLORS[Math.floor(Math.random() * NODE_COLORS.length)];
    }

    const newId = addTag({ name, color });
    if (newId) {
      onChange([...value, newId]);
    }
    setInputValue('');
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredTags.length > 0 && dropdownIndex < filteredTags.length) {
        handleSelectTag(filteredTags[dropdownIndex].id);
      } else if (inputValue.trim()) {
        handleCreateTag();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (filteredTags.length > 0) {
        setDropdownIndex((prev) => (prev + 1) % filteredTags.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (filteredTags.length > 0) {
        setDropdownIndex((prev) => (prev - 1 + filteredTags.length) % filteredTags.length);
      }
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      handleRemoveTag(value[value.length - 1]);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        className={cn(
          'flex flex-wrap items-center gap-1.5 min-h-[44px] p-2 rounded-xl',
          'bg-white/5 border border-white/10 focus-within:border-garden-primary/50',
          'transition-all duration-200'
        )}
        onClick={() => inputRef.current?.focus()}
      >
        <AnimatePresence>
          {selectedTagObjects.map((tag) => (
            tag && (
              <motion.div
                key={tag.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium"
                style={{
                  backgroundColor: getColorWithOpacity(tag.color, 0.15),
                  color: tag.color,
                  border: `1px solid ${getColorWithOpacity(tag.color, 0.3)}`,
                }}
              >
                <TagIcon className="w-3 h-3" />
                <span>{tag.name}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveTag(tag.id);
                  }}
                  className="ml-0.5 hover:opacity-80 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            )
          ))}
        </AnimatePresence>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? '输入标签名称...' : ''}
          className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-sm text-garden-text placeholder:text-garden-muted/50"
        />
      </div>

      <AnimatePresence>
        {showDropdown && (filteredTags.length > 0 || inputValue.trim()) && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 py-1 rounded-xl border border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-2xl max-h-60 overflow-y-auto"
          >
            {filteredTags.map((tag, index) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => handleSelectTag(tag.id)}
                onMouseEnter={() => setDropdownIndex(index)}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 text-left text-sm transition-colors',
                  index === dropdownIndex ? 'bg-white/10' : 'hover:bg-white/5'
                )}
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: tag.color }}
                />
                <span className="text-garden-text flex-1">{tag.name}</span>
              </button>
            ))}
            {inputValue.trim() && !tags.some((t) => t.name.toLowerCase() === inputValue.trim().toLowerCase()) && (
              <button
                type="button"
                onClick={handleCreateTag}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-garden-primary border-t border-white/5 hover:bg-white/5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>创建 "{inputValue.trim()}"</span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
