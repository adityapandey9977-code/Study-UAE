// /* eslint-disable no-unused-vars */
// /* eslint-disable react-hooks/exhaustive-deps */
// import React, { useState, useEffect, useRef, useMemo } from 'react';
// import {
//   Table,
//   Button,
//   Modal,
//   Card,
//   Input,
//   Row,
//   Col,
//   message,
//   Spin,
//   Empty,
//   Tag,
//   Form,
//   Typography,
//   Divider,
// } from 'antd';
// import { SearchOutlined, PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
// import CmasterService from '../../services/CmasterService';

// const { Title, Text } = Typography;

// const BlackListCountry = ({ InstituteListPage = false, instituteId: propInstituteId }) => {
//   const [blacklistedCountries, setBlacklistedCountries] = useState([]);
//   const [instituteId, setInstituteId] = useState(propInstituteId || '');
//   const [allCountries, setAllCountries] = useState([]);
//   const [searchText, setSearchText] = useState('');
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [editingCountry, setEditingCountry] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [listLoading, setListLoading] = useState(false);
//   const [tableSearch, setTableSearch] = useState('');
//   const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

//   const formRef = useRef({});
//   const [editForm] = Form.useForm();

//   // 🔹 Load instituteId only if not passed as prop
//   useEffect(() => {
//     if (propInstituteId) return; // Skip if parent provided ID

//     const fetchInstituteId = async () => {
//       setLoading(true);
//       try {
//         const res = await CmasterService.getInstituteId();
//         const id = res.data?.data?.institute_id;
//         if (!id) throw new Error("institute_id missing");
//         setInstituteId(id);
//       } catch (err) {
//         console.error("Failed to get instituteId:", err);
//         message.error("Could not load institute.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchInstituteId();
//   }, [propInstituteId]);

//   // 🔹 Load all active countries
//   useEffect(() => {
//     const loadCountries = async () => {
//       try {
//         const res = await CmasterService.allCountries();
//         if (res.data?.code === 200 && Array.isArray(res.data.result?.data)) {
//           const countries = res.data.result.data
//             .filter((c) => c.status * 1 === 1)
//             .map((c) => ({ name: c.name, code: c.code }));
//           setAllCountries(countries);
//         } else {
//           message.warning("No countries available.");
//         }
//       } catch (err) {
//         console.error("Load countries failed:", err);
//         message.error("Failed to load countries.");
//       }
//     };

//     loadCountries();
//   }, []);

//   // 🔹 Refresh blacklist when instituteId changes
//   const refreshBlacklist = () => {
//     if (!instituteId) return;
//     setListLoading(true);
//     CmasterService.showAllBlacklistedCountries({ institute_id: instituteId })
//       .then((res) => {
//         if (res.data?.code === 200 && Array.isArray(res.data.data)) {
//           const list = res.data.data.map((c) => ({
//             id: c.id,
//             institute_id: c.institute_id,
//             name: c.country_name,
//             code: c.country_code,
//           }));
//           setBlacklistedCountries(list);
//         } else {
//           setBlacklistedCountries([]);
//         }
//       })
//       .catch((err) => {
//         console.error("Failed to load blacklisted countries:", err);
//       })
//       .finally(() => {
//         setListLoading(false);
//       });
//   };

//   useEffect(() => {
//     refreshBlacklist();
//   }, [instituteId]);

//   // 🔹 Available countries (not blacklisted + search)
//   const availableCountries = useMemo(() => {
//     return allCountries
//       .filter((country) => !blacklistedCountries.some((bc) => bc.code === country.code))
//       .filter((country) =>
//         country.name.toLowerCase().includes(searchText.toLowerCase()) ||
//         country.code.toLowerCase().includes(searchText.toLowerCase())
//       );
//   }, [allCountries, blacklistedCountries, searchText]);

//   // 🔹 Filtered & paginated data
//   const filteredData = useMemo(() => {
//     return blacklistedCountries
//       .filter((item) =>
//         item.name.toLowerCase().includes(tableSearch.toLowerCase()) ||
//         item.code.toLowerCase().includes(tableSearch.toLowerCase())
//       )
//       .map((c) => ({ key: c.id, ...c }));
//   }, [blacklistedCountries, tableSearch]);

