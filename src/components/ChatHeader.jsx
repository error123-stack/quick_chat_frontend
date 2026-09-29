import assets from "../assets/assets";
import Avatar from "./Avatar";

const ChatHeader = ({
  selectedUser,
  online,
  onBack,
  onProfileOpen,
  onStartCall,
  onOpenSharedMedia,
}) => (
  <div className="chat-header sticky top-0 z-20 flex items-center gap-2 sm:gap-3 py-2 px-2 sm:px-4 bg-[var(--bg-elevated)] border-b border-[var(--border-subtle)] min-h-[56px] sm:min-h-[59px] safe-top">
    <button
      type="button"
      onClick={onBack}
      className="md:hidden touch-target p-2 rounded-full hover:bg-[var(--bg-input)] transition-colors shrink-0 -ml-1"
      aria-label="Back to chats"
    >
      <img src={assets.arrow_icon} alt="" className="w-5 h-5 opacity-80" />
    </button>
    <Avatar
      src={selectedUser.profilePic}
      name={selectedUser.fullName}
      size="md"
      online={online}
      ringOnHover
      onClick={onProfileOpen}
    />
    <div className="flex-1 min-w-0">
      <p className="text-[var(--text-primary)] font-medium truncate text-[15px] sm:text-base">
        {selectedUser.fullName}
      </p>
      <p className="text-xs text-[var(--text-secondary)]">
        {online ? "online" : "offline"}
      </p>
    </div>
    <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
      <button
        type="button"
        onClick={() => onStartCall("audio")}
        className="touch-target p-2 rounded-full hover:bg-[var(--bg-input)] transition-colors"
        aria-label="Voice call"
        title="Voice call"
      >
        <svg
          className="w-5 h-5 text-[var(--text-secondary)]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
          />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => onStartCall("video")}
        className="touch-target p-2 rounded-full hover:bg-[var(--bg-input)] transition-colors flex max-[380px]:hidden"
        aria-label="Video call"
        title="Video call"
      >
        <svg
          className="w-5 h-5 text-[var(--text-secondary)]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      </button>
      <button
        type="button"
        onClick={onOpenSharedMedia}
        className="touch-target p-2 rounded-full hover:bg-[var(--bg-input)] transition-colors"
        aria-label="Open shared media"
        title="Media, links and docs"
      >
        <svg
          className="w-5 h-5 text-[var(--text-secondary)]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M4 6a2 2 0 012-2h10a2 2 0 012 2v2h2a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V6z"
          />
        </svg>
      </button>
    </div>
  </div>
);

export default ChatHeader;
