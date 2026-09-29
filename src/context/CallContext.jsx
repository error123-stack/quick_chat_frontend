import { useContext, useRef, useState, useCallback, useMemo } from "react";
import { AuthContext } from "./authContext";
import { ChatContext } from "./chatContext";
import { CallContext } from "./callContext";
import useCallSocketHandlers from "../hooks/useCallSocketHandlers";

const defaultConstraints = { audio: true, video: true };
const audioOnlyConstraints = { audio: true, video: false };

export function CallProvider({ children }) {
  const { authUser, socket, axios } = useContext(AuthContext);
  const { addCallLogMessage } = useContext(ChatContext);
  const [callState, setCallState] = useState("idle");
  const [callType, setCallType] = useState("audio");
  const [remoteUser, setRemoteUser] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);

  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const pendingOfferRef = useRef(null);
  const remoteIdRef = useRef(null);
  const callStartTimeRef = useRef(null);
  const wasCallerRef = useRef(false);
  const callTypeRef = useRef("audio");
  const bufferedIceCandidatesRef = useRef([]);

  const cleanup = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    setLocalStream(null);
    setRemoteStream(null);
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    pendingOfferRef.current = null;
    remoteIdRef.current = null;
    bufferedIceCandidatesRef.current = [];
    setCallState("idle");
    setRemoteUser(null);
    setIncomingCall(null);
  }, []);

  const createPeer = useCallback(
    (isInitiator, remoteId, stream) => {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.ontrack = (e) => {
        setRemoteStream(e.streams[0]);
      };

      pc.onicecandidate = (e) => {
        if (e.candidate && socket) {
          socket.emit("webrtc:signal", {
            to: remoteId,
            signal: { candidate: e.candidate },
          });
        }
      };

      pc.onconnectionstatechange = () => {
        if (
          pc.connectionState === "failed" ||
          pc.connectionState === "closed"
        ) {
          cleanup();
        }
      };

      peerRef.current = pc;
      return pc;
    },
    [socket, cleanup],
  );

  const flushBufferedIceCandidates = useCallback(async () => {
    const pc = peerRef.current;
    if (!pc || !pc.remoteDescription || !pc.remoteDescription.type) return;
    const buffer = bufferedIceCandidatesRef.current;
    if (!buffer.length) return;
    bufferedIceCandidatesRef.current = [];
    await Promise.all(
      buffer.map(async (candidate) => {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.warn("Flush ICE candidate error:", err);
        }
      }),
    );
  }, []);

  const saveCallLog = useCallback(
    async (otherUserId, type, status, duration, wasCaller) => {
      if (!axios || !otherUserId) return;
      try {
        const { data } = await axios.post("/api/messages/call-log", {
          otherUserId,
          callType: type,
          callStatus: status,
          callDuration: duration,
          wasCaller,
        });
        if (data?.success && data.newMessage && addCallLogMessage) {
          addCallLogMessage(data.newMessage);
        }
      } catch (err) {
        console.error("Save call log error:", err);
      }
    },
    [axios, addCallLogMessage],
  );

  const startCall = useCallback(
    async (user, type = "video") => {
      if (!socket || !authUser || !user) return;
      wasCallerRef.current = true;
      callTypeRef.current = type;
      setRemoteUser(user);
      setCallType(type);
      setCallState("outgoing");
      remoteIdRef.current = user._id;

      try {
        const constraints =
          type === "audio" ? audioOnlyConstraints : defaultConstraints;
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        localStreamRef.current = stream;
        setLocalStream(stream);

        const pc = createPeer(true, user._id, stream);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        pendingOfferRef.current = offer;
        socket.emit("call:request", {
          to: user._id,
          type,
          callerName: authUser.fullName,
        });
      } catch (err) {
        console.error("Start call error:", err);
        cleanup();
      }
    },
    [authUser, socket, createPeer, cleanup],
  );

  const acceptCall = useCallback(async () => {
    if (!socket || !authUser || !incomingCall) return;
    const { from: fromId, type } = incomingCall;
    wasCallerRef.current = false;
    callTypeRef.current = type || "video";
    remoteIdRef.current = fromId;
    setCallType(type || "video");
    setIncomingCall(null);
    setRemoteUser({ _id: fromId, fullName: incomingCall.callerName });

    try {
      const constraints =
        type === "audio" ? audioOnlyConstraints : defaultConstraints;
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      setLocalStream(stream);
      createPeer(false, fromId, stream);
      callStartTimeRef.current = Date.now();
      setCallState("connected");
      socket.emit("call:accept", { to: fromId });
    } catch (err) {
      console.error("Accept call error:", err);
      socket.emit("call:reject", { to: fromId });
      cleanup();
    }
  }, [authUser, socket, incomingCall, createPeer, cleanup]);

  const rejectCall = useCallback(() => {
    if (incomingCall) {
      saveCallLog(
        incomingCall.from,
        incomingCall.type || "video",
        "missed",
        0,
        false,
      );
      if (socket) socket.emit("call:reject", { to: incomingCall.from });
    }
    setIncomingCall(null);
    setCallState("idle");
  }, [socket, incomingCall, saveCallLog]);

  const endCall = useCallback(() => {
    const rid = remoteUser?._id || remoteIdRef.current;
    const duration = callStartTimeRef.current
      ? Math.floor((Date.now() - callStartTimeRef.current) / 1000)
      : 0;
    if (rid) {
      saveCallLog(
        rid,
        callTypeRef.current,
        callState === "connected" ? "answered" : "missed",
        duration,
        wasCallerRef.current,
      );
      if (socket) socket.emit("call:end", { to: rid });
    }
    cleanup();
  }, [socket, remoteUser, callState, saveCallLog, cleanup]);

  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  }, []);

  useCallSocketHandlers({
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
  });

  const value = useMemo(
    () => ({
      callState,
      callType,
      remoteUser,
      incomingCall,
      localStream,
      remoteStream,
      isMuted,
      startCall,
      acceptCall,
      rejectCall,
      endCall,
      toggleMute,
    }),
    [
      callState,
      callType,
      remoteUser,
      incomingCall,
      localStream,
      remoteStream,
      isMuted,
      startCall,
      acceptCall,
      rejectCall,
      endCall,
      toggleMute,
    ],
  );

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
}
