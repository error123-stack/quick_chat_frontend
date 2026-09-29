import { useEffect, useRef } from "react";

const ProfileImageModal = ({ imageUrl, onClose, userName }) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (!dialog.open) dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-label={
        userName ? `${userName}'s profile picture` : "Profile picture"
      }
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className="fixed inset-0 z-50 m-0 flex h-full w-full max-h-none max-w-none items-center justify-center border-0 bg-transparent p-0 backdrop:bg-black/85 backdrop:backdrop-blur-sm sm:p-6"
    >
      <div
        className="relative w-[95vw] sm:w-full sm:max-w-md flex flex-col rounded-none sm:rounded-[var(--radius-xl)] overflow-hidden border-0 sm:border sm:border-white/10 shadow-2xl bg-[var(--bg-panel)]"
        style={{ maxHeight: "100dvh" }}
      >
        <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
          <div className="flex-1 min-w-0">
            {userName && (
              <h3 className="text-[var(--text-primary)] text-[15px] sm:text-base font-semibold truncate">
                {userName}
              </h3>
            )}
            <p className="text-[var(--text-muted)] text-[11px] sm:text-xs">
              Profile picture
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="touch-target w-11 h-11 flex items-center justify-center rounded-full hover:bg-[var(--bg-input)] text-[var(--text-primary)] transition-colors shrink-0"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 sm:h-5 sm:w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-auto flex items-center justify-center bg-[var(--bg-app)] p-1 sm:p-4">
          <div className="w-full aspect-square max-w-full flex items-center justify-center">
            <img
              src={imageUrl}
              alt={
                userName ? `${userName}'s profile picture` : "Profile picture"
              }
              draggable={false}
              className="w-full h-full object-contain rounded-[var(--radius-md)] sm:rounded-[var(--radius-lg)] shadow-lg bg-[var(--bg-input)]"
            />
          </div>
        </div>
      </div>
    </dialog>
  );
};

export default ProfileImageModal;
