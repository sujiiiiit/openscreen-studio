import { Progress } from "@/components/ui/progress";
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
    <>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
          <div className="w-full max-w-md rounded-lg bg-background p-6">
            <h2 className="text-lg font-semibold mb-4">Exporting Video...</h2>
            <Progress value={progress * 100} className="mb-4" showValue />
            <div className="text-sm text-muted-foreground text-center">
              {estimatedSecondsRemaining !== null
                ? `Estimated time remaining: ${formatTime(estimatedSecondsRemaining)}`
                : "Calculating time..."}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
