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

  startCall: async (recipient, type) => {
    const socket = useAuthStore.getState().socket;
    if (!socket?.connected) return toast.error("Không thể kết nối cuộc gọi");
    const callId = createCallId();
    const media = await navigator.mediaDevices.getUserMedia({ audio: true, video: type === "video" });
    const pc = get().createPeerConnection(recipient._id, callId);
    media.getTracks().forEach((track) => pc.addTrack(track, media));
    const localVideo = get().localVideoRef?.current;
    if (localVideo) localVideo.srcObject = media;
    const timeoutId = window.setTimeout(() => get().finishCall("no_answer"), CALL_TIMEOUT_MS);
    set({
      localStream: media,
      timeoutId,
      activeCall: { callId, type, direction: "outgoing", recipientId: recipient._id, peer: recipient, status: "calling", startedAt: Date.now() },
    });
    socket.emit("callInvite", { recipientId: recipient._id, type, callId });
  },

  sendOffer: async () => {
    const { activeCall, peerConnection } = get();
    const socket = useAuthStore.getState().socket;
    if (!activeCall || !peerConnection) return;
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket?.emit("call:offer", { recipientId: activeCall.recipientId, callId: activeCall.callId, offer });
  },

  receiveIncomingCall: (call) => {
    if (String(call.callerId) === String(useAuthStore.getState().authUser?._id)) return;
    set({ incomingCall: call });
  },

  rejectIncomingCall: () => {
    const call = get().incomingCall;
    if (call?.callerId) {
      useAuthStore.getState().socket?.emit("callAnswer", { callerId: call.callerId, callId: call.callId, accepted: false });
    }
    set({ incomingCall: null });
  },

  acceptIncomingCall: async () => {
    const call = get().incomingCall;
    if (!call?.callerId) return;
    const media = await navigator.mediaDevices.getUserMedia({ audio: true, video: call.type === "video" });
    const pc = get().createPeerConnection(call.callerId, call.callId);
    media.getTracks().forEach((track) => pc.addTrack(track, media));
    useAuthStore.getState().socket?.emit("callAnswer", { callerId: call.callerId, callId: call.callId, accepted: true });
    set({ incomingCall: null, localStream: media, activeCall: { ...call, direction: "incoming", peer: call.caller, status: "connecting", startedAt: Date.now() } });
  },
}));
