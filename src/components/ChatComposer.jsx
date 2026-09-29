import { useState } from "react";
import EmojiPicker from "emoji-picker-react";

const ChatComposer = ({
  input,
  setInput,
  hasMessageText,
  isRecording,
  onSendAttachment,
  onToggleRecording,
  onSendMessage,
  onEmojiClick,
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  return (
    <div className="chat-composer shrink-0 px-2 sm:px-4 py-2 sm:py-3 bg-[var(--bg-elevated)] safe-bottom">
      <div className="flex items-end gap-1.5 sm:gap-2.5">
        <div className="flex-1 flex items-center gap-0 sm:gap-1.5 bg-[var(--bg-input)] pl-1 sm:pl-2.5 pr-1 sm:pr-1.5 py-1 sm:py-1.5 rounded-[1.25rem] min-h-[48px] sm:min-h-[52px] border border-[var(--border-subtle)] shadow-[var(--shadow-card)] overflow-hidden">
          <button
            type="button"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className="touch-target w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full hover:bg-[var(--accent-soft)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)] shrink-0"
            aria-label="Emoji"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm-3.5-8a1.5 1.5 0 1 1 .001-3.001A1.5 1.5 0 0 1 8.5 12zm7 0a1.5 1.5 0 1 1 .001-3.001A1.5 1.5 0 0 1 15.5 12zm-.194 3.75c.627-.779.944-1.733.944-2.75h-2c0 .572-.146 1.103-.395 1.558-.302.545-.75.996-1.295 1.295-.455.249-.986.395-1.558.395s-1.103-.146-1.558-.395a3.229 3.229 0 0 1-1.295-1.295A3.224 3.224 0 0 1 7.75 13h-2c0 1.017.317 1.971.944 2.75.627.779 1.487 1.379 2.498 1.692 1.011.313 2.099.313 3.11 0 1.011-.313 1.871-.913 2.498-1.692z" />
            </svg>
          </button>

          {showEmojiPicker && (
            <div className="fixed sm:absolute bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] sm:bottom-20 left-2 right-2 sm:left-4 sm:right-auto z-50 rounded-[var(--radius-lg)] overflow-hidden border border-[var(--border-subtle)] shadow-[var(--shadow-modal)] max-w-[min(100vw-1rem,320px)] mx-auto sm:mx-0">
              <EmojiPicker
                onEmojiClick={onEmojiClick}
                theme="dark"
                width="100%"
                height={320}
              />
            </div>
          )}

          <input
            name="message"
            aria-label="Message"
            onChange={(event) => setInput(event.target.value)}
            value={input}
            onKeyDown={(event) =>
              event.key === "Enter" ? onSendMessage(event) : null
            }
            type="text"
            placeholder="Type a message or paste a link"
            className="flex-1 min-w-0 text-sm px-2 py-2 bg-transparent text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none"
          />

          <input
            onChange={onSendAttachment}
            type="file"
            id="attachment"
            accept="*/*"
            hidden
          />
          <label
            htmlFor="attachment"
            aria-label="Attach file"
            className="touch-target w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full hover:bg-[var(--bg-elevated)] cursor-pointer transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)] shrink-0"
            title="Attach file"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M16.5 6.5l-7.793 7.793a3 3 0 104.243 4.243l8.132-8.132a5 5 0 10-7.071-7.071L5.879 11.464a7 7 0 109.9 9.9l6.01-6.01"
              />
            </svg>
          </label>

          <button
            type="button"
            onClick={onToggleRecording}
            className={`touch-target w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full transition-colors shrink-0 ${
              hasMessageText && !isRecording ? "hidden" : ""
            } ${
              isRecording
                ? "bg-red-500 text-white"
                : "bg-[var(--accent-soft)] hover:bg-[var(--accent)] text-[var(--accent)] hover:text-white"
            }`}
            aria-label={isRecording ? "Stop recording" : "Record voice message"}
            title={
              isRecording
                ? "Stop and send voice message"
                : "Record voice message"
            }
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          </button>

          <button
            type="button"
            onClick={onSendMessage}
            className={`touch-target w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-full transition-all duration-200 shrink-0 shadow-[var(--shadow-card)] ${
              hasMessageText
                ? "bg-[var(--accent)] hover:bg-[var(--accent-hover)] scale-100 text-white"
                : "hidden sm:flex bg-[var(--bg-input)] text-[var(--text-muted)] hover:bg-[var(--bg-input)]"
            }`}
            aria-label="Send"
            title="Send"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatComposer;
