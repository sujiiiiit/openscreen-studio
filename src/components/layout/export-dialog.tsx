import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";

type ExportDialogProps = {
  open: boolean;
  progress: number;
  estimatedSecondsRemaining: number | null;
};

function formatTime(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.ceil(totalSeconds % 60);

  const pad = (num: number) => num.toString().padStart(2, "0");

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

export default function ExportDialog({
  open,
  progress,
  estimatedSecondsRemaining,
}: ExportDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg border border-border"
          >
            <h2 className="text-lg font-semibold mb-4">Exporting Video...</h2>
            <Progress value={progress * 100} className="mb-4" showValue />
            <div className="text-sm text-muted-foreground text-center">
              {estimatedSecondsRemaining !== null
                ? `Estimated time remaining: ${formatTime(estimatedSecondsRemaining)}`
                : "Calculating time..."}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
