import { useContext, useEffect, useState } from "react";
import assets from "../assets/assets";
import { ChatContext } from "../context/chatContext";
import { AuthContext } from "../context/authContext";
import ProfileImageModal from "./ProfileImageModal";
import Avatar from "./Avatar";

const RightSidebar = () => {
  const { selectedUser, messages } = useContext(ChatContext); // Selected user + chat messages
  const { logout, onlineUsers } = useContext(AuthContext); // Auth actions + online status
  const [mediaItems, setMediaItems] = useState([]); // Stores shareable media from the chat
  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    url: "",
    type: "",
    title: "",
  });
  const [profileModal, setProfileModal] = useState({
    isOpen: false, // Controls modal visibility
    imageUrl: "", // Holds the clicked profile image
    userName: "", // Holds the username for modal display
  });

  /**
   * Extract images from messages and update state whenever
   * the message list changes
   */
  useEffect(() => {
    setMediaItems(
      messages
        .filter((msg) => msg.image || msg.video || msg.audio)
        .map((msg) => ({
          id: msg._id,
          url: msg.image || msg.video || msg.audio,
          type: msg.image ? "image" : msg.video ? "video" : "audio",
          title: msg.image
            ? "Image preview"
            : msg.video
              ? "Video preview"
              : "Audio preview",
        })),
    );
  }, [messages]);

  const openMediaPreview = (item) => {
    if (!item?.url) return;
    setPreviewModal({
      isOpen: true,
      url: item.url,
      type: item.type,
      title: item.title,
    });
  };

  const closePreview = () =>
    setPreviewModal({ isOpen: false, url: "", type: "", title: "" });

  return (
    selectedUser && (
      <div
        className={`text-[var(--text-primary)] w-full flex flex-col max-lg:hidden bg-[var(--bg-panel)] border-l border-[var(--border-subtle)] overflow-hidden`}
      >
        {profileModal.isOpen && (
          <ProfileImageModal
            imageUrl={profileModal.imageUrl}
            userName={profileModal.userName}
            onClose={() => setProfileModal({ ...profileModal, isOpen: false })}
          />
        )}
        {previewModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-3xl overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--bg-panel)] shadow-[var(--shadow-modal)]">
              <div className="flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] px-4 py-3 bg-[var(--bg-elevated)]">
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    {previewModal.title}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Opened from this chat
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closePreview}
                  className="rounded-full p-2 hover:bg-[var(--bg-input)] transition-colors"
                  aria-label="Close media preview"
                >
                  ✕
                </button>
              </div>
              <div className="max-h-[80vh] overflow-auto bg-[var(--bg-panel)] p-4">
                {previewModal.type === "image" && (
                  <img
                    src={previewModal.url}
                    alt={previewModal.title}
                    className="mx-auto max-h-[70vh] w-auto rounded-[var(--radius-lg)] object-contain"
                  />
                )}
                {previewModal.type === "video" && (
                  <video
                    controls
                    src={previewModal.url}
                    className="mx-auto w-full max-w-2xl rounded-[var(--radius-lg)]"
                  />
                )}
                {previewModal.type === "audio" && (
                  <audio controls src={previewModal.url} className="w-full" />
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto bg-[var(--bg-elevated)]">
          <div className="pt-10 pb-6 flex flex-col items-center px-6">
            <button
              type="button"
              onClick={() =>
                setProfileModal({
                  isOpen: true,
                  imageUrl: selectedUser?.profilePic || assets.avatar_icon,
                  userName: selectedUser.fullName,
                })
              }
              className="rounded-full mb-4 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--bg-elevated)]"
            >
              <Avatar
                src={selectedUser?.profilePic}
                name={selectedUser.fullName}
                size="2xl"
                online={onlineUsers.includes(selectedUser._id)}
                ring
              />
            </button>
            <h1 className="text-xl font-medium text-[var(--text-primary)] text-center">
              {selectedUser.fullName}
            </h1>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {onlineUsers.includes(selectedUser._id) ? "online" : "offline"}
            </p>
            {selectedUser.bio && (
              <p className="mt-4 text-sm text-[var(--text-secondary)] text-center max-w-[260px]">
                {selectedUser.bio}
              </p>
            )}
          </div>

          <div className="border-t border-[var(--border-subtle)] px-4 py-4">
            <p className="text-sm text-[var(--text-muted)] mb-3 px-2">
              Media, links and docs
            </p>
            <div className="grid grid-cols-2 gap-2 max-h-[240px] overflow-y-auto">
              {mediaItems.length ? (
                mediaItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => openMediaPreview(item)}
                    className="aspect-square rounded-[var(--radius-md)] overflow-hidden border border-[var(--border-subtle)] hover:opacity-90 transition-opacity focus:ring-2 focus:ring-[var(--accent)] focus:outline-none"
                  >
                    {item.type === "image" ? (
                      <img
                        src={item.url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-[var(--bg-input)] text-[var(--text-secondary)] text-sm font-medium">
                        {item.type === "video" ? "VIDEO" : "AUDIO"}
                      </div>
                    )}
                  </button>
                ))
              ) : (
                <p className="col-span-2 rounded-[var(--radius-md)] border border-dashed border-[var(--border-subtle)] bg-[var(--bg-input)] px-3 py-4 text-sm text-[var(--text-secondary)]">
                  No media shared yet.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={() => logout()}
            className="w-full py-2.5 rounded-[var(--radius-md)] bg-[var(--bg-input)] hover:bg-[var(--bg-elevated)] text-sm text-[var(--text-primary)] transition-colors border border-[var(--border-subtle)]"
          >
            Log out
          </button>
        </div>
      </div>
    )
  );
};

export default RightSidebar;
