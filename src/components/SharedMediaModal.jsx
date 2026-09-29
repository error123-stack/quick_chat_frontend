import { normalizeUrl } from "../lib/utils";

const SharedMediaModal = ({
  isOpen,
  sharedMedia,
  sharedFiles,
  sharedLinks,
  onClose,
  onMediaPreview,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--bg-panel)] shadow-[var(--shadow-modal)]">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] px-4 py-3 bg-[var(--bg-elevated)]">
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              Media, links & docs
            </p>
            <p className="text-xs text-[var(--text-secondary)]">
              Shared items from this chat
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="touch-target rounded-full p-2 hover:bg-[var(--bg-input)] transition-colors"
            aria-label="Close media panel"
          >
            &times;
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-4 py-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.15em] text-[var(--text-muted)]">
                  Media
                </p>
                {sharedMedia.length ? (
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    {sharedMedia.map((msg) => (
                      <button
                        key={msg._id}
                        type="button"
                        onClick={() => onMediaPreview(msg)}
                        className="aspect-square overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-app)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                      >
                        {msg.image ? (
                          <img
                            src={msg.image}
                            alt="Shared media"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[var(--text-secondary)]">
                            {msg.video ? "VIDEO" : "AUDIO"}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-[var(--text-secondary)]">
                    No shared media yet.
                  </p>
                )}
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.15em] text-[var(--text-muted)]">
                  Documents & attachments
                </p>
                {sharedFiles.length ? (
                  <div className="mt-3 space-y-3">
                    {sharedFiles.map((msg) => (
                      <a
                        key={msg._id}
                        href={msg.file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-input)] px-3 py-3 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
                      >
                        <span className="font-medium">
                          {msg.file.name || "Attachment"}
                        </span>
                        <span className="block text-[var(--text-secondary)] text-xs mt-1">
                          {msg.file.mimeType || "File"}
                        </span>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-[var(--text-secondary)]">
                    No attached docs or files.
                  </p>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-[var(--text-muted)]">
                Links
              </p>
              {sharedLinks.length ? (
                <div className="mt-3 space-y-2">
                  {sharedLinks.map((item) => (
                    <a
                      key={`${item.messageId}-${item.url}`}
                      href={normalizeUrl(item.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-input)] px-3 py-3 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
                    >
                      {item.url}
                    </a>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-[var(--text-secondary)]">
                  No shared links found.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedMediaModal;
