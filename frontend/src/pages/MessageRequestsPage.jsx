import { ArrowLeft, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSocialStore } from "../store/useSocialStore";

const MessageRequestsPage = () => {
  const navigate = useNavigate();
  const { messageRequests, getMessageRequests, respondToMessageRequest } = useSocialStore();
  const [query, setQuery] = useState("");

  useEffect(() => {
    getMessageRequests();
  }, [getMessageRequests]);

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return messageRequests.filter((request) =>
      !search || request.requestedBy?.fullName?.toLowerCase().includes(search)
    );
  }, [messageRequests, query]);

  return null;
};

export default MessageRequestsPage;