//   const paginatedData = useMemo(() => {
//     const { current, pageSize } = pagination;
//     const start = (current - 1) * pageSize;
//     return filteredData.slice(start, start + pageSize);
//   }, [filteredData, pagination]);

//   // 🔹 Add country
//   const handleAdd = (country) => {
//     const payload = {
//       institute_id: instituteId,
//       country_code: country.code,
//       country_name: country.name,
//     };

//     CmasterService.addBlacklistedCountry(payload)
//       .then(() => {
//         message.success(`${country.name} added to blacklist`);
//         setShowAddModal(false);
//         refreshBlacklist();
//       })
//       .catch((err) => {
//         console.error("Add failed:", err);
//         message.error(`Failed to add ${country.name}`);
//       });
//   };

//   // 🔹 Remove country
//   const handleRemove = (country) => {
//     Modal.confirm({
//       title: 'Confirm Removal',
//       content: <div>Remove <strong>{country.name}</strong>?</div>,
//       okText: 'Remove',
//       okType: 'danger',
//       cancelText: 'Cancel',
//       onOk() {
//         const payload = { id: country.id, institute_id: country.institute_id };
//         CmasterService.removeBlacklistedCountry(payload)
//           .then((res) => {
//             if (res.data?.code === 200) {
//               message.success(`${country.name} removed`);
//               refreshBlacklist();
//             } else {
//               message.error(res.data?.message || "Failed to remove.");
//             }
//           })
//           .catch((err) => {
//             console.error("Remove failed:", err);
//             message.error(`Failed to remove ${country.name}`);
//           });
//       },
//     });
//   };

//   // 🔹 Edit country
//   const openEditModal = (country) => {
//     setEditingCountry(country);
//     editForm.setFieldsValue({
//       country_name: country.name,
//       country_code: country.code,
//     });
//     setShowEditModal(true);
//   };

//   const handleEdit = () => {
//     editForm.validateFields().then((values) => {
//       const payload = {
//         id: editingCountry.id,
//         institute_id: editingCountry.institute_id,
//         country_code: values.country_code.toUpperCase(),
//         country_name: values.country_name,
//       };

//       CmasterService.editBlacklistedCountry(payload)
//         .then((res) => {
//           if (res.data?.code === 200) {
//             message.success(`${values.country_name} updated`);
//             setShowEditModal(false);
//             refreshBlacklist();
//           } else {
//             message.error(res.data?.message || "Update failed");
//           }
//         })
//         .catch((err) => {
//           console.error("Edit failed:", err);
//           message.error("Failed to update.");
//         });
//     }).catch(() => {
//       message.warning("Please fill all fields correctly.");
//     });
//   };

//   // 🔹 Open Add Modal
//   formRef.current = {
//     open: () => {
//       setSearchText('');
//       setShowAddModal(true);
//     },
//   };

//   // 🔹 Loading state
//   if (loading || (!instituteId && !propInstituteId)) {
//     return (
//       <div className="page-content page-pad">
//         <Card>
//           <div className="flex items-center justify-center py-12">
//             <Spin size="large" tip="Loading..." />
//           </div>
//         </Card>
//       </div>
//     );
//   }

//   return (
//     <div className={InstituteListPage ? '' : 'page-content'}>
//       <div className="page-head d-flex flex-wrap items-center justify-between gap-3">
//         <Title level={3} className="m-0 text-gray-800">Blacklisted Countries</Title>
//         <Button
//           type="primary"
//           icon={<PlusOutlined />}
//           onClick={() => formRef.current.open()}
//           size="large"
//         >
//           Add Country
//         </Button>
//       </div>
//       <div className={InstituteListPage ? '' : 'page-pad'}>
//         <Card
//           bordered={false}
//           className="shadow-md rounded-lg overflow-hidden"
//           bodyStyle={{ padding: '16px' }}
//           style={{ height: InstituteListPage ? 'calc(100vh - 200px)' : 'calc(100vh - 150px)' }}
//         >
//           {blacklistedCountries.length > 0 ? (
//             <>
//               <div className="flex flex-wrap items-center justify-between px-6 py-4 border-b bg-gray-50">
//                 <Text strong className="text-lg">
//                   Blacklisted Countries ({filteredData.length})
//                 </Text>
//                 <Input
//                   placeholder="Search country or code..."
//                   prefix={<SearchOutlined />}
//                   value={tableSearch}
//                   onChange={(e) => {
//                     setTableSearch(e.target.value);
//                     setPagination((prev) => ({ ...prev, current: 1 }));
//                   }}
//                   style={{ width: 300 }}
//                   allowClear
//                 />
//               </div>

