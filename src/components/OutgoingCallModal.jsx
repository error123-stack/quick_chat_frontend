import { useContext } from "react";
import { CallContext } from "../context/callContext";

export default function OutgoingCallModal() {
  const { remoteUser, callType, endCall } = useContext(CallContext);
  if (!remoteUser) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-2xl p-8 max-w-sm w-full text-center shadow-xl">
        <p className="text-[var(--text-muted)] text-sm mb-1">
          {callType === "video" ? "Video" : "Audio"} calling…
        </p>
        <p className="text-xl font-semibold text-[var(--text-primary)] mb-6">
          {remoteUser.fullName}
        </p>
        <button
          type="button"
          onClick={endCall}
          className="w-full py-3 px-4 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 font-medium transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
