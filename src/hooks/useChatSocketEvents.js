import { useEffect } from "react";

const useChatSocketEvents = ({
  socket,
  selectedUserId,
  authUserId,
  axios,
  setMessages,
  setUnseenMessages,
  setUsers,
  setSelectedUser,
}) => {
  useEffect(() => {
    if (!socket) return;

    const onNewMessage = (newMessage) => {
      const isForSelectedChat =
        selectedUserId &&
        (newMessage.senderId === selectedUserId ||
          newMessage.receiverId === selectedUserId);
      if (isForSelectedChat) {
        const messageForChat = { ...newMessage, seen: true };
        if (newMessage.messageType !== "call") {
          axios.put(`/api/messages/mark/${newMessage._id}`);
        }
        setMessages((prev) => {
          if (prev.some((message) => message._id === messageForChat._id)) {
            return prev;
          }
          return [...prev, messageForChat];
        });
      } else if (newMessage.messageType !== "call") {
        setUnseenMessages((prev) => ({
          ...prev,
          [newMessage.senderId]: prev[newMessage.senderId]
            ? prev[newMessage.senderId] + 1
            : 1,
        }));
      }
    };

    const onMessageSeen = ({ messageId }) => {
      setMessages((prev) =>
        prev.map((message) =>
          message._id === messageId ? { ...message, seen: true } : message,
        ),
      );
    };

    const onMessagesSeen = ({ messageIds }) => {
      if (!Array.isArray(messageIds)) return;
      const seenMessageIds = new Set(messageIds);
      setMessages((prev) =>
        prev.map((message) =>
          seenMessageIds.has(message._id)
            ? { ...message, seen: true }
            : message,
        ),
      );
    };

    const onMessageDeleted = ({ messageId }) => {
      setMessages((prev) =>
        prev.map((message) =>
          message._id === messageId ? { ...message, isDeleted: true } : message,
        ),
      );
    };

    const onNewUser = (newUser) => {
      if (!newUser?._id || String(newUser._id) === String(authUserId || "")) {
        return;
      }
      setUsers((prev) => {
        const exists = prev.some(
          (user) => String(user._id) === String(newUser._id),
        );
        if (exists) {
          return prev.map((user) =>
            String(user._id) === String(newUser._id)
              ? { ...user, ...newUser }
              : user,
          );
        }
        return [newUser, ...prev];
      });
    };

    const onUserUpdated = (updatedUser) => {
      if (!updatedUser?._id) return;
      setUsers((prev) =>
        prev.map((user) =>
          String(user._id) === String(updatedUser._id)
            ? { ...user, ...updatedUser }
            : user,
        ),
      );
      setSelectedUser((prev) =>
        prev && String(prev._id) === String(updatedUser._id)
          ? { ...prev, ...updatedUser }
          : prev,
      );
    };

    socket.on("newMessage", onNewMessage);
    socket.on("messageSeen", onMessageSeen);
    socket.on("messagesSeen", onMessagesSeen);
    socket.on("messageDeleted", onMessageDeleted);
    socket.on("newUserRegistered", onNewUser);
    socket.on("userUpdated", onUserUpdated);

    return () => {
      socket.off("newMessage", onNewMessage);
      socket.off("messageSeen", onMessageSeen);
      socket.off("messagesSeen", onMessagesSeen);
      socket.off("messageDeleted", onMessageDeleted);
      socket.off("newUserRegistered", onNewUser);
      socket.off("userUpdated", onUserUpdated);
    };
  }, [
    socket,
    selectedUserId,
    authUserId,
    axios,
    setMessages,
    setUnseenMessages,
    setUsers,
    setSelectedUser,
  ]);
};

export default useChatSocketEvents;
