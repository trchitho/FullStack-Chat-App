import { MessageCircle, Search, UserCheck, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useChatStore } from "../store/useChatStore";
import { useSocialStore } from "../store/useSocialStore";

const ContactsPage = () => {
  const navigate = useNavigate();
  const { setSelectedUser } = useChatStore();
  const {
    friends, friendRequests, getFriends, getFriendRequests, respondToFriendRequest,
  } = useSocialStore();
  const [query, setQuery] = useState("");

  useEffect(() => {
    getFriends();
    getFriendRequests();
  }, [getFriendRequests, getFriends]);

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return friends.filter((friend) =>
      !search || `${friend.fullName} ${friend.username || ""}`.toLowerCase().includes(search)
    );
  }, [friends, query]);

  const openChat = (friend) => {
    setSelectedUser(friend);
    navigate("/");
  };
