import { useContext, useEffect, useRef } from "react";
import { ChatContext } from "../context/chatContext";

const MessageOptions = ({ messageId, isOwnMessage, onClose }) => {
  const { deleteMessage } = useContext(ChatContext);
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, []);

  const handleDeleteForMe = () => {
    deleteMessage(messageId, "me");
    onClose();
  };

  const handleDeleteForEveryone = () => {
    deleteMessage(messageId, "everyone");
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="delete-message-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className="fixed inset-0 z-50 m-0 flex h-full w-full max-h-none max-w-none items-center justify-center border-0 bg-transparent p-4 backdrop:bg-black/60 backdrop:backdrop-blur-sm"
    >
      <div className="w-full max-w-sm rounded-[var(--radius-xl)] bg-[var(--bg-panel)] border border-[var(--border-subtle)] p-6 text-[var(--text-primary)] shadow-[var(--shadow-modal)]">
        <p id="delete-message-title" className="text-base font-medium mb-4">
          Delete message?
        </p>
        <div className="flex flex-col gap-2">
          {isOwnMessage && (
            <button
              type="button"
              onClick={handleDeleteForEveryone}
              className="py-2.5 px-4 rounded-[var(--radius-md)] bg-[var(--bg-input)] hover:bg-[var(--bg-elevated)] text-sm transition-colors border border-[var(--border-subtle)]"
            >
              Delete for everyone
            </button>
          )}
          <button
            type="button"
            onClick={handleDeleteForMe}
            className="py-2.5 px-4 rounded-[var(--radius-md)] bg-[var(--bg-input)] hover:bg-[var(--bg-elevated)] text-sm transition-colors border border-[var(--border-subtle)]"
          >
            Delete for me
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-[var(--radius-md)] bg-[var(--bg-input)] hover:bg-[var(--bg-elevated)] text-sm transition-colors border border-[var(--border-subtle)] mt-2"
          >
            Cancel
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default MessageOptions;
