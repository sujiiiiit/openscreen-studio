import { Progress } from "@/components/ui/progress";

export function DownloadModel() {
  return (
    <div className="pl-6">
      <div className="rounded-md border border-dashed px-3 py-2 text-sm text-slate-500">
        <div className="space-y-3 max-w-sm w-full mx-auto">
          <div className="flex items-center justify-between"></div>
          <Progress value={45} showValue className="w-full" size="sm" />
        </div>
      </div>
    </div>
  );
}
