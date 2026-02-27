import { useState, useEffect, useRef } from "react";
import {
  FaUser,
  FaPaperPlane,
  FaTrash,
  FaSpinner,
} from "react-icons/fa";
import io from "socket.io-client";
import {
  sendMessage,
  getChatHistory,
  clearChatHistory,
} from "../../services/chatService";

function LiveChat() {
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [loading, setLoading] = useState(false);
  
  // 🚀 PERSISTENT SESSION ID WITH USER ID
  const [sessionId, setSessionId] = useState(() => {
    // Get user info from localStorage
    const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = userInfo.id || 'anonymous';
    const userRole = userInfo.role || 'student';
    
    console.log('👤 User info from localStorage:', userInfo);
    console.log('👤 User ID:', userId);
    console.log('👤 User Role:', userRole);
    
    // Create user-specific session key
    const sessionKey = `liveChatSessionId_${userId}`;
    const savedSessionId = localStorage.getItem(sessionKey);
    
    console.log('🔑 Session key:', sessionKey);
    console.log('📋 Saved session ID:', savedSessionId);
    
    if (savedSessionId) {
      console.log('📱 Using saved session ID:', savedSessionId);
      return savedSessionId;
    }
    
    // Generate new one if not exists
    const newSessionId = `session_${userId}_${Date.now()}`;
    localStorage.setItem(sessionKey, newSessionId);
    console.log('📱 Generated new session ID:', newSessionId);
    return newSessionId;
  });

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // 🚀 STEP 5 — Frontend Socket Install
  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize socket only once
    if (!socketRef.current) {
      socketRef.current = io("http://localhost:5002");
      console.log('🔌 Socket initialized');
    }
    
    return () => {
      // Cleanup on unmount
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  const socket = socketRef.current;

  useEffect(() => {
    // Only set up listeners when socket is available
    if (!socket) return;

    console.log('🔌 Setting up socket listeners...');
    
    socket.on("connect", () => {
      console.log('✅ Socket connected:', socket.id);
    });

    socket.on("disconnect", () => {
      console.log('❌ Socket disconnected');
    });

    socket.on("receiveMessage", (msg) => {
      console.log('📩 Live message received:', msg);
      console.log('📩 Message details:', {
        _id: msg._id,
        role: msg.role,
        messageType: msg.messageType,
        sender: msg.sender,
        message: msg.message?.substring(0, 20)
      });
      
      // Ensure message has proper timestamp
      const messageWithTimestamp = {
        ...msg,
        createdAt: msg.createdAt || new Date().toISOString()
      };
      
      setMessages(prev => {
        // Check for duplicate messages by _id, message content, sender, and timestamp
        const isDuplicate = prev.some(existingMsg => 
          existingMsg._id === messageWithTimestamp._id || 
          (existingMsg.message === messageWithTimestamp.message && 
           existingMsg.createdAt === messageWithTimestamp.createdAt) ||
          (existingMsg.sender === messageWithTimestamp.sender && 
           existingMsg.message === messageWithTimestamp.message) ||
          (existingMsg.sender === messageWithTimestamp.sender && 
           existingMsg.createdAt === messageWithTimestamp.createdAt)
        );
        
        if (isDuplicate) {
          console.log('🔄 Duplicate message detected, skipping:', messageWithTimestamp._id);
          console.log('🔄 Duplicate details:', {
            existingMessage: prev.find(m => m._id === messageWithTimestamp._id || m.message === messageWithTimestamp.message)?.message,
            newMessage: messageWithTimestamp.message,
            existingSender: prev.find(m => m._id === messageWithTimestamp._id || m.message === messageWithTimestamp.message)?.sender,
            newSender: messageWithTimestamp.sender
          });
          return prev;  // Don't add duplicate
        }
        
        const updatedMessages = [...prev, messageWithTimestamp];
        
        // Save to localStorage for persistence
        const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = userInfo.id || 'anonymous';
        const localMessagesKey = `liveChatMessages_${userId}`;
        localStorage.setItem(localMessagesKey, JSON.stringify(updatedMessages));
        console.log('💾 Saved new message to localStorage');
        
        return updatedMessages;
      });
    });

    return () => {
      console.log('🧹 Cleaning up socket listeners...');
      socket.off("connect");
      socket.off("disconnect");
      socket.off("receiveMessage");
    };
  }, [socket]);  // Add socket as dependency

  useEffect(() => {
    loadChatHistory();
  }, [sessionId]);  // Only reload when sessionId changes

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      console.log(' Loading chat history for session:', sessionId);
      
      // First try to load from localStorage for instant display
      const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = userInfo.id || 'anonymous';
      const localMessagesKey = `liveChatMessages_${userId}`;
      const savedMessages = localStorage.getItem(localMessagesKey);
      
      if (savedMessages) {
        try {
          const parsedMessages = JSON.parse(savedMessages);
          console.log(' Loaded messages from localStorage:', parsedMessages.length);
          
          // Filter out admin's own messages from localStorage to prevent duplicates
          const filteredMessages = parsedMessages.filter(msg => 
            !(msg.sender === userId && userInfo.role === 'admin')
          );
          
          console.log(' Filtered messages from localStorage:', filteredMessages.length);
          setMessages(filteredMessages);
        } catch (e) {
          console.log(' Error parsing saved messages:', e);
        }
      }
      
      // Then fetch from server for latest data
      const response = await getChatHistory(sessionId);
      
      console.log(' Full response from service:', response);
      console.log(' Response success:', response.success);
      console.log(' Response data:', response.data);
      
      // Handle both response structures
      let historyMessages = [];
      
      if (response.success && response.data && response.data.chats) {
        // Structure: {success: true, data: {chats: [...]}}
        historyMessages = response.data.chats;
        console.log(' Using nested structure');
      } else if (response.chats && Array.isArray(response.chats)) {
        // Structure: {chats: [...], pagination: {...}}
        historyMessages = response.chats;
        console.log(' Using direct structure');
      } else {
        console.error(' No valid chats found in response');
        console.log(' Available keys:', Object.keys(response));
      }
      
      if (historyMessages.length > 0) {
        console.log(' Chat history loaded from server:', historyMessages.length, 'messages');
        console.log(' Sample messages:', historyMessages.slice(0, 2));
        setMessages(historyMessages.reverse());  // Reverse to show oldest first
        
        // Save to localStorage for persistence (only non-admin messages)
        const nonAdminMessages = historyMessages.filter(msg => 
          !(msg.sender === userId && userInfo.role === 'admin')
        );
        localStorage.setItem(localMessagesKey, JSON.stringify(nonAdminMessages.reverse()));
        console.log(' Saved non-admin messages to localStorage');
      } else {
        console.log(' No chat history found');
      }
    } catch (error) {
      console.error("Chat history error:", error);
    }
  };

  const handleClearHistory = async () => {
    console.log(' Clear history button clicked!');
    console.log(' Current sessionId:', sessionId);
    
    if (!window.confirm("Clear all chat history?")) {
      console.log(' User cancelled clear history');
      return;
    }

    try {
      console.log(' Calling clearChatHistory API...');
      const response = await clearChatHistory(sessionId);
      console.log(' Clear history response:', response);
      
      if (response.success) {
        console.log(' History cleared successfully, updating UI...');
        
        // Clear messages from UI
        setMessages([]);
        
        // Get current user info
        const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = userInfo.id || 'anonymous';
        const currentUserRole = userInfo.role || 'student';
        
        // Clear ALL localStorage messages for this user
        const localMessagesKey = `liveChatMessages_${userId}`;
        localStorage.removeItem(localMessagesKey);
        console.log(' Cleared localStorage messages for:', userId);
        
        // Clear session ID
        const sessionKey = `liveChatSessionId_${userId}`;
        localStorage.removeItem(sessionKey);
        console.log(' Cleared session ID for:', userId);
        
        // Generate new session ID
        const newSessionId = `session_${userId}_${Date.now()}`;
        localStorage.setItem(sessionKey, newSessionId);
        setSessionId(newSessionId);
        
        console.log(' Chat history completely cleared, new session generated:', newSessionId);
        console.log(' Deleted count:', response.deletedCount || 'unknown');
      } else {
        console.log(' Clear history failed:', response);
      }
    } catch (error) {
      console.error(" Clear history error:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || loading) return;

    // Get current user info
    const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
    const currentUserRole = userInfo.role || 'student';
    const currentUserId = userInfo.id || 'anonymous';

    const tempMessage = {
      _id: `temp_${Date.now()}`,
      message: currentMessage,
      messageType: currentUserRole === 'admin' ? 'admin' : 'student',  
      sender: currentUserId,  
      role: currentUserRole === 'admin' ? 'admin' : 'student',  
      createdAt: new Date().toISOString(),
      sessionId: sessionId
    };

    // Add user message to UI immediately
    setMessages((prev) => [...prev, tempMessage]);
    setCurrentMessage("");
    setLoading(true);

    try {
      console.log('📤 Sending message:', currentMessage);
      console.log('👤 Current user role:', currentUserRole);
      
      // 🚀 Send Message via Socket (only if socket is available)
      if (socket) {
        socket.emit("sendMessage", {
          message: currentMessage,
          sender: currentUserRole === 'admin' ? 'admin' : 'student',
          sessionId: sessionId
        });
        console.log('✅ Message sent via socket');
      } else {
        console.log('⚠️ Socket not available, skipping socket emit');
      }

      // Also save to database
      const response = await sendMessage(currentMessage, sessionId);
      
      if (response.success) {
        if (response.data.sessionId) {
          setSessionId(response.data.sessionId);
        }
        
        console.log('✅ Message saved to database');
      }
    } catch (error) {
      console.error("❌ Send message error:", error);
      
      // Add error message to UI
      const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
      const currentUserId = userInfo.id || 'anonymous';
      const currentUserRole = userInfo.role || 'student';
      
      setMessages((prev) => [
        ...prev,
        {
          _id: `error_${Date.now()}`,
          message: "Message failed to send. Please try again.",
          messageType: currentUserRole === 'admin' ? 'admin' : 'student',  // Set messageType based on current user
          sender: currentUserId,  // ✅ ADD SENDER ID
          role: currentUserRole === 'admin' ? 'admin' : 'student',  // Set role based on current user
          createdAt: new Date().toISOString(),
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return '';
      
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return '';
    }
  };

  return (
    <div className="main-content">
      <div className="container-fluid h-100">
        <div className="row h-100">
          <div className="col-12 h-100">
            <div className="card h-100 border-0 shadow-sm">
              
              {/* HEADER */}
              <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-3">
                  <div className="p-3 bg-success rounded-circle">
                    <FaUser className="text-white" />
                  </div>
                  <div>
                    <h5 className="mb-0">Live Chat Support</h5>
                    <small className="text-success d-flex align-items-center gap-1">
                      <span className="w-2 h-2 bg-success rounded-circle"></span>
                      Online - Admin will respond
                    </small>
                  </div>
                </div>

                <button
                  onClick={handleClearHistory}
                  className="btn btn-link text-danger p-2"
                >
                  <FaTrash />
                </button>
              </div>

              {/* MESSAGES */}
              <div className="card-body p-4 overflow-auto" style={{ height: 'calc(100% - 180px)' }}>

                {messages.length === 0 && (
                  <div className="text-center text-muted mt-5">
                    <FaUser className="display-1 text-success mb-4" />
                    <h4 className="text-dark mb-2">Welcome to Live Chat</h4>
                    <p className="text-muted">
                      Send a message and our admin team will help you! �
                    </p>
                  </div>
                )}

                {messages.map((msg) => {
                  // Determine message role/type with better logic
                  let messageRole = msg.role || msg.messageType || 'user';
                  
                  // Debug logging
                  console.log('🔍 Message role check:', {
                    _id: msg._id,
                    role: msg.role,
                    messageType: msg.messageType,
                    sender: msg.sender,
                    detectedRole: messageRole,
                    message: msg.message?.substring(0, 30) + '...'
                  });
                  
                  // Get current user role
                  const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
                  const currentUserRole = userInfo.role || 'student';
                  const currentUserId = userInfo.id;
                  
                  // Student messages: role='student' OR messageType='user' AND (sender is different from current user OR current user is student)
                  const isStudentMessage = messageRole === 'student' || 
                    messageRole === 'user' || 
                    (currentUserRole === 'student' && msg.sender === currentUserId) ||
                    (msg.sender && msg.sender !== currentUserId);
                  
                  // Admin messages: role='admin' OR sender is current admin OR sender is null (AI message) OR message from current admin
                  const isAdminMessage = messageRole === 'admin' || 
                    messageRole === 'ai' || 
                    (!msg.sender && currentUserRole === 'admin') || 
                    (msg.sender === currentUserId && currentUserRole === 'admin') ||
                    (msg.sender === currentUserId && messageRole === 'admin') ||
                    (msg.sender === currentUserId && !messageRole);  // Current user's message without messageType = admin
                  
                  console.log('🎯 Message classification:', {
                    isStudentMessage,
                    isAdminMessage,
                    currentUserRole,
                    currentUserId,
                    color: isStudentMessage ? 'gray (left)' : 'blue (right)'
                  });
                  
                  return (
                  <div
                    key={msg._id}
                    className={`d-flex mb-3 ${
                      isStudentMessage
                        ? "justify-content-start"  // Student messages on left (gray)
                        : "justify-content-end"    // Admin messages on right (blue)
                    }`}
                  >
                    <div
                      className={`p-3 rounded-3 shadow-sm ${
                        isStudentMessage
                          ? "bg-light text-dark"  // Student messages gray
                          : msg.isError
                          ? "bg-danger text-white"
                          : "bg-primary text-white"  // Admin messages blue
                      }`}
                      style={{ maxWidth: '70%' }}
                    >
                      <p className="mb-1 small">
                        {msg.message}
                      </p>

                      <small className={isStudentMessage ? "text-muted" : "text-white-50"}>
                        {formatTime(msg.createdAt)}
                      </small>
                    </div>
                  </div>
                );
                })}

                {loading && (
                  <div className="text-muted small mb-3">
                    <FaSpinner className="fa-spin me-2" />
                    Sending message...
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* INPUT */}
              <div className="card-footer bg-white border-top p-3">
                <div className="d-flex gap-2">

                  <textarea
                    ref={inputRef}
                    className="form-control flex-grow-1"
                    placeholder="Type your message..."
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    rows={1}
                    style={{ resize: 'none' }}
                  />

                  <button
                    onClick={handleSendMessage}
                    disabled={!currentMessage.trim() || loading}
                    className="btn btn-primary px-4"
                  >
                    {loading ? (
                      <FaSpinner className="fa-spin" />
                    ) : (
                      <FaPaperPlane />
                    )}
                  </button>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LiveChat;
