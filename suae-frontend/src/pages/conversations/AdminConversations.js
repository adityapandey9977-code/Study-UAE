/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  Row,
  Col,
  Input,
  Button,
  Tag,
  Avatar,
  Badge,
  Spin,
  Empty,
  Image,
  Statistic,
  DatePicker,
  message
} from "antd";
import {
  MessageOutlined,
  SearchOutlined,
  ReloadOutlined,
  CustomerServiceOutlined,
  FileTextOutlined,
  DownloadOutlined,
  AudioOutlined,
  CommentOutlined
} from "@ant-design/icons";
import moment from "moment";
import ChatService from "../../services/ChatService";
import util from "../../utils/util";

const { RangePicker } = DatePicker;

const getNodeOrigin = () => {
  try {
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      return "http://localhost:5000";
    }
    if (util && util.apiUrlNode) {
      const parsed = new URL(util.apiUrlNode);
      if (!parsed.hostname.includes("localhost") && !parsed.hostname.includes("127.0.0.1")) {
        return parsed.origin;
      }
    }
    if (process.env.REACT_APP_API_URL_NODE) {
      return process.env.REACT_APP_API_URL_NODE.replace(/\/$/, "");
    }
  } catch (e) {}

  return "http://localhost:5000";
};

const resolveUploadsUrl = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== "string") return "";
  let url = rawUrl.trim();
  
  if (url.startsWith("blob:")) return url;

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  const origin = getNodeOrigin();
  let cleanPath = url.startsWith("/") ? url : `/${url}`;
  if (!cleanPath.startsWith("/uploads/")) {
    if (cleanPath.startsWith("/chat_files/") || cleanPath.startsWith("/audio/")) {
      cleanPath = `/uploads${cleanPath}`;
    } else {
      cleanPath = `/uploads/chat_files${cleanPath}`;
    }
  }
  return `${origin}${cleanPath}`;
};

