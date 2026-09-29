import { useEffect } from "react";

const useCallSocketHandlers = ({
  socket,
  callState,
  setCallState,
  setIncomingCall,
  pendingOfferRef,
  callStartTimeRef,
  peerRef,
  bufferedIceCandidatesRef,
  cleanup,
  flushBufferedIceCandidates,
}) => {
  useEffect(() => {
    if (!socket) return;

    const onIncoming = (payload) => {
      setIncomingCall(payload);
      setCallState((state) => (state === "idle" ? "incoming" : state));
    };
    const onAccepted = ({ from }) => {
      const offer = pendingOfferRef.current;
      if (callState !== "outgoing" || !offer) return;
      callStartTimeRef.current = Date.now();
      pendingOfferRef.current = null;
      socket.emit("webrtc:signal", { to: from, signal: offer });
      setCallState("connected");
    };
    const onRejected = () => cleanup();
    const onEnded = () => cleanup();
    const onSignal = async ({ from, signal }) => {
      const peer = peerRef.current;
      try {
        if (signal.sdp && peer) {
          const description = new RTCSessionDescription(signal);
          await peer.setRemoteDescription(description);
          if (signal.type === "offer") {
            const answer = await peer.createAnswer();
            await peer.setLocalDescription(answer);
            socket.emit("webrtc:signal", { to: from, signal: answer });
          }
          flushBufferedIceCandidates();
        } else if (signal.candidate) {
          if (peer?.remoteDescription?.type) {
            await peer.addIceCandidate(new RTCIceCandidate(signal.candidate));
          } else {
            bufferedIceCandidatesRef.current.push(signal.candidate);
          }
        }
      } catch (error) {
        console.error("Signal error:", error);
      }
    };

    socket.on("call:incoming", onIncoming);
    socket.on("call:accepted", onAccepted);
    socket.on("call:rejected", onRejected);
    socket.on("call:ended", onEnded);
    socket.on("webrtc:signal", onSignal);

    return () => {
      socket.off("call:incoming", onIncoming);
      socket.off("call:accepted", onAccepted);
      socket.off("call:rejected", onRejected);
      socket.off("call:ended", onEnded);
      socket.off("webrtc:signal", onSignal);
    };
  }, [
    socket,
    callState,
    setCallState,
    setIncomingCall,
    pendingOfferRef,
    callStartTimeRef,
    peerRef,
    bufferedIceCandidatesRef,
    cleanup,
    flushBufferedIceCandidates,
  ]);
};

export default useCallSocketHandlers;
