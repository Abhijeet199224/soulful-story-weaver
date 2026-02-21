import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Square } from "lucide-react";

interface VoiceNoteRecorderProps {
  onRecordingComplete?: (note: string) => void;
}

const VoiceNoteRecorder = ({ onRecordingComplete }: VoiceNoteRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<string[]>([
    "Described the feeling of walking through rain in Mumbai...",
    "Voice note about grandmother's kitchen smell...",
  ]);

  const toggleRecording = () => {
    if (isRecording) {
      const newNote = "New voice note captured...";
      setRecordings((prev) => [newNote, ...prev]);
      onRecordingComplete?.(newNote);
    }
    setIsRecording(!isRecording);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleRecording}
          className={`relative flex h-12 w-12 items-center justify-center rounded-full transition-all ${
            isRecording
              ? "bg-destructive text-destructive-foreground"
              : "bg-primary text-primary-foreground hover:opacity-90"
          }`}
        >
          {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-5 w-5" />}
          {isRecording && (
            <motion.span
              className="absolute inset-0 rounded-full border-2 border-destructive"
              animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </button>
        <span className="text-sm text-muted-foreground">
          {isRecording ? "Recording... tap to stop" : "Tap to record a voice note"}
        </span>
      </div>
      <div className="space-y-2">
        {recordings.map((note, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2 rounded-md border border-border bg-secondary/50 p-2.5 text-sm"
          >
            <MicOff className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="text-secondary-foreground">{note}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default VoiceNoteRecorder;