//               <Table
//                 dataSource={paginatedData}
//                 columns={[
//                   {
//                     title: 'Country',
//                     dataIndex: 'name',
//                     render: (_, record) => (
//                       <div className="flex items-center gap-2">
//                         <Tag color="error" className="font-mono">{record.code}</Tag>
//                         <span className="font-semibold">
//                           {record.name.charAt(0).toUpperCase() + record.name.slice(1).toLowerCase()}
//                         </span>
//                       </div>
//                     ),
//                   },
//                   {
//                     title: 'Action',
//                     key: 'action',
//                     width: 180,
//                     render: (_, record) => (
//                       <div className="flex gap-2">
//                         {/* <Button type="primary" icon={<EditOutlined />} size="small" onClick={() => openEditModal(record)}>
//                           Edit
//                         </Button> */}
//                         <Button danger icon={<DeleteOutlined />} size="small" onClick={() => handleRemove(record)}>
//                           Remove
//                         </Button>
//                       </div>
//                     ),
//                   },
//                 ]}
//                 rowKey="id"
//                 loading={listLoading}
//                 pagination={{
//                   current: pagination.current,
//                   pageSize: pagination.pageSize,
//                   total: filteredData.length,
//                   showSizeChanger: true,
//                   pageSizeOptions: ['5', '10', '20', '50'],
//                   showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
//                   position: ['bottomCenter'],
//                 }}
//                 onChange={(pag) => setPagination(pag)}
//                 scroll={{ x: 'max-content', y: 'calc(100vh - 350px)' }}
//                 locale={{
//                   emptyText: <Empty description="No blacklisted countries yet" />,
//                 }}
//               />
//             </>
//           ) : (
//             <Empty
//               image={Empty.PRESENTED_IMAGE_SIMPLE}
//               description="No blacklisted countries yet"
//             />
//           )}
//         </Card>
//       </div>

//       {/* Add Modal */}
//       <Modal
//         title={<div className="font-semibold text-lg text-red-600">Add Country to Blacklist</div>}
//         open={showAddModal}
//         onCancel={() => setShowAddModal(false)}
//         footer={null}
//         width={900}
//         bodyStyle={{ maxHeight: '80vh' }}
//         maskClosable={false}
//         destroyOnClose
//       >
//         <Card
//           size="small"
//           title={<Text strong className="text-gray-700">Available Countries</Text>}
//           extra={
//             <Input
//               placeholder="Search by name or code..."
//               prefix={<SearchOutlined />}
//               value={searchText}
//               onChange={(e) => setSearchText(e.target.value)}
//               style={{ width: 280 }}
//               allowClear
//             />
//           }
//           bordered={false}
//         >
//           {availableCountries.length === 0 ? (
//             <Empty
//               description={
//                 searchText ? `No countries match "${searchText}"` : 'No countries available'
//               }
//             />
//           ) : (
//             <Table
//               rowKey="code"
//               dataSource={availableCountries}
//               pagination={{ pageSize: 5, showSizeChanger: false }}
//               bordered
//             >
//               <Table.Column
//                 title="Country Name"
//                 dataIndex="name"
//                 key="name"
//                 render={(text) => <span className="font-medium text-gray-800">{text}</span>}
//               />
//               <Table.Column
//                 title="Code"
//                 dataIndex="code"
//                 key="code"
//                 render={(code) => <Text type="secondary"><strong>{code}</strong></Text>}
//               />
//               <Table.Column
//                 title="Action"
//                 key="action"
//                 render={(_, record) => (
//                   <Button
//                     type="primary"
//                     size="small"
//                     onClick={() => handleAdd(record)}
//                   >
//                     Add
//                   </Button>
//                 )}
//               />
//             </Table>
//           )}
//         </Card>

