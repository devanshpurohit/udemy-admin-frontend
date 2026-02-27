import { useState, useEffect, useRef } from "react";
import {
  FaRobot,
  FaPaperPlane,
  FaTrash,
  FaSpinner,
} from "react-icons/fa";
import {
  sendMessageToAI,
  getChatHistory,
  clearChatHistory,
} from "../../services/chatService";

function AIChat() {
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(`session_${Date.now()}`);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    loadChatHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height =
        Math.min(inputRef.current.scrollHeight, 120) + "px";
    }
  }, [currentMessage]);

  const loadChatHistory = async () => {
    try {
      const response = await getChatHistory(sessionId);
      if (response.success) {
        setMessages(response.data.chats.reverse());
      }
    } catch (error) {
      console.error("Chat history error:", error);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm("Clear all chat history?")) return;

    try {
      const response = await clearChatHistory(sessionId);
      if (response.success) {
        setMessages([]);
        setSessionId(`session_${Date.now()}`);
      }
    } catch (error) {
      console.error("Clear history error:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || loading) return;

    const userMessage = {
      _id: `temp_${Date.now()}`,
      message: currentMessage,
      messageType: "user",
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setCurrentMessage("");
    setLoading(true);
    setIsTyping(true);

    try {
      const response = await sendMessageToAI(currentMessage, sessionId);

      if (response.success) {
        setMessages((prev) => [...prev, response.data.aiMessage]);

        if (response.data.userMessage.sessionId) {
          setSessionId(response.data.userMessage.sessionId);
        }
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          _id: `error_${Date.now()}`,
          message: "Something went wrong. Please try again.",
          messageType: "ai",
          createdAt: new Date().toISOString(),
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) =>
    new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="main-content flex-grow-1 p-3 overflow-auto">
      <div className="w-full h-full flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white rounded-2xl overflow-hidden shadow-2xl">

        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 bg-white/5 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <FaRobot className="text-white text-lg" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">AI Assistant</h2>
              <p className="text-green-400 text-xs flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Online & Ready
              </p>
            </div>
          </div>

          <button
            onClick={handleClearHistory}
            className="text-red-400 hover:text-red-600 transition"
          >
            <FaTrash />
          </button>
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

          {messages.length === 0 && (
            <div className="text-center text-gray-400 mt-24">
              <FaRobot className="text-6xl mx-auto mb-6 text-blue-400 opacity-80" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Welcome to AI Assistant
              </h3>
              <p className="text-gray-500">
                Ask me anything about courses, coding, career, tech 🚀
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg._id}
              className={`flex ${
                msg.messageType === "user"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] px-5 py-4 rounded-2xl shadow-lg ${
                  msg.messageType === "user"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600"
                    : msg.isError
                    ? "bg-red-600"
                    : "bg-white/5 backdrop-blur-md border border-white/10"
                }`}
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {msg.message}
                </p>

                <span className="text-xs text-gray-400 mt-3 block">
                  {formatTime(msg.createdAt)}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="text-gray-400 text-sm">AI is typing...</div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT */}
        <div className="p-5 bg-white/5 border-t border-white/10">
          <div className="flex gap-4 items-end">

            <textarea
              ref={inputRef}
              className="flex-1 bg-white/5 border border-white/10 text-white placeholder-gray-400 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ask me anything..."
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              rows={1}
            />

            <button
              onClick={handleSendMessage}
              disabled={!currentMessage.trim() || loading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-105 transition-transform px-5 py-3 rounded-xl shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <FaPaperPlane />
              )}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}

export default AIChat;