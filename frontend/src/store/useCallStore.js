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
}));
