import { useContext, useEffect, useRef } from "react";
import { CallContext } from "../context/callContext";

export default function InCallScreen() {
  const {
    remoteUser,
    callType,
    localStream,
    remoteStream,
    isMuted,
    endCall,
    toggleMute,
  } = useContext(CallContext);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (remoteAudioRef.current && remoteStream && callType === "audio") {
      remoteAudioRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, callType]);

  if (!remoteUser) return null;

  const isVideo = callType === "video";

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[var(--bg-app)]">
      {/* Remote audio: must be in DOM for audio calls so you can hear the other person */}
      {!isVideo && <audio ref={remoteAudioRef} autoPlay />}

      {/* Remote stream (full screen for video, or just label for audio) */}
      <div className="flex-1 relative min-h-0 flex items-center justify-center bg-[var(--bg-panel)]">
        {isVideo ? (
          <>
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            />
            {!remoteStream && (
              <p className="absolute text-[var(--text-muted)]">
                Waiting for {remoteUser.fullName}…
              </p>
            )}
          </>
        ) : (
          <div className="text-center">
            <p className="text-[var(--text-primary)] text-lg font-medium">
              {remoteUser.fullName}
            </p>
            <p className="text-[var(--text-secondary)] text-sm mt-1">
              Audio call in progress
            </p>
          </div>
        )}

        {/* Local video (picture-in-picture for video call) */}
        {isVideo && localStream && (
          <div className="absolute bottom-24 right-4 w-32 h-40 rounded-xl overflow-hidden border-2 border-[var(--border-subtle)] shadow-xl">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="shrink-0 flex items-center justify-center gap-4 py-6 bg-[var(--bg-elevated)] border-t border-[var(--border-subtle)]">
        <button
          type="button"
          onClick={toggleMute}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
            isMuted
              ? "bg-red-500/30 text-red-400"
              : "bg-[var(--bg-input)] text-[var(--text-primary)] hover:bg-[var(--border-default)]"
          }`}
          title={isMuted ? "Unmute" : "Mute"}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isMuted ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
              />
            )}
          </svg>
        </button>
        <button
          type="button"
          onClick={endCall}
          className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white transition-colors"
          title="End call"
        >
          <svg
            className="w-7 h-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
