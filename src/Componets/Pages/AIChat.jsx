import { useState, useEffect, useRef } from "react";
import {
  FaUser,
  FaPaperPlane,
  FaTrash,
  FaSpinner,
  FaQuestionCircle,
  FaReply,
  FaCheckCircle,
  FaGlobe,
  FaLock,
  FaSearch,
  FaCircle,
} from "react-icons/fa";
import io from "socket.io-client";
import {
  getConversations,
  getConversationMessages,
  createOrGetConversation,
  getPendingQuestions,
  getPublicQuestions,
  answerQuestion,
  getAllUsers,
  createFAQ,
} from "../../services/chatService";
import { toast } from "react-toastify";
import { FaPlus, FaTimes } from "react-icons/fa";

function LiveChat() {
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem("adminChatActiveTab") || "chat");
  const [conversations, setConversations] = useState([]);
  const [selectedConvo, setSelectedConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Questions State
  const [pendingQuestions, setPendingQuestions] = useState([]);
  const [publicFaqs, setPublicFaqs] = useState([]);
  const [answeringId, setAnsweringId] = useState(null);
  const [answerText, setAnswerText] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [isCreatingFAQ, setIsCreatingFAQ] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");

  const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
  const adminId = userInfo._id || userInfo.id;

  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    // 🔌 Initialize Socket
    if (!socketRef.current && adminId) {
      const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5002';
      socketRef.current = io(socketUrl, {
        withCredentials: true,
        transports: ['polling', 'websocket']
      });

      socketRef.current.on("connect", () => {
        console.log('✅ Socket connected:', socketRef.current.id);
        socketRef.current.emit("join", adminId);
      });

      socketRef.current.on("new_question", (question) => {
        setPendingQuestions(prev => [question, ...prev]);
        toast.info(`New question from ${question.user?.profile?.firstName || 'Student'}`);
      });
    }
  }, [adminId]);

  // 📡 Update receiveMessage listener whenever selectedConvo changes to avoid stale closure
  useEffect(() => {
    if (!socketRef.current) return;

    const handleReceive = (msg) => {
      console.log('📥 AIChat received message:', msg);
      const currentConvoId = selectedConvo?._id?.toString();
      console.log('📥 Comparison:', { msgConvo: msg.conversationId?.toString(), currentConvo: currentConvoId });

      // If it belongs to current convo, add to messages
      if (currentConvoId && msg.conversationId?.toString() === currentConvoId) {
        setMessages(prev => {
          if (prev.some(m => (m._id || m.id) === (msg._id || msg.id))) return prev;
          return [...prev, msg];
        });
      }
      
      // Always update last message in conversations list
      setConversations(prev => prev.map(c => 
        c._id.toString() === msg.conversationId.toString() ? { ...c, lastMessage: msg.text, updatedAt: new Date() } : c
      ));
    };

    socketRef.current.off("receiveMessage");
    socketRef.current.on("receiveMessage", handleReceive);

    return () => {
      socketRef.current?.off("receiveMessage");
    };
  }, [selectedConvo]);

  // Separate effect for cleanup
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("adminChatActiveTab", activeTab);
    if (activeTab === "chat") {
      fetchConversations();
      fetchAllUsers();
    }
    loadQuestions();
  }, [activeTab]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await getConversations();
      if (res.success) setConversations(res.data);
    } catch (error) {
      console.error("Fetch conversations error:", error);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await getAllUsers();
      if (res.success) setUsers(res.data.filter(u => u.role !== 'admin'));
    } catch (error) {
      console.error("Fetch users error:", error);
    }
  };

  const loadQuestions = async () => {
    setQuestionsLoading(true);
    try {
      const res = await getPendingQuestions();
      if (res.success) setPendingQuestions(res.data || []);
      
      const pubRes = await getPublicQuestions();
      if (pubRes.success) setPublicFaqs(pubRes.data || []);
    } catch (error) {
      console.error("loadQuestions error:", error);
    } finally {
      setQuestionsLoading(false);
    }
  };

  const handleSelectUser = async (user) => {
    try {
      setLoading(true);
      const res = await createOrGetConversation(user.id || user._id);
      if (res.success) {
        const convo = res.data;
        setSelectedConvo(convo);
        const msgRes = await getConversationMessages(convo._id);
        if (msgRes.success) setMessages(msgRes.data);
        
        // Ensure admin is in their own room (for receiving)
        if (socketRef.current) socketRef.current.emit("join", adminId);
      }
    } catch (error) {
      toast.error("Failed to load conversation");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    console.log("📤 Admin attempting to send message. Selected Convo:", selectedConvo);
    if (!currentMessage.trim() || !selectedConvo || loading) {
        console.error("❌ Send failed: missing data", { currentMessage, selectedConvo, loading });
        return;
    }

    // Find the other member in the conversation
    const myId = adminId.toString();
    const otherMember = selectedConvo.members.find(m => (m._id || m.id || m).toString() !== myId);
    const receiverId = otherMember?._id || otherMember?.id || otherMember;
    
    if (!receiverId) {
      console.error("❌ Receiver ID not found in members:", selectedConvo.members);
      toast.error("Could not find receiver");
      return;
    }

    const messageData = {
      senderId: myId,
      receiverId: receiverId.toString(),
      text: currentMessage,
      conversationId: selectedConvo._id.toString()
    };

    console.log("📤 Admin emitting sendMessage:", messageData);
    try {
      if (socketRef.current) {
        socketRef.current.emit("sendMessage", messageData);
      }
      setCurrentMessage("");
    } catch (error) {
      console.error("❌ Socket emit error:", error);
      toast.error("Failed to send message");
    }
  };

  const handleAnswerQuestion = async (e) => {
    e.preventDefault();
    if (!answerText.trim() || !answeringId) return;
    try {
      const res = await answerQuestion(answeringId, answerText, isPublic);
      if (res.success) {
        toast.success("Answer sent successfully!");
        setPendingQuestions(prev => prev.filter(q => q._id !== answeringId));
        if (isPublic && res.data) {
          setPublicFaqs(prev => [res.data, ...prev]);
        }
        setAnsweringId(null);
        setAnswerText("");
      }
    } catch (error) {
      toast.error("Failed to send answer");
    }
  };

  const handleCreateFAQ = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    
    try {
      setQuestionsLoading(true);
      const res = await createFAQ(newQuestion.trim(), newAnswer.trim(), true);
      if (res.success) {
        toast.success("New FAQ created successfully!");
        setNewQuestion("");
        setNewAnswer("");
        setIsCreatingFAQ(false);
        if (res.data) {
          setPublicFaqs(prev => [res.data, ...prev]);
        }
      }
    } catch (error) {
      toast.error("Failed to create FAQ");
    } finally {
      setQuestionsLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    (u.profile?.firstName + " " + u.profile?.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (ts) => ts ? new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : '';

  return (
    <div className="main-content">
      <div className="container-fluid h-100">
        <div className="card h-100 border-0 shadow-sm overflow-hidden">
          {/* TABS HEADER */}
          <div className="card-header bg-white border-bottom p-0">
            <div className="d-flex overflow-hidden">
              <button 
                className={`flex-fill py-3 border-0 bg-transparent fw-bold ${activeTab === 'chat' ? 'border-bottom border-3 border-primary text-primary' : 'text-muted'}`}
                onClick={() => setActiveTab('chat')}
              >
                Live Chat Support
              </button>
              <button 
                className={`flex-fill py-3 border-0 bg-transparent fw-bold position-relative ${activeTab === 'questions' ? 'border-bottom border-3 border-primary text-primary' : 'text-muted'}`}
                onClick={() => setActiveTab('questions')}
              >
                Questions & FAQ 
                {pendingQuestions.length > 0 && (
                  <span className="position-absolute top-25 start-75 translate-middle badge rounded-pill bg-danger">
                    {pendingQuestions.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="card-body p-0 d-flex flex-column" style={{ height: 'calc(100vh - 180px)' }}>
            {activeTab === 'chat' ? (
              <div className="d-flex h-100">
                {/* LOG: LEFT SIDEBAR - USER LIST */}
                <div className="border-end bg-light" style={{ width: '300px' }}>
                  <div className="p-3 border-bottom bg-white">
                    <div className="input-group input-group-sm">
                      <span className="input-group-text bg-light border-0"><FaSearch className="text-muted" /></span>
                      <input 
                        type="text" 
                        className="form-control bg-light border-0" 
                        placeholder="Search students..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="overflow-auto" style={{ height: 'calc(100% - 60px)' }}>
                    {filteredUsers.map(user => {
                      const convo = conversations.find(c => c.members.some(m => (m._id || m).toString() === (user._id || user.id).toString()));
                      return (
                        <div 
                          key={user._id} 
                          className={`p-3 border-bottom cursor-pointer hover-bg-white d-flex align-items-center gap-3 ${selectedConvo?.members.some(m => (m._id || m).toString() === (user._id || user.id).toString()) ? 'bg-primary-subtle border-start border-4 border-primary' : ''}`}
                          onClick={() => handleSelectUser(user)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="position-relative">
                            <div className="p-2 bg-secondary-subtle rounded-circle"><FaUser className="text-secondary" /></div>
                            <FaCircle className="position-absolute bottom-0 end-0 text-success border border-2 border-white" style={{ fontSize: '10px' }} />
                          </div>
                          <div className="flex-grow-1 overflow-hidden">
                            <h6 className="mb-0 text-truncate small fw-bold">
                              {[user.profile?.firstName, user.profile?.lastName].filter(Boolean).join(" ") || user.username || 'Student'}
                            </h6>
                            <p className="mb-0 text-truncate text-muted" style={{ fontSize: '11px' }}>
                              {convo?.lastMessage || "No messages yet"}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* LOG: RIGHT CONTENT - CHAT WINDOW */}
                <div className="flex-grow-1 d-flex flex-column bg-white">
                  {selectedConvo ? (
                    <>
                      <div className="p-3 border-bottom d-flex align-items-center gap-3">
                        <div className="p-2 bg-primary-subtle text-primary rounded-circle"><FaUser /></div>
                        <div>
                          <h6 className="mb-0">
                            {(() => {
                              const student = selectedConvo.members.find(m => (m._id || m.id).toString() !== adminId.toString());
                              return [student?.profile?.firstName, student?.profile?.lastName].filter(Boolean).join(" ") || student?.username || 'Student';
                            })()}
                          </h6>
                          <small className="text-success d-flex align-items-center gap-1"><FaCircle style={{ fontSize: '8px' }} /> Online</small>
                        </div>
                      </div>
                      <div className="flex-grow-1 p-4 overflow-auto bg-light-subtle">
                        {messages.map((msg) => {
                          const isAdmin = msg.sender === adminId || msg.messageType === 'admin';
                          return (
                            <div key={msg._id} className={`d-flex mb-3 ${isAdmin ? "justify-content-end" : "justify-content-start"}`}>
                              <div className={`p-3 rounded-4 shadow-sm ${isAdmin ? "bg-primary text-white" : "bg-white text-dark"}`} style={{ maxWidth: '70%' }}>
                                <p className="mb-1 small " style={{color:"black"}}>{msg.text || msg.message}</p>
                                <small className={`d-flex justify-content-end ${isAdmin ? "text-white-50" : "text-muted"}`} style={{ fontSize: '10px' }}>
                                  {formatTime(msg.createdAt)}
                                </small>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                      <div className="p-3 border-top">
                        <div className="d-flex gap-2">
                          <input 
                            className="form-control rounded-pill px-4" 
                            placeholder="Type a message..." 
                            value={currentMessage}
                            onChange={(e) => setCurrentMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                          />
                          <button className="btn btn-primary rounded-circle p-2 px-3" onClick={handleSendMessage} disabled={!currentMessage.trim() || loading}>
                            <FaPaperPlane />
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted opacity-50">
                      <FaPaperPlane className="display-1 mb-3" />
                      <h5>Select a student to start chatting</h5>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 overflow-auto flex-grow-1 bg-light">
                {/* FAQ CREATION HEADER */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="mb-0 fw-bold">Manage FAQ & Support Questions</h5>
                  <button 
                    className={`btn ${isCreatingFAQ ? 'btn-outline-danger' : 'btn-primary'} rounded-pill px-4 d-flex align-items-center gap-2`}
                    onClick={() => setIsCreatingFAQ(!isCreatingFAQ)}
                  >
                    {isCreatingFAQ ? <><FaTimes /> Close Form</> : <><FaPlus /> Create New FAQ</>}
                  </button>
                </div>

                {/* CREATE FAQ FORM */}
                {isCreatingFAQ && (
                  <div className="row mb-5 justify-content-center">
                    <div className="col-lg-8">
                      <div className="card border-0 shadow-sm rounded-4 overflow-hidden border-start border-4 border-primary">
                        <div className="card-header bg-white py-3">
                          <h6 className="mb-0 fw-bold text-primary">Add a Frequently Asked Question</h6>
                        </div>
                        <div className="card-body p-4">
                          <form onSubmit={handleCreateFAQ}>
                            <div className="mb-3">
                              <label className="form-label small fw-bold">Question</label>
                              <input 
                                type="text" 
                                className="form-control bg-light border-0" 
                                placeholder="What is the common question?"
                                value={newQuestion}
                                onChange={(e) => setNewQuestion(e.target.value)}
                                required
                              />
                            </div>
                            <div className="mb-3">
                              <label className="form-label small fw-bold">Answer</label>
                              <textarea 
                                className="form-control bg-light border-0" 
                                rows="4" 
                                placeholder="Provide the detailed answer here..."
                                value={newAnswer}
                                onChange={(e) => setNewAnswer(e.target.value)}
                                required
                              ></textarea>
                            </div>
                            <div className="d-flex justify-content-end gap-2">
                              <button type="button" className="btn btn-link text-muted" onClick={() => setIsCreatingFAQ(false)}>Cancel</button>
                              <button type="submit" className="btn btn-primary px-5 rounded-pill shadow-sm" disabled={questionsLoading}>
                                {questionsLoading ? <FaSpinner className="fa-spin" /> : 'Publish FAQ'}
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="row g-4">
                  {questionsLoading ? (
                    <div className="col-12 text-center py-5">
                      <FaSpinner className="fa-spin display-6 text-primary" />
                    </div>
                  ) : pendingQuestions.length > 0 ? (
                    pendingQuestions.map((q) => (
                      <div className="col-12" key={q._id}>
                        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                          <div className="card-header bg-white border-bottom py-3">
                            <div className="d-flex justify-content-between align-items-center">
                              <div className="d-flex align-items-center gap-3">
                                <div className="p-2 bg-primary-subtle text-primary rounded-circle">
                                  <FaUser />
                                </div>
                                <div>
                                  <h6 className="mb-0">{q.user?.profile?.firstName || 'Student'}</h6>
                                  <small className="text-muted">{q.user?.email}</small>
                                </div>
                              </div>
                              <small className="text-muted">{new Date(q.createdAt).toLocaleString()}</small>
                            </div>
                          </div>
                          <div className="card-body p-4">
                            <h5 className="mb-3 d-flex align-items-center gap-2">
                              <FaQuestionCircle className="text-warning" /> {q.question}
                            </h5>
                            
                            {answeringId === q._id ? (
                              <form onSubmit={handleAnswerQuestion} className="bg-light p-3 rounded-3">
                                <textarea 
                                  className="form-control border-0 mb-3" 
                                  rows="3" 
                                  placeholder="Write your answer..."
                                  value={answerText}
                                  onChange={(e) => setAnswerText(e.target.value)}
                                  required
                                  autoFocus
                                ></textarea>
                                <div className="d-flex justify-content-between align-items-center">
                                  <div className="form-check form-switch">
                                    <input 
                                      className="form-check-input" 
                                      type="checkbox" 
                                      id={`publicSwitch${q._id}`} 
                                      checked={isPublic}
                                      onChange={(e) => setIsPublic(e.target.checked)}
                                    />
                                    <label className="form-check-label small" htmlFor={`publicSwitch${q._id}`}>
                                      {isPublic ? <><FaGlobe className="text-success" /> Make Public (FAQ)</> : <><FaLock className="text-muted" /> Private Reply</>}
                                    </label>
                                  </div>
                                  <div className="d-flex gap-2">
                                    <button type="button" className="btn btn-link text-muted btn-sm" onClick={() => setAnsweringId(null)}>Cancel</button>
                                    <button type="submit" className="btn btn-success btn-sm px-4 rounded-pill">Submit Answer</button>
                                  </div>
                                </div>
                              </form>
                            ) : (
                              <button className="btn btn-outline-primary rounded-pill px-4 d-flex align-items-center gap-2" onClick={() => setAnsweringId(q._id)}>
                                <FaReply /> Reply to Question
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-12 text-center py-5">
                      <FaCheckCircle className="display-4 text-success opacity-25 mb-3" />
                      <p className="text-muted">No pending questions. All caught up!</p>
                    </div>
                  )}

                  {/* PUBLIC FAQs SECTION */}
                  <div className="col-12 mt-5">
                    <h5 className="mb-4 fw-bold border-bottom pb-2">Published FAQs & Answered Questions</h5>
                    {publicFaqs.length > 0 ? (
                      <div className="row g-3">
                        {publicFaqs.map((faq) => (
                          <div className="col-12" key={faq._id}>
                            <div className="card shadow-sm border-0 border-start border-4 border-success">
                              <div className="card-body p-3">
                                <h6 className="fw-bold mb-2"><FaQuestionCircle className="text-primary me-2" />{faq.question}</h6>
                                <p className="text-muted mb-0 small"><FaCheckCircle className="text-success me-2" />{faq.answer}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted">No published FAQs found.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LiveChat;
