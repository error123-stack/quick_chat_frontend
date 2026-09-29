const ChatMediaPreview = ({ preview, onClose }) => {
  if (!preview.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--bg-panel)] shadow-[var(--shadow-modal)]">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] px-4 py-3 bg-[var(--bg-elevated)]">
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {preview.title}
            </p>
            <p className="text-xs text-[var(--text-secondary)]">
              {preview.type === "file"
                ? "File preview is not available for this type."
                : `Preview ${preview.type}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={preview.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full px-3 py-1 text-xs font-medium border border-[var(--border-subtle)] hover:bg-[var(--bg-input)]"
            >
              Open in new tab
            </a>
            <button
              type="button"
              onClick={onClose}
              className="touch-target rounded-full p-2 hover:bg-[var(--bg-input)] transition-colors"
              aria-label="Close preview"
            >
              &times;
            </button>
          </div>
        </div>
        <div className="max-h-[80vh] overflow-auto bg-[var(--bg-panel)] p-4">
          {preview.type === "image" && (
            <img
              src={preview.url}
              alt={preview.title}
              className="mx-auto max-h-[70vh] w-auto rounded-[var(--radius-lg)] object-contain"
            />
          )}
          {preview.type === "video" && (
            <video
              controls
              src={preview.url}
              className="w-full rounded-[var(--radius-lg)]"
            />
          )}
          {preview.type === "audio" && (
            <audio controls src={preview.url} className="w-full" />
          )}
          {preview.type === "pdf" && (
            <object
              data={preview.url}
              type="application/pdf"
              className="w-full min-h-[60vh] rounded-[var(--radius-lg)] border border-[var(--border-subtle)]"
            >
              <p className="text-sm text-[var(--text-secondary)]">
                PDF preview is not supported by your browser. Use the button
                above to open or download the file.
              </p>
            </object>
          )}
          {preview.type === "file" && (
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-app)] p-6 text-sm text-[var(--text-secondary)]">
              <p className="font-medium text-[var(--text-primary)]">
                {preview.title}
              </p>
              <p className="mt-2">
                This file type cannot be previewed in the app. Use the button
                above to open it in a new tab or download it.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMediaPreview;
