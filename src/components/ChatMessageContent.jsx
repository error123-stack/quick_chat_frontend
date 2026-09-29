import {
  extractUrls,
  formatCallDuration,
  formatFileSize,
  formatMessageTime,
  getFileTypeLabel,
  normalizeUrl,
} from "../lib/utils";

const optionButtonClass =
  "absolute top-2 w-7 h-7 flex items-center justify-center rounded-full bg-[var(--bg-elevated)] hover:bg-[var(--bg-input)] text-[var(--text-primary)] opacity-0 group-hover:opacity-100 transition-opacity border border-[var(--border-subtle)]";

const MessageOptionsButton = ({ message, authUser, onOpen }) => (
  <button
    type="button"
    className={`${optionButtonClass} ${message.senderId === authUser._id ? "right-2" : "left-2"}`}
    aria-label="Message options"
    onClick={(event) => {
      event.stopPropagation();
      onOpen(message);
    }}
  >
    ⋮
  </button>
);

const MessageTimestamp = ({ message, authUser, className = "" }) => (
  <div
    className={`absolute bottom-1 right-2 text-[11px] leading-none flex items-center gap-1 text-[var(--text-muted)] ${className}`}
  >
    <span>{formatMessageTime(message.createdAt)}</span>
    {message.senderId === authUser._id && (
      <span
        className={message.seen ? "text-blue-400" : "text-[var(--text-muted)]"}
      >
        ✓✓
      </span>
    )}
  </div>
);

const renderTextWithLinks = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
  const parts = String(text || "").split(urlRegex);
  const partOccurrences = new Map();

  return parts.map((part) => {
    const occurrence = partOccurrences.get(part) || 0;
    partOccurrences.set(part, occurrence + 1);
    const key = `${part}-${occurrence}`;
    if (!/^(https?:\/\/|www\.)/i.test(part)) {
      return <span key={key}>{part}</span>;
    }

    return (
      <a
        key={key}
        href={normalizeUrl(part)}
        target="_blank"
        rel="noopener noreferrer"
        className="underline message-link break-all"
      >
        {part}
      </a>
    );
  });
};

const getSingleLink = (text) => {
  const links = extractUrls(text);
  if (links.length !== 1) return null;
  return String(text || "").trim() === links[0] ? links[0] : null;
};

const getLinkHost = (url) => {
  try {
    return new URL(normalizeUrl(url)).hostname.replace(/^www\./i, "");
  } catch {
    return "Open link";
  }
};

const DeletedMessage = ({ message, authUser, onOpenOptions }) => (
  <div className="relative inline-block mb-1 group max-w-[min(85%,22rem)] min-w-[120px]">
    <p className="p-3 text-[var(--text-muted)] italic bg-[var(--received-bubble)] bubble-received break-normal whitespace-pre-wrap text-sm">
      This message was deleted
    </p>
    <button
      type="button"
      className={`absolute top-2 ${message.senderId === authUser._id ? "right-2" : "left-2"} w-7 h-7 flex items-center justify-center rounded-full bg-[var(--bg-elevated)] hover:bg-[var(--bg-input)] text-[var(--text-primary)] opacity-0 group-hover:opacity-100 transition-opacity border border-[var(--border-subtle)]`}
      aria-label="Message options"
      onClick={() => onOpenOptions(message, false)}
    >
      ⋮
    </button>
  </div>
);

const CallMessage = ({ message, authUser }) => {
  const isVideo = message.callType === "video";
  const duration = formatCallDuration(message.callDuration);
  const label =
    message.callStatus === "missed"
      ? `Missed ${isVideo ? "video" : "voice"} call`
      : `${isVideo ? "Video" : "Voice"} call${duration ? ` · ${duration}` : ""}`;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-[var(--radius-lg)] text-sm ${
        message.senderId === authUser._id
          ? "bg-[var(--sent-bubble)] text-white bubble-sent"
          : "bg-[var(--received-bubble)] text-[var(--text-primary)] bubble-received"
      }`}
    >
      <span>{label}</span>
      <span className="text-[11px] opacity-90 ml-1">
        {formatMessageTime(message.createdAt)}
      </span>
    </div>
  );
};

const MediaMessage = ({ message, authUser, onOpenOptions, onOpenPreview }) => {
  const isImage = Boolean(message.image);
  const isVideo = Boolean(message.video);
  const src = message.image || message.video || message.audio;
  const content = isImage ? (
    <button
      type="button"
      aria-label="Preview image"
      onClick={() => onOpenPreview(src, "image", "Image preview")}
    >
      <img
        src={src}
        alt=""
        className="max-w-[min(85vw,250px)] sm:max-w-[250px] md:max-w-[300px] max-h-[70vh] object-contain shadow-lg rounded-[var(--radius-xl)]"
      />
    </button>
  ) : isVideo ? (
    <video
      controls
      src={src}
      className="max-w-[min(85vw,250px)] sm:max-w-[250px] md:max-w-[300px] max-h-[50vh] rounded-[var(--radius-xl)] shadow-lg"
    />
  ) : (
    <audio controls src={src} className="max-w-[240px] h-9" />
  );

  return (
    <div className="relative inline-block mb-6 group">
      {content}
      <MessageOptionsButton
        message={message}
        authUser={authUser}
        onOpen={onOpenOptions}
      />
      <MessageTimestamp message={message} authUser={authUser} />
    </div>
  );
};

const FileMessage = ({
  message,
  authUser,
  onOpenOptions,
  onOpenPreview,
  getPreviewType,
}) => {
  const isOwnMessage = message.senderId === authUser._id;
  const file = message.file;
  const badgeClass = isOwnMessage
    ? "bg-white/12 text-white border border-white/10"
    : "bg-[var(--bg-app)] text-[var(--text-primary)] border border-[var(--border-subtle)]";

  return (
    <div
      className={`message-card relative inline-flex items-start gap-3 min-w-[15rem] max-w-[min(90vw,24rem)] rounded-[var(--radius-xl)] px-3 py-3 mb-1 group ${
        isOwnMessage
          ? "bg-[var(--sent-bubble)] text-white bubble-sent"
          : "bg-[var(--received-bubble)] text-[var(--text-primary)] bubble-received"
      }`}
    >
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xs font-semibold shrink-0 shadow-sm ${badgeClass}`}
      >
        {getFileTypeLabel(file)}
      </div>
      <div className="min-w-0 flex-1 pr-10">
        <a
          href={file.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block font-medium break-words underline-offset-2 hover:underline"
        >
          {file.name || "Attachment"}
        </a>
        <p
          className={`text-xs mt-1 ${isOwnMessage ? "text-white/80" : "text-[var(--text-muted)]"}`}
        >
          {formatFileSize(file.size)}
          {file.mimeType ? ` • ${file.mimeType}` : ""}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-input)] px-3 py-1 text-[11px] font-medium transition-colors hover:bg-[var(--bg-elevated)]"
          >
            Open file
          </a>
          <button
            type="button"
            onClick={() =>
              onOpenPreview(
                file.url,
                getPreviewType(file),
                file.name || "Attachment preview",
              )
            }
            className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-input)] px-3 py-1 text-[11px] font-medium transition-colors hover:bg-[var(--bg-elevated)]"
          >
            Preview
          </button>
        </div>
      </div>
      <MessageOptionsButton
        message={message}
        authUser={authUser}
        onOpen={onOpenOptions}
      />
      <MessageTimestamp
        message={message}
        authUser={authUser}
        className="right-3"
      />
    </div>
  );
};

