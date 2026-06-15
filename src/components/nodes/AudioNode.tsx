import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Mic, Square } from 'lucide-react';
import type { KnowledgeNode, AudioContent } from '@/types';
import { cn } from '@/lib/utils';

interface AudioNodeProps {
  node: KnowledgeNode;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function AudioNode({ node }: AudioNodeProps) {
  const content = node.content as AudioContent;
  const waveform = content.waveform || [];
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(content.duration || 0);
  const [recordingBars, setRecordingBars] = useState<number[]>([]);

  useEffect(() => {
    if (!isRecording) return;
    const interval = setInterval(() => {
      setRecordingBars((prev) => {
        const newBars = [...prev, Math.random() * 0.7 + 0.3];
        return newBars.slice(-40);
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => setIsPlaying(false);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, [content.audioUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleRecord = () => {
    setIsRecording(!isRecording);
    if (isRecording) {
      setRecordingBars([]);
    }
  };

  const displayWaveform = isRecording ? recordingBars : waveform;
  const progress = duration > 0 ? currentTime / duration : 0;

  return (
    <div className="space-y-3">
      <audio ref={audioRef} src={content.audioUrl} preload="metadata" />

      {content.name && (
        <p className="text-xs text-garden-muted truncate">{content.name}</p>
      )}

      {content.audioUrl ? (
        <>
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              className={cn(
                'flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0 transition-all duration-300',
                isPlaying
                  ? 'bg-garden-primary text-white shadow-glow-emerald'
                  : 'bg-garden-primary/20 text-garden-primary border border-garden-primary/30 hover:bg-garden-primary/30'
              )}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
            </motion.button>

            <div className="flex-1">
              <div className="flex items-end gap-0.5 h-10 relative">
                {displayWaveform.length > 0 ? (
                  displayWaveform.slice(0, 40).map((value, idx) => {
                    const barProgress = idx / 40;
                    const isPast = barProgress < progress;
                    return (
                      <motion.div
                        key={idx}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ delay: idx * 0.01, duration: 0.2 }}
                        className={cn(
                          'flex-1 rounded-full min-w-[2px]',
                          isPast ? 'bg-garden-primary' : 'bg-garden-muted/40'
                        )}
                        style={{
                          height: `${Math.max(value * 100, 8)}%`,
                        }}
                      />
                    );
                  })
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-full h-2 rounded-full bg-garden-muted/30" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-garden-muted">
            <span>{formatDuration(currentTime)}</span>
            <span>{formatDuration(duration)}</span>
          </div>
        </>
      ) : (
        <div className="text-center py-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              toggleRecord();
            }}
            className={cn(
              'flex items-center justify-center w-14 h-14 rounded-full mx-auto transition-all duration-300 mb-3',
              isRecording
                ? 'bg-garden-red text-white animate-pulse shadow-[0_0_25px_rgba(239,68,68,0.5)]'
                : 'bg-garden-muted/20 text-garden-muted border border-white/10 hover:bg-garden-muted/30 hover:text-garden-text'
            )}
          >
            {isRecording ? <Square size={18} /> : <Mic size={20} />}
          </motion.button>
          <AnimatePresence mode="wait">
            {isRecording ? (
              <motion.div
                key="recording"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-2"
              >
                <p className="text-xs text-garden-red font-medium">正在录音...</p>
                <div className="flex items-end gap-0.5 h-8 justify-center">
                  {recordingBars.slice(-20).map((value, idx) => (
                    <motion.div
                      key={idx}
                      className="w-1 bg-garden-red rounded-full"
                      style={{
                        height: `${Math.max(value * 100, 10)}%`,
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.p
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs text-garden-muted"
              >
                点击开始录音
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
