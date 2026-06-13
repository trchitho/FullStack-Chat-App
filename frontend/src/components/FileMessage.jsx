import { Download, FileText } from "lucide-react";

const formatSize = (bytes = 0) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
};

const FileMessage = ({ message, onDownload, language }) => (
  <div className="flex w-full max-w-[78vw] items-center gap-3 rounded-2xl bg-black/10 p-3 md:max-w-sm">
    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-base-100/25">
      <FileText className="size-5" />
    </span>
    <span className="min-w-0 flex-1">
      <span className="block truncate font-semibold">{message.attachment.name}</span>
      <span className="block text-xs opacity-70">{formatSize(message.attachment.size)}</span>
    </span>
    <button
      type="button"
      className="btn btn-circle btn-ghost btn-sm"
      onClick={() => onDownload(message)}
      aria-label={language === "vi" ? `Tải ${message.attachment.name}` : `Download ${message.attachment.name}`}
    >
      <Download className="size-5" />
    </button>
  </div>
);

export default FileMessage;