const LinkMessage = ({ message, authUser, url, onOpenOptions }) => {
  const isOwnMessage = message.senderId === authUser._id;
  const host = getLinkHost(url);

  return (
    <div
      className={`message-card relative inline-block mb-1 group min-w-[12rem] max-w-[min(90%,28rem)] ${
        isOwnMessage ? "text-white" : "text-[var(--text-primary)]"
      }`}
    >
      <a
        href={normalizeUrl(url)}
        aria-label={`Open ${host}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`block rounded-[var(--radius-xl)] px-3 py-3 pr-12 ${
          isOwnMessage
            ? "bg-[var(--sent-bubble)] bubble-sent"
            : "bg-[var(--received-bubble)] bubble-received"
        }`}
      >
        <p className="text-xs uppercase tracking-wide opacity-75">
          Website preview
        </p>
        <p className="mt-2 font-medium break-all">{host}</p>
        <p
          className={`text-xs break-all mt-1 ${isOwnMessage ? "text-white/80" : "text-[var(--text-muted)]"}`}
        >
          {url}
        </p>
      </a>
      <MessageOptionsButton
        message={message}
        authUser={authUser}
        onOpen={onOpenOptions}
      />
      <MessageTimestamp message={message} authUser={authUser} />
    </div>
  );
};

const TextMessage = ({ message, authUser, onOpenOptions }) => (
  <div className="relative inline-block mb-1 group min-w-[7rem] max-w-[min(90%,28rem)]">
    <p
      className={`message-bubble p-2 pl-3 pr-12 pb-1 pt-2 text-sm ${
        message.senderId === authUser._id
          ? "bg-[var(--sent-bubble)] text-white bubble-sent"
          : "bg-[var(--received-bubble)] text-[var(--text-primary)] bubble-received"
      }`}
    >
      {renderTextWithLinks(message.text)}
    </p>
    <MessageOptionsButton
      message={message}
      authUser={authUser}
      onOpen={onOpenOptions}
    />
    <MessageTimestamp message={message} authUser={authUser} />
  </div>
);

const ChatMessageContent = ({
  message,
  authUser,
  onOpenOptions,
  onOpenPreview,
  getPreviewType,
}) => {
  if (
    Array.isArray(message.deletedFor) &&
    message.deletedFor.includes(authUser._id)
  ) {
    return null;
  }
  if (message.isDeleted) {
    return (
      <DeletedMessage
        message={message}
        authUser={authUser}
        onOpenOptions={onOpenOptions}
      />
    );
  }
  if (message.messageType === "call") {
    return <CallMessage message={message} authUser={authUser} />;
  }
  if (message.image || message.video || message.audio) {
    return (
      <MediaMessage
        message={message}
        authUser={authUser}
        onOpenOptions={onOpenOptions}
        onOpenPreview={onOpenPreview}
      />
    );
  }
  if (message.file?.url) {
    return (
      <FileMessage
        message={message}
        authUser={authUser}
        onOpenOptions={onOpenOptions}
        onOpenPreview={onOpenPreview}
        getPreviewType={getPreviewType}
      />
    );
  }

  const singleLink = getSingleLink(message.text);
  if (singleLink) {
    return (
      <LinkMessage
        message={message}
        authUser={authUser}
        url={singleLink}
        onOpenOptions={onOpenOptions}
      />
    );
  }
  return (
    <TextMessage
      message={message}
      authUser={authUser}
      onOpenOptions={onOpenOptions}
    />
  );
};

export default ChatMessageContent;
