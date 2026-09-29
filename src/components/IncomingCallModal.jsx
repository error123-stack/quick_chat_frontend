import { useContext } from "react";
import { CallContext } from "../context/callContext";

export default function IncomingCallModal() {
  const { incomingCall, acceptCall, rejectCall } = useContext(CallContext);
  if (!incomingCall) return null;

  const isVideo = incomingCall.type === "video";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-2xl p-8 max-w-sm w-full text-center shadow-xl">
        <p className="text-[var(--text-muted)] text-sm mb-1">
          {isVideo ? "Video" : "Audio"} call from
        </p>
        <p className="text-xl font-semibold text-[var(--text-primary)] mb-6">
          {incomingCall.callerName}
        </p>
        <div className="flex gap-4 justify-center">
          <button
            type="button"
            onClick={rejectCall}
            className="flex-1 py-3 px-4 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 font-medium transition-colors"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={acceptCall}
            className="flex-1 py-3 px-4 rounded-xl bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] font-medium transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
