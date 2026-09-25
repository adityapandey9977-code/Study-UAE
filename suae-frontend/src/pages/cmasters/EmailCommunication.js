/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext, useRef } from "react";
import { Card, List, Tabs, message, Row, Col, Input, Button, Tag, Modal, Spin, Select, Pagination } from "antd";
import util from "../../utils/util";
import CmasterService from "../../services/CmasterService";
import { useLocation, useNavigate } from "react-router-dom";
import { SessionContext } from "../../context/SessionContext";
const { TabPane } = Tabs;
const { Search } = Input;
const { Option } = Select;

const StudentCommunication = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedSession, setSelectedSession, sessions } = useContext(SessionContext);

  const [students, setStudents] = useState([]);
  const [page, setPage] = useState({ cur_page: 1, page_size: 5, total_records: 0 });
  const [loadingList, setLoadingList] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [senderFilter, setSenderFilter] = useState("");
  const [senders, setSenders] = useState([]);
  const wh = window.innerHeight;

  const fetchSeqRef = useRef(0);

  const getMasterSessionId = () => {
    const qs = new URLSearchParams(location.search);
    const urlSessionId = qs.get("master_session_id");
    if (urlSessionId) {
      const parsed = parseInt(urlSessionId, 10);
      return parsed || null;
    }
    if (selectedSession?.key) return selectedSession.key;
    if (selectedSession?.id) return selectedSession.id;
    return null;
  };

  // ✅ Fetch list of students who have received communications
  const fetchStudents = async (p = 1, k = "", sender = "", ps) => {
    const seq = ++fetchSeqRef.current;
    try {
      setLoadingList(true);
      util.showLoader();
    //   const res = await axios.get("/student/communications", { params: { p, ps: page.page_size, k } });
    const params = { p, ps: ps || page.page_size, k, sender };
    const masterSessionId = getMasterSessionId();
    if (masterSessionId) params.master_session_id = masterSessionId;
    const res = await CmasterService.getStudentCommunications(params);
      if (seq !== fetchSeqRef.current) return;
      const list = res?.data?.result?.data || [];
      const pg = res?.data?.result?.page || {};
      const sendersList = res?.data?.result?.senders || [];
      const uniqueStudentsMap = new Map();
      (Array.isArray(list) ? list : []).forEach((s) => {
        const id = s?.id;
        if (!id) return;

        const existing = uniqueStudentsMap.get(id);
        if (!existing) {
          uniqueStudentsMap.set(id, s);
          return;
        }

        const existingDt = existing?.last_communication_at ? new Date(existing.last_communication_at) : null;
        const currentDt = s?.last_communication_at ? new Date(s.last_communication_at) : null;
        if (currentDt && (!existingDt || currentDt > existingDt)) {
          uniqueStudentsMap.set(id, s);
        }
      });
      setStudents(Array.from(uniqueStudentsMap.values()));
      setPage(pg);
      const uniqueSendersMap = new Map();
      (Array.isArray(sendersList) ? sendersList : []).forEach((s) => {
        const name = (s?.name || "").trim();
        const email = (s?.email || "").trim();
        if (!name && !email) return;

        const key = (email || name).toLowerCase();
        const existing = uniqueSendersMap.get(key);
        if (!existing) {
          uniqueSendersMap.set(key, { ...s, name, email });
          return;
        }

        uniqueSendersMap.set(key, {
          ...existing,
          name: existing.name || name,
          email: existing.email || email,
        });
      });
      const uniqueSenders = Array.from(uniqueSendersMap.values()).sort((a, b) =>
        (a?.name || "").localeCompare(b?.name || "")
      );
      setSenders(uniqueSenders);
    } catch (e) {
      if (seq !== fetchSeqRef.current) return;
      message.error(e.message || "Failed to load students");
    } finally {
      if (seq === fetchSeqRef.current) {
        setLoadingList(false);
        util.hideLoader();
      }
    }
  };

  // ✅ Fetch detail (emails + WhatsApp) for selected student
  const fetchStudentDetail = async (studentId) => {
    try {
      setLoadingDetail(true);
      util.showLoader();
    //   const res = await axios.get(`/student/${studentId}/communications`);
    const res = await CmasterService.getStudentCommunicationById(studentId);
      const d = res?.data?.result || null;
      if (d) {
        d.emails = Array.isArray(d.emails) ? d.emails.sort((a,b)=> new Date(b.created) - new Date(a.created)) : [];
        d.whatsapps = Array.isArray(d.whatsapps) ? d.whatsapps.sort((a,b)=> new Date(b.created) - new Date(a.created)) : [];
      }
      setDetail(d);
      setSelectedStudentId(studentId);
      setIsModalOpen(true);
    } catch (e) {
      message.error(e.message || "Failed to load student communications");
    } finally {
      setLoadingDetail(false);
      util.hideLoader();
    }
  };

  useEffect(() => {
    const qs = new URLSearchParams(location.search);
    const urlSessionId = qs.get("master_session_id");
    if (!urlSessionId) return;

    const parsedId = parseInt(urlSessionId, 10);
    if (!parsedId) return;

    if (selectedSession?.key === parsedId || selectedSession?.id === parsedId) return;

    const matched = sessions?.find((s) => Number(s?.key) === parsedId || Number(s?.id) === parsedId);
    if (matched) {
      setSelectedSession(matched);
      localStorage.setItem("selectedSession", JSON.stringify(matched));
    }
  }, [location.search, sessions, selectedSession, setSelectedSession]);

  useEffect(() => {
    const handler = (e) => {
      const next = e?.detail;
      const nextId = next?.key || next?.id;
      if (!nextId) return;

      const current = new URLSearchParams(location.search);
      current.set("master_session_id", String(nextId));
      if (next?.name) current.set("session_name", String(next.name));
      current.delete("session");

      navigate({ search: current.toString() }, { replace: true });
      setPage((prev) => ({ ...prev, cur_page: 1 }));
    };

    window.addEventListener("sessionChanged", handler);
    return () => window.removeEventListener("sessionChanged", handler);
  }, [keyword, senderFilter, location.search, navigate, page.page_size]);

  useEffect(() => {
    fetchStudents(1, keyword, senderFilter, page.page_size);
  }, [location.search, selectedSession]);

  // Handle pagination change
  const handlePageChange = (pageNumber, pageSize) => {
    setPage(prev => ({ ...prev, cur_page: pageNumber, page_size: pageSize }));
    fetchStudents(pageNumber, keyword, senderFilter, pageSize);
  };

  // Handle sender filter change
  const handleSenderFilterChange = (value) => {
    setSenderFilter(value);
    setPage(prev => ({ ...prev, cur_page: 1 }));
    fetchStudents(1, keyword, value, page.page_size);
  };

  return (
    <div className="page-content">
      <div className="page-head-gradient">
          <div>
              <h2>
                  <i className="fa fa-comments"></i> Student Communications
              </h2>
              <p className="ph-subtitle">View all email and WhatsApp history per student.</p>
          </div>
      </div>

      <div className="page-pad">
        <style>{`.stu-comm-search .ant-input-group-addon .ant-btn { background: linear-gradient(135deg, #588d93, #568cb1) !important; color: #fff !important; border: none !important; font-weight: 600 !important; border-radius: 0 8px 8px 0 !important; } .stu-comm-search .ant-input::placeholder { color: #64748b !important; font-weight: 600 !important; font-size: 14px !important; opacity: 1 !important; } .stu-comm-select .ant-select-selection__placeholder { color: #313740 !important; font-weight: 600 !important; font-size: 14px !important; opacity: 1 !important; }`}</style>
        <Card size="small" bordered style={{ borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <Row gutter={[16, 16]}>
            {/* Students list occupies full width */}
            <Col xs={24}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, gap: 8 }}>
                <Search
                  className="stu-comm-search"
                  placeholder="Search by name, reg no, or email"
                  allowClear
                  value={keyword}
                  onChange={(e) => {
                    const v = e?.target?.value || "";
                    setKeyword(v);
                    if (!v) {
                      fetchStudents(1, "", senderFilter, page.page_size);
                    }
                  }}
                  onSearch={(val) => {
                    setKeyword(val);
                    fetchStudents(1, val, senderFilter, page.page_size);
                  }}
                  style={{ flex: 1 }}
                  enterButton={<span style={{ background: 'linear-gradient(135deg, #588d93, #568cb1)', color: '#fff', fontWeight: 600, padding: '0 16px', borderRadius: '0 6px 6px 0' }}>Search</span>}
                />
                <Select
                  className="stu-comm-select"
                  placeholder={`Filter by sender${senders?.length ? ` (${senders.length})` : ""}`}
                  allowClear
                  style={{ width: 200 }}
                  value={senderFilter || undefined}
                  onChange={handleSenderFilterChange}
                >
                  {senders.map(sender => (
                    <Option key={`${sender.name || ""}__${sender.email || ""}`} value={sender.name}>
                      {sender.name}{sender.email ? ` (${sender.email})` : ""}
                    </Option>
                  ))}
                </Select>
                <Button
                  onClick={() => {
                    setKeyword("");
                    setSenderFilter("");
                    setPage(prev => ({ ...prev, cur_page: 1 }));
                    fetchStudents(1, "", "", page.page_size);
                  }}
                  loading={loadingList}
                  style={{ background: 'linear-gradient(135deg, #588d93, #568cb1)', color: '#fff', border: 'none', fontWeight: 600, borderRadius: 8 }}
                >
                  Refresh
                </Button>
              </div>

              <List
                loading={loadingList}
                itemLayout="vertical"
                dataSource={students}
                style={{
                  maxHeight: wh - 220,
                  overflowY: "auto",
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  padding: 8,
                }}
                renderItem={(s) => (
                  <List.Item
                    key={s.id}
                    style={{
                      cursor: "pointer",
                      background: selectedStudentId === s.id ? "#f0f7ff" : "#fff",
                      padding: 14,
                      borderRadius: 10,
                      marginBottom: 8,
                      transition: "all .2s ease",
                      border: selectedStudentId === s.id ? "1px solid #588d93" : "1px solid #f0f0f0",
                    }}
                    onClick={() => fetchStudentDetail(s.id)}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: '#1e293b' }}>{s.student_name}</div>
                        <div style={{ fontSize: 13, color: "#475569", marginTop: 2 }}>
                          {s.student_email} • {s.student_mobile}
                        </div>
                        <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>Reg No: <span style={{ fontWeight: 600 }}>{s.regno}</span></div>
                        {s.last_communication_at && (
                          <div style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>
                            Last: {util.getDate(s.last_communication_at, "DD MMM YYYY @ hh:mm A")}
                            {s.last_sender_name && (
                              <span style={{ color: "#475569" }}>
                                {' '}by {s.last_sender_name}
                                {s.last_sender_email && (
                                  <span style={{ color: "#64748b" }}> ({s.last_sender_email})</span>
                                )}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 13, color: "#475569", fontWeight: 500 }}>
                          Emails: <Tag color="blue" style={{ fontSize: 12, fontWeight: 600 }}>{s.email_count}</Tag>
                        </div>
                        <div style={{ fontSize: 13, color: "#475569", fontWeight: 500, marginTop: 4 }}>
                          WhatsApp: <Tag color="green" style={{ fontSize: 12, fontWeight: 600 }}>{s.whatsapp_count}</Tag>
                        </div>
                      </div>
                    </div>
                  </List.Item>
                )}
              />

              {/* Pagination */}
              {page.total_records > 0 && (
                <div style={{ marginTop: 16, textAlign: 'center' }}>
                  <Pagination
                    current={page.cur_page}
                    pageSize={page.page_size}
                    total={page.total_records}
                    showSizeChanger
                    showQuickJumper
                    showTotal={(total, range) => (
                      <span style={{ background: 'linear-gradient(135deg, #588d93, #568cb1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 700, fontSize: 13 }}>
                        {range[0]}–{range[1]} of {total} students
                      </span>
                    )}
                    onChange={handlePageChange}
                    onShowSizeChange={handlePageChange}
                    pageSizeOptions={['5', '10', '20', '50']}
                  />
                </div>
              )}
            </Col>
          </Row>
        </Card>
      </div>

      {/* Detail Modal */}
      <Modal
        open={isModalOpen}
        title={detail ? (
          <div>
            <div style={{ fontWeight: 700 }}>{detail.student?.student_name} <span style={{ color: '#888', fontSize: 12 }}>({detail.student?.regno})</span></div>
            <div style={{ color: '#666', fontSize: 12 }}>{detail.student?.student_email} • {detail.student?.student_mobile}</div>
            <div style={{ color: '#999', fontSize: 12 }}>{detail.student?.country_name} • {detail.student?.discipline_name}</div>
          </div>
        ) : 'Student Communications'}
        onCancel={() => { setIsModalOpen(false); setDetail(null); }}
        footer={null}
        width={800}
      >
        <Spin spinning={loadingDetail}>
          {detail ? (
            <Tabs defaultActiveKey="email">
              <TabPane tab={`Email (${(detail.emails || []).length})`} key="email">
                {(detail.emails || []).length ? (
                  <List
                    size="small"
                    dataSource={detail.emails}
                    renderItem={(it) => (
                      <List.Item key={it.id}>
                        <Card size="small" style={{ borderRadius: 8, background: "#fafafa" }}>
                          <div style={{ fontWeight: 600 }}>{it.subject}</div>
                          <div style={{ fontSize: 12, color: "#888" }}>
                            By {it.created_by_name || 'Unknown'} 
                            {it.sent_by_email && (
                              <span style={{ color: "#666" }}> ({it.sent_by_email})</span>
                            )}
                            {it.source_type === 'campaign' && (
                              <span style={{ color: "#1890ff", marginLeft: 8 }}>
                                📧 Campaign: {it.campaign_name}
                              </span>
                            )}
                            {' '}— {util.getDate(it.created, "DD MMM YYYY @ hh:mm A")}
                          </div>
                          <div
                            style={{ marginTop: 8, fontSize: 13 }}
                            dangerouslySetInnerHTML={{ __html: it.body || "<i>No content</i>" }}
                          />
                        </Card>
                      </List.Item>
                    )}
                  />
                ) : (
                  <div style={{ color: "#888" }}>No email communications found.</div>
                )}
              </TabPane>
              <TabPane tab={`WhatsApp (${(detail.whatsapps || []).length})`} key="whatsapp">
                {(detail.whatsapps || []).length ? (
                  <List
                    size="small"
                    dataSource={detail.whatsapps}
                    renderItem={(it) => (
                      <List.Item key={it.id}>
                        <Card size="small" style={{ borderRadius: 8, background: "#fafafa" }}>
                          <div style={{ color: "#333" }}>{it.msg}</div>
                          <div style={{ color: "#888", fontSize: 12, marginTop: 8 }}>
                            By {it.created_by_name || 'Unknown'}
                            {it.sent_by_mobile && (
                              <span style={{ color: "#666" }}> ({it.sent_by_mobile})</span>
                            )}
                            {it.source_type === 'campaign' && (
                              <span style={{ color: "#52c41a", marginLeft: 8 }}>
                                📱 Campaign: {it.campaign_name}
                              </span>
                            )}
                            {' '}— {util.getDate(it.created, "DD MMM YYYY @ hh:mm A")}
                          </div>
                        </Card>
                      </List.Item>
                    )}
                  />
                ) : (
                  <div style={{ color: "#888" }}>No WhatsApp messages found.</div>
                )}
              </TabPane>
            </Tabs>
          ) : (
            <div style={{ color: '#888' }}>No data</div>
          )}
        </Spin>
      </Modal>
    </div>
  );
};

export default StudentCommunication;
