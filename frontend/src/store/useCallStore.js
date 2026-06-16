import { create } from "zustand";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";
import { useChatStore } from "./useChatStore";

const ICE_SERVERS = [{ urls: "stun:stun.l.google.com:19302" }];
const CALL_TIMEOUT_MS = 15000;

const createCallId = () =>
  `call-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const stopStream = (stream) => {
  stream?.getTracks().forEach((track) => track.stop());
};

const getCallPeerId = (call) =>
  call?.direction === "incoming" ? call.callerId : call?.recipientId;

export const useCallStore = create((set, get) => ({
  activeCall: null,
  incomingCall: null,
  localStream: null,
  remoteStream: null,
  peerConnection: null,
  timeoutId: null,
  localVideoRef: null,
  remoteVideoRef: null,

  attachVideoRefs: (localVideoRef, remoteVideoRef) => {
    const { localStream, remoteStream } = get();
    set({ localVideoRef, remoteVideoRef });
    if (localVideoRef?.current) localVideoRef.current.srcObject = localStream;
    if (remoteVideoRef?.current) remoteVideoRef.current.srcObject = remoteStream;
  },

  cleanupCall: () => {
    const { peerConnection, localStream, timeoutId } = get();
    if (timeoutId) window.clearTimeout(timeoutId);
    peerConnection?.close();
    stopStream(localStream);
    set({ activeCall: null, localStream: null, remoteStream: null, peerConnection: null, timeoutId: null });
  },

  createPeerConnection: (peerId, callId) => {
    const socket = useAuthStore.getState().socket;
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    const remoteStream = new MediaStream();
    pc.ontrack = (event) => {
      event.streams[0]?.getTracks().forEach((track) => remoteStream.addTrack(track));
      const remoteVideo = get().remoteVideoRef?.current;
      if (remoteVideo) remoteVideo.srcObject = remoteStream;
      set({ remoteStream });
    };
    pc.onicecandidate = (event) => {
      if (event.candidate) socket?.emit("call:ice-candidate", { recipientId: peerId, callId, candidate: event.candidate });
    };
    set({ peerConnection: pc, remoteStream });
    return pc;
  },
}));
