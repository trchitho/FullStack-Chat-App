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
  pendingCandidates: [],
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
    set({
      activeCall: null,
      localStream: null,
      remoteStream: null,
      peerConnection: null,
      pendingCandidates: [],
      timeoutId: null,
    });
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

  flushPendingCandidates: async () => {
    const { peerConnection, pendingCandidates } = get();
    if (!peerConnection?.remoteDescription || !pendingCandidates.length) return;
    for (const candidate of pendingCandidates) {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }
    set({ pendingCandidates: [] });
  },

  startCall: async (recipient, type) => {
    const socket = useAuthStore.getState().socket;
    if (!socket?.connected) return toast.error("Không thể kết nối cuộc gọi");
    const callId = createCallId();
    let media;
    try {
      media = await navigator.mediaDevices.getUserMedia({ audio: true, video: type === "video" });
    } catch {
      toast.error("Vui lòng cho phép truy cập micrô/camera");
      return;
    }
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
    let media;
    try {
      media = await navigator.mediaDevices.getUserMedia({ audio: true, video: call.type === "video" });
    } catch {
      toast.error("Vui lòng cho phép truy cập micrô/camera");
      return;
    }
    const pc = get().createPeerConnection(call.callerId, call.callId);
    media.getTracks().forEach((track) => pc.addTrack(track, media));
    useAuthStore.getState().socket?.emit("callAnswer", { callerId: call.callerId, callId: call.callId, accepted: true });
    set({ incomingCall: null, localStream: media, activeCall: { ...call, direction: "incoming", peer: call.caller, status: "connecting", startedAt: Date.now() } });
  },

  handleRemoteOffer: async ({ callerId, callId, offer }) => {
    const { activeCall, peerConnection } = get();
    if (!activeCall || activeCall.callId !== callId || !peerConnection) return;
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    await get().flushPendingCandidates();
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    useAuthStore.getState().socket?.emit("call:answer", { recipientId: callerId, callId, answer });
    set({ activeCall: { ...activeCall, status: "connected", connectedAt: Date.now() } });
  },

  handleRemoteAnswer: async ({ callId, answer }) => {
    const { activeCall, peerConnection, timeoutId } = get();
    if (!activeCall || activeCall.callId !== callId || !peerConnection) return;
    if (timeoutId) window.clearTimeout(timeoutId);
    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    await get().flushPendingCandidates();
    set({ activeCall: { ...activeCall, status: "connected", connectedAt: Date.now() }, timeoutId: null });
  },

  handleIceCandidate: async ({ callId, candidate }) => {
    const { activeCall, peerConnection } = get();
    if (!activeCall || activeCall.callId !== callId || !peerConnection) return;
    if (!peerConnection.remoteDescription) {
      set({ pendingCandidates: [...get().pendingCandidates, candidate] });
      return;
    }
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  },

  finishCall: async (status = "completed") => {
    const call = get().activeCall;
    if (!call) return;
    const peerId = getCallPeerId(call);
    const duration = Math.max(1, Math.round((Date.now() - (call.connectedAt || call.startedAt || Date.now())) / 1000));
    useAuthStore.getState().socket?.emit("call:end", { recipientId: peerId, callId: call.callId, status, duration });
    if (peerId) {
      await useChatStore.getState().sendCallEvent(peerId, { type: call.type, status, duration });
    }
    get().cleanupCall();
  },

  handleRemoteEnd: async ({ callId, status, duration }) => {
    const { activeCall: call, incomingCall } = get();
    if (incomingCall?.callId === callId) {
      set({ incomingCall: null });
    }
    if (!call || call.callId !== callId) return;
    const peerId = getCallPeerId(call);
    if (peerId && status !== "completed") {
      await useChatStore.getState().sendCallEvent(peerId, { type: call.type, status, duration });
    }
    get().cleanupCall();
  },

  subscribeToCalls: (socket) => {
    if (!socket) return;
    socket.off("incomingCall").on("incomingCall", get().receiveIncomingCall);
    socket.off("callAnswer").on("callAnswer", ({ accepted, callId }) => {
      if (!accepted) {
        toast.error("Cuộc gọi đã bị từ chối");
        get().finishCall("rejected");
        return;
      }
      if (get().activeCall?.callId === callId) get().sendOffer();
    });
    socket.off("call:offline").on("call:offline", () => get().finishCall("unreachable"));
    socket.off("call:offer").on("call:offer", get().handleRemoteOffer);
    socket.off("call:answer").on("call:answer", get().handleRemoteAnswer);
    socket.off("call:ice-candidate").on("call:ice-candidate", get().handleIceCandidate);
    socket.off("call:end").on("call:end", get().handleRemoteEnd);
  },

  unsubscribeFromCalls: (socket) => {
    ["incomingCall", "callAnswer", "call:offline", "call:offer", "call:answer", "call:ice-candidate", "call:end"]
      .forEach((event) => socket?.off(event));
  },
}));
