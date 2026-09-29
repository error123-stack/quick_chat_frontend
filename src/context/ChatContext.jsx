import { useContext, useEffect, useState, useCallback, useMemo } from "react";
import { AuthContext } from "./authContext";
import { ChatContext } from "./chatContext";
import toast from "react-hot-toast";
import useChatSocketEvents from "../hooks/useChatSocketEvents";

// ✅ Context for managing chat-related state & actions globally
const publicUserEquals = (a, b) => {
  if (!a || !b) return a === b;
  return (
    a._id === b._id &&
    a.fullName === b.fullName &&
    a.email === b.email &&
    (a.profilePic || "") === (b.profilePic || "") &&
    (a.bio || "") === (b.bio || "") &&
    (a.authProvider || "local") === (b.authProvider || "local")
  );
};

export const ChatProvider = ({ children }) => {
  // State for messages, users list, selected chat, unseen messages count
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});

  // Get socket, axios, and authUser from AuthContext
  const { socket, axios, authUser, onlineUsers } = useContext(AuthContext);

  // ✅ Fetch all users for sidebar (with unseen messages count)
  const getUsers = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers((prev) => {
          const incoming = data.users || [];
          if (
            prev.length === incoming.length &&
            prev.every((p) => {
              const q = incoming.find((x) => x._id === p._id);
              return q && publicUserEquals(p, q);
            })
          ) {
            return prev;
          }
          return incoming;
        });
        setUnseenMessages(data.unseenMessages || {});
      }
    } catch (error) {
      if (error?.code !== "ERR_CANCELED") toast.error(error.message);
    }
  }, [axios]);

  // ✅ Force-refresh the users list (exposed to consumers)
  const refreshUsers = useCallback(async () => {
    await getUsers();
  }, [getUsers]);

  // ✅ Fetch messages for the currently selected user
  const getMessages = useCallback(
    async (userId) => {
      try {
        const { data } = await axios.get(`/api/messages/${userId}`);
        if (data.success) {
          setMessages(data.messages);
        }
      } catch (error) {
        toast.error(error.message);
      }
    },
    [axios],
  );

  // ✅ Send a new message to the selected user
  const sendMessage = useCallback(
    async (messageData) => {
      if (!selectedUser?._id) {
        return { success: false, message: "Select a chat first" };
      }

      try {
        const { data } = await axios.post(
          `/api/messages/send/${selectedUser._id}`,
          messageData,
        );
        if (data.success) {
          // append new message to local state
          setMessages((prevMessages) => [...prevMessages, data.newMessage]);
          return {
            success: true,
            message: data.message,
            newMessage: data.newMessage,
          };
        } else {
          toast.error(data.message);
          return { success: false, message: data.message };
        }
      } catch (error) {
        toast.error(error.message);
        return { success: false, message: error.message };
      }
    },
    [selectedUser, axios],
  );

  const sendAudioMessage = useCallback(
    async (audioBlob) => {
      if (!selectedUser?._id) {
        return { success: false, message: "Select a chat first" };
      }
      if (!audioBlob) {
        return { success: false, message: "No audio recorded" };
      }

      try {
        const formData = new FormData();
        formData.append("audio", audioBlob, `voice-${Date.now()}.webm`);

        const { data } = await axios.post(
          `/api/messages/send-audio/${selectedUser._id}`,
          formData,
        );

        if (data.success) {
          const newMessage = data.newMessage || data.data;
          if (newMessage) {
            setMessages((prevMessages) => [...prevMessages, newMessage]);
          }
          return { success: true, message: data.message, newMessage };
        }

        toast.error(data.message);
        return { success: false, message: data.message };
      } catch (error) {
        toast.error(error.message);
        return { success: false, message: error.message };
      }
    },
    [selectedUser, axios],
  );

  const selectedUserId = selectedUser?._id;
  useChatSocketEvents({
    socket,
    selectedUserId,
    authUserId: authUser?._id,
    axios,
    setMessages,
    setUnseenMessages,
    setUsers,
    setSelectedUser,
  });

  // ✅ Delete message (for self or everyone)
  const deleteMessage = useCallback(
    async (messageId, deleteFor) => {
      try {
        const { data } = await axios.delete(
          `/api/messages/delete/${messageId}`,
          {
            data: { deleteFor },
          },
        );

        if (data.success) {
          const currentUserId = authUser?._id || null;

          if (deleteFor === "everyone") {
            // Mark as deleted for all users
            setMessages((prev) =>
              prev.map((msg) =>
                msg._id === messageId ? { ...msg, isDeleted: true } : msg,
              ),
            );
          } else {
            // Delete only for current user (track in deletedFor array)
            setMessages((prev) =>
              prev.map((msg) => {
                if (msg._id !== messageId) return msg;
                const prevDeleted = Array.isArray(msg.deletedFor)
                  ? msg.deletedFor
                  : [];
                const newDeleted = currentUserId
                  ? Array.from(new Set([...prevDeleted, currentUserId]))
                  : prevDeleted;
                return { ...msg, deletedFor: newDeleted };
              }),
            );
          }

          toast.success(data.message);
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error(error.message);
      }
    },
    [axios, authUser],
  );

  // ✅ Fetch users the moment authentication becomes available (fixes
  //   "sidebar blank until refresh" when Sidebar mounts before JWT ready)
  useEffect(() => {
    if (!authUser?._id) return;
    getUsers();
  }, [authUser?._id, getUsers]);

  // ✅ Keep sidebar in sync when online-users gains new IDs we haven't
  //   cached yet (catches any user who just connected + maybe got missed)
  useEffect(() => {
    if (!Array.isArray(onlineUsers) || onlineUsers.length === 0) return;
    const currentIds = new Set(users.map((u) => String(u._id)));
    const hasNewUnknown = onlineUsers.some(
      (id) =>
        String(id) !== String(authUser?._id || "") &&
        !currentIds.has(String(id)),
    );
    if (!hasNewUnknown) return;
    getUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onlineUsers]);

  // ✅ Add a call log message to current chat (used by CallContext after saving)
  const addCallLogMessage = useCallback(
    (newMessage) => {
      if (
        !selectedUser ||
        !newMessage ||
        (newMessage.senderId !== selectedUser._id &&
          newMessage.receiverId !== selectedUser._id)
      )
        return;
      setMessages((prev) => {
        if (prev.some((m) => m._id === newMessage._id)) return prev;
        return [...prev, newMessage];
      });
    },
    [selectedUser],
  );

  const value = useMemo(
    () => ({
      messages,
      users,
      selectedUser,
      getUsers,
      refreshUsers,
      getMessages,
      sendMessage,
      sendAudioMessage,
      deleteMessage,
      setSelectedUser,
      unseenMessages,
      setUnseenMessages,
      addCallLogMessage,
    }),
    [
      messages,
      users,
      selectedUser,
      getUsers,
      refreshUsers,
      getMessages,
      sendMessage,
      sendAudioMessage,
      deleteMessage,
      unseenMessages,
      addCallLogMessage,
    ],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
