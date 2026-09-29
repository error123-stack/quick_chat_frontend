import { Fragment } from "react";
import MessageOptions from "./MessageOptions";
import ChatMessageContent from "./ChatMessageContent";

const toLabel = (date) => {
  const value = new Date(date);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const sameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(value, today)) return "Today";
  if (sameDay(value, yesterday)) return "Yesterday";
  return value.toLocaleDateString("en-GB");
};

const ChatMessageList = ({
  messages,
  authUser,
  messagesRef,
  scrollEnd,
  currentDateLabel,
  messageOptionsState,
  onOpenOptions,
  onCloseOptions,
  onOpenPreview,
  getPreviewType,
}) => (
  <div
    ref={messagesRef}
    className="flex-1 min-h-0 flex flex-col overflow-y-auto px-3 py-1 chat-wallpaper messages-scroll"
  >
    <div className="sticky top-0 z-10 flex justify-center pointer-events-none py-2">
      {currentDateLabel && (
        <span className="date-chip text-xs">{currentDateLabel}</span>
      )}
    </div>
    {messages.map((message, index) => {
      const showDate =
        index === 0 ||
        new Date(messages[index - 1].createdAt).toDateString() !==
          new Date(message.createdAt).toDateString();
      const dateLabel = toLabel(message.createdAt);
      const isOwnMessage = message.senderId === authUser._id;

      return (
        <Fragment key={message._id}>
          {showDate && (
            <div
              className="date-marker w-full flex justify-center my-4"
              data-date-label={dateLabel}
            >
              {currentDateLabel !== dateLabel && (
                <span className="date-chip text-xs">{dateLabel}</span>
              )}
            </div>
          )}
          <div
            className={`w-full flex items-end gap-2 ${
              isOwnMessage ? "justify-end" : "justify-start"
            }`}
          >
            <div className="relative inline-block">
              {messageOptionsState.isOpen &&
                messageOptionsState.messageId === message._id && (
                  <MessageOptions
                    messageId={message._id}
                    isOwnMessage={isOwnMessage}
                    position={isOwnMessage ? "right" : "left"}
                    onClose={onCloseOptions}
                  />
                )}
              <ChatMessageContent
                message={message}
                authUser={authUser}
                onOpenOptions={onOpenOptions}
                onOpenPreview={onOpenPreview}
                getPreviewType={getPreviewType}
              />
            </div>
          </div>
        </Fragment>
      );
    })}
    <div ref={scrollEnd} />
  </div>
);

export default ChatMessageList;
