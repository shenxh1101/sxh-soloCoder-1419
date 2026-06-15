import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X } from 'lucide-react';
import type { KnowledgeNode, ImageContent, ImageItem } from '@/types';

interface ImageNodeProps {
  node: KnowledgeNode;
}

export default function ImageNode({ node }: ImageNodeProps) {
  const content = node.content as ImageContent;
  const images = content.images || [];
  const [previewImage, setPreviewImage] = useState<ImageItem | null>(null);

  return (
    <>
      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {images.slice(0, 4).map((img) => (
            <motion.div
              key={img.id}
              whileHover={{ scale: 1.03 }}
              className="relative aspect-square rounded-lg overflow-hidden cursor-pointer bg-garden-bg/60 border border-white/5 group"
              onClick={(e) => {
                e.stopPropagation();
                setPreviewImage(img);
              }}
            >
              <img
                src={img.thumbnail || img.url}
                alt={img.name}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200" />
              {images.length > 4 && images.indexOf(img) === 3 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">+{images.length - 4}</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 text-garden-muted border-2 border-dashed border-white/10 rounded-lg">
          <Upload size={28} className="mb-2 opacity-60" />
          <p className="text-xs">点击上传图片</p>
        </div>
      )}

      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-8"
            onClick={() => setPreviewImage(null)}
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-6 right-6 btn-icon text-white"
            >
              <X size={20} />
            </button>
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              src={previewImage.url}
              alt={previewImage.name}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