//       </Modal>

//       {/* Edit Modal */}
//       <Modal
//         title="✏️ Edit Country"
//         open={showEditModal}
//         onOk={handleEdit}
//         onCancel={() => setShowEditModal(false)}
//         okText="Save Changes"
//         cancelText="Cancel"
//         width={500}
//       >
//         <Form form={editForm} layout="vertical" autoComplete="off">
//           <Form.Item name="country_name" label="Country Name" rules={[{ required: true }]}>
//             <Input placeholder="e.g. Nepal" />
//           </Form.Item>
//           <Form.Item
//             name="country_code"
//             label="Country Code"
//             rules={[
//               { required: true },
//               { len: 2, message: '2 letters' },
//               { pattern: /^[A-Za-z]+$/, message: 'Letters only' },
//             ]}
//           >
//             <Input placeholder="e.g. NP" maxLength={2} />
//           </Form.Item>
//         </Form>
//       </Modal>
//     </div>
//   );
// };

// export default BlackListCountry;


/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Table,
  Button,
  Modal,
  Card,
  Input,
  Row,
  Col,
  message,
  Spin,
  Empty,
  Tag,
  Form,
  Typography,
  Divider,
} from 'antd';
import { SearchOutlined, PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import CmasterService from '../../services/CmasterService';

const { Title, Text } = Typography;

const BlackListCountry = ({ InstituteListPage = false, instituteId: propInstituteId }) => {
  const [blacklistedCountries, setBlacklistedCountries] = useState([]);
  const [instituteId, setInstituteId] = useState(propInstituteId || '');
  const [allCountries, setAllCountries] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCountry, setEditingCountry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [tableSearch, setTableSearch] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  const formRef = useRef({});
  const [editForm] = Form.useForm();

  // 🔹 Load instituteId only if not passed as prop
  useEffect(() => {
    if (propInstituteId) return; // Skip if parent provided ID

    const fetchInstituteId = async () => {
      setLoading(true);
      try {
        const res = await CmasterService.getInstituteId();
        const id = res.data?.data?.institute_id;
        if (!id) throw new Error("institute_id missing");
        setInstituteId(id);
      } catch (err) {
        console.error("Failed to get instituteId:", err);
        message.error("Could not load institute.");
      } finally {
        setLoading(false);
      }
    };

    fetchInstituteId();
  }, [propInstituteId]);

  // 🔹 Load all active countries
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const res = await CmasterService.allCountries();
        if (res.data?.code === 200 && Array.isArray(res.data.result?.data)) {
          const countries = res.data.result.data
            .filter((c) => c.status * 1 === 1)
            .map((c) => ({ name: c.name, code: c.code, id: c.id }));
          setAllCountries(countries);
        } else {
          message.warning("No countries available.");
        }
      } catch (err) {
        console.error("Load countries failed:", err);
        message.error("Failed to load countries.");
      }
    };

    loadCountries();
  }, []);

  // 🔹 Refresh blacklist when instituteId changes
  const refreshBlacklist = () => {
    if (!instituteId) return;
    setListLoading(true);
    CmasterService.showAllBlacklistedCountries({ institute_id: instituteId })
      .then((res) => {
        if (res.data?.code === 200 && Array.isArray(res.data.data)) {
          const list = res.data.data.map((c) => ({
            id: c.id,
            institute_id: c.institute_id,
            name: c.country_name,
            code: c.country_code,
          }));
          setBlacklistedCountries(list);
        } else {
          setBlacklistedCountries([]);
        }
      })
      .catch((err) => {
        console.error("Failed to load blacklisted countries:", err);
      })
      .finally(() => {
        setListLoading(false);
      });
  };

  useEffect(() => {
    refreshBlacklist();
  }, [instituteId]);

  // 🔹 Available countries (not blacklisted + search)
  const availableCountries = useMemo(() => {
    return allCountries
      .filter((country) => !blacklistedCountries.some((bc) => bc.code === country.code))
      .filter((country) =>
        country.name.toLowerCase().includes(searchText.toLowerCase()) ||
        country.code.toLowerCase().includes(searchText.toLowerCase())
      );
  }, [allCountries, blacklistedCountries, searchText]);

  // 🔹 Filtered & paginated data
  const filteredData = useMemo(() => {
    return blacklistedCountries
      .filter((item) =>
        item.name.toLowerCase().includes(tableSearch.toLowerCase()) ||
        item.code.toLowerCase().includes(tableSearch.toLowerCase())
      )
      .map((c) => ({ key: c.id, ...c }));
  }, [blacklistedCountries, tableSearch]);

  const paginatedData = useMemo(() => {
    const { current, pageSize } = pagination;
    const start = (current - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, pagination]);

  // 🔹 Add country
  const handleAdd = (country) => {
    const payload = {
      institute_id: instituteId,
      country_code: country.id,
      country_name: country.name,
    };

    CmasterService.addBlacklistedCountry(payload)
      .then(() => {
        message.success(`${country.name} added to blacklist`);
        setShowAddModal(false);
        refreshBlacklist();
      })
      .catch((err) => {
        console.error("Add failed:", err);
        message.error(`Failed to add ${country.name}`);
      });
  };

  // 🔹 Remove country
  const handleRemove = (country) => {
    Modal.confirm({
      title: 'Confirm Removal',
      content: <div>Remove <strong>{country.name}</strong>?</div>,
      okText: 'Remove',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        const payload = { id: country.id, institute_id: country.institute_id };
        CmasterService.removeBlacklistedCountry(payload)
          .then((res) => {
            if (res.data?.code === 200) {
              message.success(`${country.name} removed`);
              refreshBlacklist();
            } else {
              message.error(res.data?.message || "Failed to remove.");
            }
          })
          .catch((err) => {
            console.error("Remove failed:", err);
            message.error(`Failed to remove ${country.name}`);
          });
      },
    });
  };

  // 🔹 Edit country
  const openEditModal = (country) => {
    setEditingCountry(country);
    editForm.setFieldsValue({
      country_name: country.name,
      country_code: country.code,
    });
    setShowEditModal(true);
  };

  const handleEdit = () => {
    editForm.validateFields().then((values) => {
      const payload = {
        id: editingCountry.id,
        institute_id: editingCountry.institute_id,
        country_code: values.country_code.toUpperCase(),
        country_name: values.country_name,
      };

      CmasterService.editBlacklistedCountry(payload)
        .then((res) => {
          if (res.data?.code === 200) {
            message.success(`${values.country_name} updated`);
            setShowEditModal(false);
            refreshBlacklist();
          } else {
            message.error(res.data?.message || "Update failed");
          }
        })
        .catch((err) => {
          console.error("Edit failed:", err);
          message.error("Failed to update.");
        });
    }).catch(() => {
      message.warning("Please fill all fields correctly.");
    });
  };

  // 🔹 Open Add Modal
  formRef.current = {
    open: () => {
      setSearchText('');
      setShowAddModal(true);
    },
  };

  // 🔹 Loading state
  if (loading || (!instituteId && !propInstituteId)) {
    return (
      <div className="page-content page-pad">
        <Card>
          <div className="flex items-center justify-center py-12">
            <Spin size="large" tip="Loading..." />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={InstituteListPage ? '' : 'page-content'}>
      <div className="page-head-gradient" style={{ justifyContent: 'space-between', flexDirection: 'row' }}>
        <h2>Blacklisted Countries</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => formRef.current.open()}
          style={{ background: '#fff', color: '#588d93', border: 'none', fontWeight: 600, borderRadius: 8 }}
        >
          Add Country
        </Button>
      </div>
      <div className={InstituteListPage ? '' : 'page-pad'}>
        <Card
          bordered={false}
          className="shadow-md rounded-lg overflow-hidden"
          bodyStyle={{ padding: '16px' }}
          style={{ height: InstituteListPage ? 'calc(100vh - 200px)' : 'calc(100vh - 150px)' }}
        >
          {blacklistedCountries.length > 0 ? (
            <>
              <div className="flex flex-wrap items-center justify-between px-6 py-4 border-b bg-gray-50">
                <Text strong className="text-lg">
                  Blacklisted Countries ({filteredData.length})
                </Text>
                <Input
                  placeholder="Search country or code..."
                  prefix={<SearchOutlined />}
                  value={tableSearch}
                  onChange={(e) => {
                    setTableSearch(e.target.value);
                    setPagination((prev) => ({ ...prev, current: 1 }));
                  }}
                  style={{ width: 300 }}
                  allowClear
                />
              </div>

              <Table
                dataSource={paginatedData}
                columns={[
                  {
                    title: 'Country',
                    dataIndex: 'name',
                    render: (_, record) => (
                      <div className="flex items-center gap-2">
                        <Tag color="error" className="font-mono">{record.code}</Tag>
                        <span className="font-semibold">
                          {record.name.charAt(0).toUpperCase() + record.name.slice(1).toLowerCase()}
                        </span>
                      </div>
                    ),
                  },
                  {
                    title: 'Action',
                    key: 'action',
                    width: 180,
                    render: (_, record) => (
                      <div className="flex gap-2">
                        {/* <Button type="primary" icon={<EditOutlined />} size="small" onClick={() => openEditModal(record)}>
                          Edit
                        </Button> */}
                        <Button danger icon={<DeleteOutlined />} size="small" onClick={() => handleRemove(record)}>
                          Remove
                        </Button>
                      </div>
                    ),
                  },
                ]}
                rowKey="id"
                loading={listLoading}
                pagination={{
                  current: pagination.current,
                  pageSize: pagination.pageSize,
                  total: filteredData.length,
                  showSizeChanger: true,
                  pageSizeOptions: ['5', '10', '20', '50'],
                  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                  position: ['bottomCenter'],
                }}
                onChange={(pag) => setPagination(pag)}
                scroll={{ x: 'max-content', y: 'calc(100vh - 350px)' }}
                locale={{
                  emptyText: <Empty description="No blacklisted countries yet" />,
                }}
              />
            </>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No blacklisted countries yet"
            />
          )}
        </Card>
      </div>

      {/* Add Modal */}
      <Modal
        title={<div className="font-semibold text-lg text-red-600">Add Country to Blacklist</div>}
        open={showAddModal}
        onCancel={() => setShowAddModal(false)}
        footer={null}
        width={900}
        bodyStyle={{ maxHeight: '80vh' }}
        maskClosable={false}
        destroyOnClose
      >
        <Card
          size="small"
          title={<Text strong className="text-gray-700">Available Countries</Text>}
          extra={
            <Input
              placeholder="Search by name or code..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 280 }}
              allowClear
            />
          }
          bordered={false}
        >
          {availableCountries.length === 0 ? (
            <Empty
              description={
                searchText ? `No countries match "${searchText}"` : 'No countries available'
              }
            />
          ) : (
            <Table
              rowKey="code"
              dataSource={availableCountries}
              pagination={{ pageSize: 5, showSizeChanger: false }}
              bordered
            >
              <Table.Column
                title="Country Name"
                dataIndex="name"
                key="name"
                render={(text) => <span className="font-medium text-gray-800">{text}</span>}
              />
              <Table.Column
                title="Code"
                dataIndex="code"
                key="code"
                render={(code) => <Text type="secondary"><strong>{code}</strong></Text>}
              />
              <Table.Column
                title="Action"
                key="action"
                render={(_, record) => (
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => handleAdd(record)}
                  >
                    Add
                  </Button>
                )}
              />
            </Table>
          )}
        </Card>

      </Modal>

      {/* Edit Modal */}
      <Modal
        title="✏️ Edit Country"
        open={showEditModal}
        onOk={handleEdit}
        onCancel={() => setShowEditModal(false)}
        okText="Save Changes"
        cancelText="Cancel"
        width={500}
      >
        <Form form={editForm} layout="vertical" autoComplete="off">
          <Form.Item name="country_name" label="Country Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Nepal" />
          </Form.Item>
          <Form.Item
            name="country_code"
            label="Country Code"
            rules={[
              { required: true },
              { len: 2, message: '2 letters' },
              { pattern: /^[A-Za-z]+$/, message: 'Letters only' },
            ]}
          >
            <Input placeholder="e.g. NP" maxLength={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BlackListCountry;