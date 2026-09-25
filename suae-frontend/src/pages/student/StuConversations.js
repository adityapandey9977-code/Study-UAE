/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  Input,
  Button,
  Avatar,
  Badge,
  Spin,
  Empty,
  Image,
  message
} from "antd";
import {
  MessageOutlined,
  SearchOutlined,
  ReloadOutlined,
  FileTextOutlined,
  DownloadOutlined,
  AudioOutlined,
  CustomerServiceOutlined
} from "@ant-design/icons";
import moment from "moment";
import ChatService from "../../services/ChatService";
import util from "../../utils/util";

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

export default function StuConversations(props) {
  const { cref } = props;
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stuDtl, setStuDtl] = useState({});
  const [messages, setMessages] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const closeModal = () => {
    setVisible(false);
    setMessages([]);
    setSearchKeyword("");
  };

  const fetchConversations = async (dtl) => {
    const currentDtl = dtl || stuDtl;
    if (!currentDtl.id && !currentDtl.user_id) return;

    setLoading(true);
    try {
      const studentUserId = currentDtl.user_id || currentDtl.id;
      const counsellorId = currentDtl.assigned_to;

      const chatParams = {
        student_id: currentDtl.id,
        user1_id: studentUserId,
        limit: 2000
      };
      if (counsellorId && !isNaN(Number(counsellorId)) && Number(counsellorId) > 0) {
        chatParams.user2_id = Number(counsellorId);
      }

      let chatRes = await ChatService.getAdminChatHistory(chatParams);
      // Fallback: If no messages found with specific counsellor filter, retrieve all student messages
      if (chatRes?.data?.success && (!chatRes.data.messages || chatRes.data.messages.length === 0) && chatParams.user2_id) {
        const fallbackRes = await ChatService.getAdminChatHistory({
          student_id: currentDtl.id,
          user1_id: studentUserId,
          limit: 2000
        });
        if (fallbackRes?.data?.success && fallbackRes.data.messages?.length > 0) {
          chatRes = fallbackRes;
        }
      }

      if (chatRes?.data?.success) {
        setMessages(chatRes.data.messages || []);
      }
    } catch (err) {
      console.error("Error loading chat history:", err);
      message.error(err.message || "Failed to load chat history");
    } finally {
      setLoading(false);
      setTimeout(scrollToBottom, 200);
    }
  };

  cref.current = {
    ...cref.current,
    openConversations: (dtl) => {
      setStuDtl(dtl || {});
      setVisible(true);
      fetchConversations(dtl);
    }
  };

  const filteredMessages = messages.filter((m) => {
    if (!searchKeyword) return true;
    const text = (m.content || "").toLowerCase();
    const sender = (m.sender_name || "").toLowerCase();
    return text.includes(searchKeyword.toLowerCase()) || sender.includes(searchKeyword.toLowerCase());
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
              <AudioOutlined style={{ color: "#059669" }} /> Voice Note
            </div>
            <audio
              controls
              preload="auto"
              src={filePath}
              style={{ height: 36, maxWidth: 260, width: "100%" }}
              onError={(e) => {
                console.warn("Audio playback failed for:", e.target.src);
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
                if (!target.dataset.triedGeneric) {
                  target.dataset.triedGeneric = "true";
                  const filename = filePath.split("/").pop();
                  target.src = `${getNodeOrigin()}/uploads/files/${filename}`;
                } else {
                  target.style.display = "none";
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

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingRight: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center", color: "#059669" }}>
              <MessageOutlined style={{ fontSize: 18 }} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", lineHeight: 1.2 }}>
                Student Conversations
              </div>
              <div style={{ fontSize: 12, color: "#64748b", fontWeight: 400, marginTop: 2 }}>
                {stuDtl.name} &bull; <span style={{ color: "#059669", fontWeight: 600 }}>{stuDtl.regno || "SIS Student"}</span>
              </div>
            </div>
          </div>
          <Button
            size="small"
            icon={<ReloadOutlined />}
            loading={loading}
            onClick={() => fetchConversations()}
            style={{ borderRadius: 6, fontSize: 12 }}
          >
            Refresh
          </Button>
        </div>
      }
      open={visible}
      onCancel={closeModal}
      footer={null}
      width={840}
      destroyOnClose
      maskClosable={false}
      bodyStyle={{ padding: "14px 20px 20px 20px", background: "#f8fafc" }}
      style={{ top: 25 }}
    >
      {/* Student & Assigned Counsellor Profile Bar */}
      <div
        style={{
          background: "#ffffff",
          padding: "12px 16px",
          borderRadius: 8,
          border: "1px solid #e2e8f0",
          marginBottom: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 10
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar size={40} style={{ background: "#3b82f6", fontWeight: 700 }}>
            {stuDtl.name ? stuDtl.name.charAt(0).toUpperCase() : "S"}
          </Avatar>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>
              {stuDtl.name || "Student"}
            </div>
            <div style={{ fontSize: 12, color: "#64748b" }}>
              {stuDtl.email || "No Email"} &bull; {stuDtl.mobile || "No Mobile"}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", fontWeight: 600 }}>
              Assigned Counsellor
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#059669" }}>
              <CustomerServiceOutlined style={{ marginRight: 4 }} />
              {stuDtl.assigned_to_name || "Unassigned"}
            </div>
          </div>
        </div>
      </div>

      {/* Search and message count bar */}
      <div style={{ marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <Input
          prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
          placeholder="Search chat transcript..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          allowClear
          style={{ borderRadius: 6, fontSize: 13, maxWidth: 350 }}
        />
        <div style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>
          Total Messages: <Badge count={messages.length} style={{ backgroundColor: "#059669" }} />
        </div>
      </div>

      {/* Chat transcript container */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          height: 450,
          overflowY: "auto",
          padding: "16px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 12
        }}
      >
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
            <Spin tip="Loading chat history..." />
          </div>
        ) : filteredMessages.length === 0 ? (
          <div style={{ margin: "auto", textAlign: "center" }}>
            <Empty
              description={
                searchKeyword
                  ? `No messages matching "${searchKeyword}"`
                  : "No chat history recorded yet between this student and counsellor."
              }
            />
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isStudent = msg.sender_type === "STUDENT" || Number(msg.sender_id) === Number(stuDtl.user_id);
            return (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: isStudent ? "flex-start" : "flex-end",
                  maxWidth: "80%",
                  alignSelf: isStudent ? "flex-start" : "flex-end"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: isStudent ? "#2563eb" : "#059669" }}>
                    {msg.sender_name || (isStudent ? stuDtl.name : "Counsellor")}
                  </span>
                  <span style={{ fontSize: 10, color: "#94a3b8" }}>
                    ({isStudent ? "Student" : (msg.sender_type || "Counsellor")})
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
    </Modal>
  );
}