export default function AdminConversations() {
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [dateRange, setDateRange] = useState([]);
  const [chatSearch, setChatSearch] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const fetchConversationsList = async (customDateRange = dateRange, customSearch = searchKeyword) => {
    setLoading(true);
    try {
      const params = {
        page: 1,
        limit: 100,
        search: customSearch || ""
      };
      if (customDateRange && customDateRange.length === 2 && customDateRange[0] && customDateRange[1]) {
        params.from_date = customDateRange[0].format("YYYY-MM-DD");
        params.to_date = customDateRange[1].format("YYYY-MM-DD");
      }

      const res = await ChatService.getAdminConversations(params);
      if (res?.data?.success) {
        const list = res.data.data || [];
        setConversations(list);
        if (list.length > 0) {
          const stillExists = selectedConv && list.find(c => 
            (c.user1?.id === selectedConv.user1?.id && c.user2?.id === selectedConv.user2?.id) ||
            (c.user1?.id === selectedConv.user2?.id && c.user2?.id === selectedConv.user1?.id)
          );
          if (stillExists) {
            selectConversation(stillExists);
          } else if (!selectedConv) {
            selectConversation(list[0]);
          }
        } else {
          setSelectedConv(null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
      message.error(err.message || "Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  const selectConversation = async (conv) => {
    if (!conv) return;
    setSelectedConv(conv);
    setLoadingChat(true);
    try {
      const u1 = conv.user1?.id;
      const u2 = conv.user2?.id;

      const chatRes = await ChatService.getAdminChatHistory({
        user1_id: u1,
        user2_id: u2,
        limit: 2000
      });
      if (chatRes?.data?.success) {
        setMessages(chatRes.data.messages || []);
      }
    } catch (err) {
      console.error("Error loading chat messages:", err);
      message.error(err.message || "Failed to load conversation messages");
    } finally {
      setLoadingChat(false);
      setTimeout(scrollToBottom, 200);
    }
  };

  useEffect(() => {
    fetchConversationsList();
  }, []);

  const filteredChatMessages = messages.filter((m) => {
    if (!chatSearch) return true;
    const text = (m.content || "").toLowerCase();
    const sender = (m.sender_name || "").toLowerCase();
    return text.includes(chatSearch.toLowerCase()) || sender.includes(chatSearch.toLowerCase());
  });

  const renderMessageContent = (msg) => {
    const filePath = resolveUploadsUrl(msg.file_path);
    const isAudio = msg.message_type === "audio" || (filePath && /\.(webm|m4a|mp3|wav|ogg|aac|opus)$/i.test(filePath));
    const isImage = msg.message_type === "image" || (filePath && /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(filePath));

    if (isAudio) {
      return (
        <div style={{ marginTop: 4 }}>
          {msg.content && <p style={{ margin: "0 0 6px 0", fontSize: 13 }}>{msg.content}</p>}
          <div style={{ background: "rgba(0,0,0,0.04)", padding: "8px 12px", borderRadius: 8 }}>
            <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}>
              <AudioOutlined style={{ color: "#059669" }} /> Voice Recording
            </div>
            <audio
              controls
              preload="auto"
              src={filePath}
              style={{ height: 36, maxWidth: 260, width: "100%" }}
              onError={(e) => {
                const target = e.target;
                const current = target.src;
                if (current.includes("localhost:") || current.includes("127.0.0.1:")) {
                  target.src = current.replace(/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, "https://suae-node.questdigiflex.com");
                } else if (current.includes("suae-node.questdigiflex.com")) {
                  target.src = current.replace("https://suae-node.questdigiflex.com", "https://suae-php.questdigiflex.com");
                }
              }}
            >
              Your browser does not support audio playback.
            </audio>
          </div>
        </div>
      );
    }

    if (isImage) {
      return (
        <div>
          {msg.content && <p style={{ margin: "0 0 6px 0", fontSize: 13 }}>{msg.content}</p>}
          <div style={{ borderRadius: 8, overflow: "hidden", maxWidth: 240, border: "1px solid #e2e8f0", background: "#ffffff" }}>
            <img
              src={filePath}
              alt="Attachment"
              style={{ maxHeight: 220, width: "100%", objectFit: "cover", display: "block", cursor: "pointer" }}
              onClick={() => window.open(filePath, "_blank")}
              onError={(e) => {
                const target = e.target;
                const current = target.src;
                if (current.includes("localhost:") || current.includes("127.0.0.1:")) {
                  target.src = current.replace(/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, "https://suae-node.questdigiflex.com");
                } else if (current.includes("suae-node.questdigiflex.com")) {
                  target.src = current.replace("https://suae-node.questdigiflex.com", "https://suae-php.questdigiflex.com");
                } else if (!target.dataset.triedGeneric) {
                  target.dataset.triedGeneric = "true";
                  const filename = filePath.split("/").pop();
                  target.src = `https://suae-php.questdigiflex.com/uploads/files/${filename}`;
                }
              }}
            />
          </div>
        </div>
      );
    }

    if (msg.message_type === "file" || filePath) {
      const fileName = msg.content || (filePath ? filePath.split("/").pop() : "Document");
      return (
        <div>
          {msg.content && msg.content !== fileName && <p style={{ margin: "0 0 6px 0", fontSize: 13 }}>{msg.content}</p>}
          <a
            href={filePath}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "#ffffff",
              padding: "6px 12px",
              borderRadius: 6,
              border: "1px solid #cbd5e1",
              color: "#2563eb",
              fontSize: 12,
              fontWeight: 500,
              textDecoration: "none"
            }}
          >
            <FileTextOutlined style={{ fontSize: 14, color: "#ef4444" }} />
            <span style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {fileName}
            </span>
            <DownloadOutlined />
          </a>
        </div>
      );
    }

    return <div style={{ fontSize: 13.5, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{msg.content}</div>;
  };

  const totalMessagesCount = conversations.reduce((acc, c) => acc + Number(c.total_messages || 0), 0);

  return (
    <div className="page-content" style={{ maxWidth: '100%', overflowX: 'hidden' }}>
      {/* Top Header matching theme */}
      <div className="page-head-gradient" style={{ flexDirection: 'row', justifyContent: 'space-between', textAlign: 'left', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <h2 style={{ justifyContent: 'flex-start', margin: 0 }}>
            <i className="fa fa-comments mr5"></i> Live Conversations
          </h2>
          <p className="ph-subtitle" style={{ textAlign: 'left', margin: 0, marginTop: 4 }}>
            Monitor and audit real-time live chat conversations between students and counsellors
          </p>
        </div>
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          loading={loading}
          onClick={fetchConversationsList}
          style={{
            background: 'rgba(255, 255, 255, 0.18)',
            borderColor: 'rgba(255, 255, 255, 0.35)',
            color: '#fff',
            fontWeight: 600,
            borderRadius: 8,
            height: '36px',
            boxShadow: 'none'
          }}
        >
          Refresh Data
        </Button>
      </div>

      <div className="page-pad">
        {/* Stats Cards */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12}>
            <Card size="small" style={{ borderRadius: 8, border: "1px solid #e2e8f0" }}>
              <Statistic
                title={<span style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>Active Conversation Threads</span>}
                value={conversations.length}
                prefix={<MessageOutlined style={{ color: "#059669" }} />}
                valueStyle={{ fontWeight: 700, color: "#0f172a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card size="small" style={{ borderRadius: 8, border: "1px solid #e2e8f0" }}>
              <Statistic
                title={<span style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>Total Recorded Messages</span>}
                value={totalMessagesCount}
                prefix={<CommentOutlined style={{ color: "#3b82f6" }} />}
                valueStyle={{ fontWeight: 700, color: "#0f172a" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Main Two-Column Layout */}
        <Row gutter={16}>
          {/* Left Column: Conversation Threads List */}
          <Col xs={24} md={9} lg={8}>
          <Card
            title={
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>All Conversations</span>
                <Badge count={conversations.length} style={{ backgroundColor: "#059669" }} />
              </div>
            }
            size="small"
            style={{ borderRadius: 8, border: "1px solid #e2e8f0", height: "calc(100vh - 270px)", display: "flex", flexDirection: "column" }}
            bodyStyle={{ padding: "12px", flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}
          >
            {/* Search Filter */}
            <div style={{ marginBottom: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              <Input
                prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
                placeholder="Search student or counsellor..."
                value={searchKeyword}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchKeyword(val);
                  if (!val) {
                    fetchConversationsList(dateRange, "");
                  }
                }}
                onPressEnter={() => fetchConversationsList(dateRange, searchKeyword)}
                allowClear
                style={{ borderRadius: 6, fontSize: 12 }}
              />
              <RangePicker
                value={dateRange}
                format="YYYY-MM-DD"
                placeholder={["Start date", "End date"]}
                style={{ width: "100%", borderRadius: 6, fontSize: 12 }}
                onChange={(dates) => {
                  const validDates = dates || [];
                  setDateRange(validDates);
                  fetchConversationsList(validDates, searchKeyword);
                }}
                allowClear
              />
            </div>

            {/* Conversation list */}
            <div style={{ flex: 1, overflowY: "auto" }}>
              {loading ? (
                <div style={{ padding: "40px 0", textAlign: "center" }}><Spin tip="Loading..." /></div>
              ) : conversations.length === 0 ? (
                <Empty description="No conversations found" style={{ margin: "40px 0" }} />
              ) : (
                conversations.map((conv, idx) => {
                  const isSelected = selectedConv && selectedConv.user1?.id === conv.user1?.id && selectedConv.user2?.id === conv.user2?.id;
                  const student = conv.student || conv.user2;
                  const counsellor = conv.counsellor || conv.user1;

                  return (
                    <div
                      key={idx}
                      onClick={() => selectConversation(conv)}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 8,
                        marginBottom: 8,
                        cursor: "pointer",
                        background: isSelected ? "#ecfdf5" : "#ffffff",
                        border: isSelected ? "1.5px solid #059669" : "1px solid #e2e8f0",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <Avatar size={32} style={{ background: isSelected ? "#059669" : "#3b82f6", fontWeight: 700 }}>
                            {student?.name ? student.name.charAt(0).toUpperCase() : "S"}
                          </Avatar>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>
                              {student?.name || "Student"}
                            </div>
                            <div style={{ fontSize: 11, color: "#64748b" }}>
                              <CustomerServiceOutlined style={{ marginRight: 3, color: "#059669" }} />
                              {counsellor?.name || "Counsellor"}
                            </div>
                          </div>
                        </div>
                        <span style={{ fontSize: 10, color: "#94a3b8" }}>
                          {conv.last_active ? moment(conv.last_active).format("DD MMM") : ""}
                        </span>
                      </div>

                      <div style={{ fontSize: 12, color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 4 }}>
                        {conv.last_message?.content || (conv.last_message?.message_type ? `[${conv.last_message.message_type}]` : "No messages")}
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                        <Tag color="cyan" style={{ fontSize: 10, padding: "0 4px" }}>
                          {conv.total_messages || 0} messages
                        </Tag>
                        {isSelected && (
                          <Tag color="success" style={{ fontSize: 10, padding: "0 4px", margin: 0 }}>
                            Active
                          </Tag>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </Col>

        {/* Right Column: Selected Conversation Transcript */}
        <Col xs={24} md={15} lg={16}>
          {selectedConv ? (
            <Card
              title={
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar size={38} style={{ background: "#3b82f6", fontWeight: 700 }}>
                      {selectedConv.student?.name ? selectedConv.student.name.charAt(0).toUpperCase() : "S"}
                    </Avatar>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>
                        {selectedConv.student?.name || "Student"}
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>
                        Assigned to: <span style={{ fontWeight: 600, color: "#059669" }}>{selectedConv.counsellor?.name || "Counsellor"}</span> &bull; {selectedConv.student?.email || ""}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="small"
                    icon={<ReloadOutlined />}
                    loading={loadingChat}
                    onClick={() => selectConversation(selectedConv)}
                    style={{ borderRadius: 6 }}
                  >
                    Refresh
                  </Button>
                </div>
              }
              size="small"
              style={{ borderRadius: 8, border: "1px solid #e2e8f0", height: "calc(100vh - 270px)", display: "flex", flexDirection: "column" }}
              bodyStyle={{ padding: "12px 16px", flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}
            >
              <div style={{ marginBottom: 10 }}>
                <Input
                  prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
                  placeholder="Filter chat messages in this transcript..."
                  value={chatSearch}
                  onChange={(e) => setChatSearch(e.target.value)}
                  allowClear
                  style={{ borderRadius: 6, fontSize: 12 }}
                />
              </div>

              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  flex: 1,
                  minHeight: 350,
                  overflowY: "auto",
                  padding: "16px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12
                }}
              >
                {loadingChat ? (
                  <div style={{ margin: "auto" }}><Spin tip="Loading chat transcript..." /></div>
                ) : filteredChatMessages.length === 0 ? (
                  <Empty description="No messages in this conversation" style={{ margin: "auto" }} />
                ) : (
                  filteredChatMessages.map((msg) => {
                    const isStudent = msg.sender_type === "STUDENT" || Number(msg.sender_id) === Number(selectedConv.student?.id);
                    return (
                      <div
                        key={msg.id}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: isStudent ? "flex-start" : "flex-end",
                          maxWidth: "75%",
                          alignSelf: isStudent ? "flex-start" : "flex-end"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: isStudent ? "#2563eb" : "#059669" }}>
                            {msg.sender_name || (isStudent ? selectedConv.student?.name : selectedConv.counsellor?.name)}
                          </span>
                          <span style={{ fontSize: 10, color: "#94a3b8" }}>
                            &bull; {moment(msg.created_at).format("hh:mm A, DD MMM")}
                          </span>
                        </div>

                        <div
                          style={{
                            background: isStudent ? "#f1f5f9" : "#ecfdf5",
                            color: "#0f172a",
                            border: isStudent ? "1px solid #e2e8f0" : "1px solid #a7f3d0",
                            padding: "8px 14px",
                            borderRadius: isStudent ? "0 12px 12px 12px" : "12px 0 12px 12px",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.03)"
                          }}
                        >
                          {renderMessageContent(msg)}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            </Card>
          ) : (
            <Card style={{ borderRadius: 8, border: "1px solid #e2e8f0", height: "calc(100vh - 270px)", display: "flex", justifyContent: "center", alignItems: "center" }}>
              <Empty description="Select a conversation from the left to view details" />
            </Card>
          )}
        </Col>
      </Row>
      </div>
    </div>
  );
}
