import { useContext, useEffect, useMemo, useRef, useState } from "react";
import assets from "../assets/assets";
import { extractUrls } from "../lib/utils";
import { ChatContext } from "../context/chatContext";
import { AuthContext } from "../context/authContext";
import { CallContext } from "../context/callContext";
import toast from "react-hot-toast";
import ProfileImageModal from "./ProfileImageModal";
import ChatMediaPreview from "./ChatMediaPreview";
import SharedMediaModal from "./SharedMediaModal";
import ChatComposer from "./ChatComposer";
import ChatHeader from "./ChatHeader";
import ChatMessageList from "./ChatMessageList";
import useVoiceRecorder from "../hooks/useVoiceRecorder";

const MAX_ATTACHMENT_SIZE_BYTES = 50 * 1024 * 1024;

const ChatContainer = () => {
  // Extract data and functions from Chat context
  const {
    messages,
    selectedUser,
    setSelectedUser,
    sendMessage,
    sendAudioMessage,
    getMessages,
  } = useContext(ChatContext);

  // Extract user-related data from Auth context
  const { authUser, onlineUsers } = useContext(AuthContext);
  const { startCall } = useContext(CallContext);
  const { isRecording, toggleRecording } = useVoiceRecorder(sendAudioMessage);

  // Reference for auto-scrolling chat to bottom
  const scrollEnd = useRef();
  const messagesRef = useRef();

  // Local state for input field, emoji picker, and modals
  const [input, setInput] = useState("");
  const [profileModal, setProfileModal] = useState({
    isOpen: false,
    imageUrl: "",
    userName: "",
  });
  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    url: "",
    type: "",
    title: "",
  });
  const [messageOptionsState, setMessageOptionsState] = useState({
    isOpen: false,
    messageId: null,
    isOwnMessage: false,
  });
  const getPreviewType = (file) => {
    const mimeType = String(file?.mimeType || "").toLowerCase();
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    if (mimeType.startsWith("audio/")) return "audio";
    if (mimeType.includes("pdf")) return "pdf";
    return "file";
  };

  const openPreview = (url, type, title) => {
    if (!url) return;
    setPreviewModal({ isOpen: true, url, type, title });
  };

  const openMediaPreview = (msg) => {
    const url = msg?.image || msg?.video || msg?.audio;
    if (!url) return;

    const type = msg?.image ? "image" : msg?.video ? "video" : "audio";
    const title = msg?.image
      ? "Image preview"
      : msg?.video
        ? "Video preview"
        : "Audio preview";

    openPreview(url, type, title);
  };

  const closePreview = () =>
    setPreviewModal({ isOpen: false, url: "", type: "", title: "" });

  const [showSharedDocs, setShowSharedDocs] = useState(false);
  const [currentDateLabel, setCurrentDateLabel] = useState("");
  const hasMessageText = input.trim().length > 0;
  const sharedMedia = useMemo(
    () => messages.filter((msg) => msg.image || msg.video || msg.audio),
    [messages],
  );
  const sharedFiles = useMemo(
    () => messages.filter((msg) => msg.file?.url),
    [messages],
  );
  const sharedLinks = useMemo(
    () =>
      messages
        .flatMap((msg) =>
          [...new Set(extractUrls(msg.text))].map((url) => ({
            messageId: msg._id,
            url,
            senderId: msg.senderId,
            createdAt: msg.createdAt,
          })),
        )
        .filter((item) => item.url),
    [messages],
  );
  /**
   * Send a text message
   */
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return null; // ignore empty input
    await sendMessage({ text: input.trim() });
    setInput(""); // clear input after sending
  };

  const sendAttachmentFile = async (file) => {
    if (!file) return;

    if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
      toast.error("Attachment is too large (max 50MB)");
      return;
    }

    const formData = new FormData();
    formData.append("attachment", file);

    const toastId = toast.loading(`Uploading ${file.name}...`);
    const result = await sendMessage(formData);
    toast.dismiss(toastId);

    if (result?.success) {
      toast.success(`${file.name} sent`);
    }
  };

  const handleSendAttachment = async (e) => {
    const file = e.target.files?.[0];
    await sendAttachmentFile(file);
    e.target.value = "";
  };

  /**
   * Fetch messages when a user is selected
   */
  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser, getMessages]);

  /**
   * Auto-scroll to the bottom whenever messages update
   */
  useEffect(() => {
    if (scrollEnd.current && messages) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    const container = messagesRef.current;
    if (!container) return;
    const update = () => {
      const markers = Array.from(
        container.getElementsByClassName("date-marker"),
      );
      const contRect = container.getBoundingClientRect();
      let label = markers.length ? markers[0].dataset.dateLabel : "";
      for (let i = 0; i < markers.length; i++) {
        const r = markers[i].getBoundingClientRect();
        if (r.top - contRect.top <= 16) label = markers[i].dataset.dateLabel;
        else break;
      }
      setCurrentDateLabel(label);
    };
    update();
    container.addEventListener("scroll", update, { passive: true });
    return () => container.removeEventListener("scroll", update);
  }, [messages]);

  const openMessageOptions = (
    message,
    isOwnMessage = message.senderId === authUser._id,
  ) => {
    setMessageOptionsState({
      isOpen: true,
      messageId: message._id,
      isOwnMessage,
    });
  };

  const closeMessageOptions = () => {
    setMessageOptionsState({
      isOpen: false,
      messageId: null,
      isOwnMessage: false,
    });
  };

  return selectedUser ? (
    <div className="h-full min-h-0 relative flex flex-col bg-[var(--bg-panel)] max-md:fixed max-md:inset-0 max-md:z-30">
      {/* ---------------- Profile Image Modal ---------------- */}
      {profileModal.isOpen && (
        <ProfileImageModal
          imageUrl={profileModal.imageUrl}
          userName={profileModal.userName}
          onClose={() => setProfileModal({ ...profileModal, isOpen: false })}
        />
      )}
      <ChatMediaPreview preview={previewModal} onClose={closePreview} />

      <ChatHeader
        selectedUser={selectedUser}
        online={onlineUsers.includes(selectedUser._id)}
        onBack={() => setSelectedUser(null)}
        onProfileOpen={() =>
          setProfileModal({
            isOpen: true,
            imageUrl: selectedUser.profilePic || assets.avatar_icon,
            userName: selectedUser.fullName,
          })
        }
        onStartCall={(type) => startCall(selectedUser, type)}
        onOpenSharedMedia={() => setShowSharedDocs(true)}
      />

      {/* Messages area - balanced padding; bubbles use more width for readable lines */}
      <SharedMediaModal
        isOpen={showSharedDocs}
        sharedMedia={sharedMedia}
        sharedFiles={sharedFiles}
        sharedLinks={sharedLinks}
        onClose={() => setShowSharedDocs(false)}
        onMediaPreview={openMediaPreview}
      />
      <ChatMessageList
        messages={messages}
        authUser={authUser}
        messagesRef={messagesRef}
        scrollEnd={scrollEnd}
        currentDateLabel={currentDateLabel}
        messageOptionsState={messageOptionsState}
        onOpenOptions={openMessageOptions}
        onCloseOptions={closeMessageOptions}
        onOpenPreview={openPreview}
        getPreviewType={getPreviewType}
      />

      <ChatComposer
        input={input}
        setInput={setInput}
        hasMessageText={hasMessageText}
        isRecording={isRecording}
        onSendAttachment={handleSendAttachment}
        onToggleRecording={toggleRecording}
        onSendMessage={handleSendMessage}
        onEmojiClick={(emojiData) =>
          setInput((currentInput) => currentInput + emojiData.emoji)
        }
      />
    </div>
  ) : (
    <div className="hidden md:flex flex-col items-center justify-center gap-6 bg-[var(--bg-app)] chat-wallpaper px-6 min-h-0 h-full">
      <div className="w-24 h-24 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center">
        <img src={assets.logo_icon} className="w-14 h-14 opacity-70" alt="" />
      </div>
      <div className="text-center max-w-sm">
        <p className="text-lg font-medium text-[var(--text-primary)]">
          Chat anytime, anywhere
        </p>
        <p className="text-sm text-[var(--text-muted)] mt-2 leading-relaxed">
          Select a conversation from the sidebar or search for someone to start
          messaging
        </p>
      </div>
    </div>
  );
};

export default ChatContainer;
