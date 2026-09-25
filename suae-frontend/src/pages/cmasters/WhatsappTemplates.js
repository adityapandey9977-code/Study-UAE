// /* eslint-disable react-hooks/exhaustive-deps */
// import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
// import CmasterService from "../../services/CmasterService";
// import { If } from "../../utils/Controls";
// import { AntdPaging, AntdTag } from "../../utils/Antd";
// import util from "../../utils/util";
// import {
//     Input,
//     Button,
//     message,
//     Modal,
//     Select,
// } from 'antd';
// import {
//     ExclamationCircleOutlined,
// } from '@ant-design/icons';
// const { confirm } = Modal;
// const { Option } = Select;
// const { TextArea } = Input;

// export default function WhatsappTemplates() {
//     const [result, setResult] = useState({ data: [], page: {} });
//     const sdataRef = useRef({ p: 1, ps: 50 });
//     const formRef = useRef();

//     const list = (p, ps) => {
//         sdataRef.current.p = p || 1;
//         sdataRef.current.ps = ps || sdataRef.current.ps;
//         util.showLoader();
//         CmasterService.whatsappTemplates(sdataRef.current)
//             .then(({ data }) => {
//                 const payload = (data && (data.result || data)) || {}
//                 let nextResult

//                 if (payload.data && Array.isArray(payload.data)) {
//                     const mappedData = payload.data.map((v) => ({
//                         ...v,
//                         message: v.message || "",
//                         type: v.category || "",
//                         status: v.status || "ACTIVE",
//                     }))

//                     const pageData = payload.page || {}
//                     nextResult = {
//                         data: mappedData,
//                         page: pageData,
//                     }
//                 } else {
//                     nextResult = { data: [], page: {} }
//                 }

//                 console.log("Mapped Result:", nextResult)
//                 setResult({
//                     ...nextResult,
//                     data: [...(nextResult.data || [])].reverse(),
//                 })
//             })
//             .catch((e) => {
//                 message.error(e.message)
//             })
//             .finally(() => {
//                 util.hideLoader()
//             })
//     }

//     const deleteRecord = (id) => {
//         message.destroy();
//         confirm({
//             title: `Do you want to delete this WhatsApp template?`,
//             icon: <ExclamationCircleOutlined />,
//             okText: 'Yes',
//             okType: 'danger',
//             cancelText: 'No',
//             onOk() {
//                 util.showLoader();
//                 CmasterService.deleteWhatsappTemplate(id).then(({ data }) => {
//                     message.success(data.message || 'Deleted');
//                     list();
//                 }).catch(e => {
//                     message.error(e.message);
//                 }).finally(() => {
//                     util.hideLoader();
//                 })
//             },
//             onCancel() { }
//         })
//     }

//     useEffect(() => {
//         list();
//         return () => { message.destroy() }
//     }, []);

//     return (
//         <div className="page-content">
//             <div className="page-head uc d-flex whatsapp-templates-head">
//                 <div className="my-auto">
//                     <h2>WhatsApp Templates</h2>
//                 </div>
//                 <div className="my-auto ml-auto"></div>
//             </div>

//             <div className="page-pad">
//                 <div className="d-flex tbl-search-head">
//                     <div className="my-auto">
//                         <SearchForm dataRef={sdataRef} onSearch={list} />
//                     </div>
//                     <div className="ml-auto my-auto">
//                         <Button type="primary" onClick={() => formRef.current.openForm()}><i className="fa fa-plus mr5"></i> Add</Button>
//                     </div>
//                 </div>

//                 <If cond={result.data.length}>
//                     <div className="text-secondary mb8">
//                         Showing {result.page.start + 1} - {result.page.start + result.page.total} of {result.page.total_records} records.
//                     </div>
//                     <div className="table-responsive">
//                         <table className="table table-bordered table-md table-striped table-hover m-0 whatsapp-templates-table">
//                             <thead className="thead-light text-uppercase table-text-vmid">
//                                 <tr>
//                                     <th className="w60">SN</th>
//                                     <th>Name</th>
//                                     <th className="col-message">Message</th>
//                                     <th className="w100 col-type">Type</th>
//                                     <th className="w100 col-lang">Language</th>
//                                     <th className="w60">Status</th>
//                                     <th className="w70">Action</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="table-text-top">
//                                 {result.data.map((v, i) => (
//                                     <tr key={i}>
//                                         <td>{result.page.start + i + 1}.</td>
//                                         <td>{v.name}</td>
//                                         <td className="col-message">{v.message}</td>
//                                         <td className="col-type">{v.category || v.type}</td>
//                                         <td className="col-lang">{v.language}</td>
//                                         <td className="nowrap">
//                                             {v.status === 'ACTIVE'
//                                                 ? (<AntdTag type="success">Active</AntdTag>)
//                                                 : (<AntdTag type="danger">Inactive</AntdTag>)
//                                             }
//                                         </td>
//                                         <td className="text-center">
//                                             <Button.Group size="small">
//                                                 <Button type="default" onClick={() => formRef.current.openForm(v)}><i className="fa fa-edit"></i></Button>
//                                                 <Button type="default" onClick={() => deleteRecord(v.id)}><i className="fa fa-times-circle font-red"></i></Button>
//                                             </Button.Group>
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>
//                     <div className="d-flex tbl-foot-bx">
//                         <AntdPaging
//                             onChange={list}
//                             total={result.page.total_records}
//                             current={result.page.cur_page}
//                             pageSize={sdataRef.current.ps}
//                             showSizeChanger
//                         />
//                     </div>
//                 </If>

//                 <If cond={!result.data.length}>
//                     <div className="no-rec">No record found</div>
//                 </If>
//             </div>

//             <AddForm
//                 ref={formRef}
//                 callback={list}
//                 pageno={sdataRef.current.p}
//             />
//         </div>
//     )
// }

// const SearchForm = (props) => {
//     const { dataRef, onSearch } = props;
//     const [data, setData] = useState({ ...dataRef.current });

//     const handleChange = (v, k) => {
//         data[k] = v;
//         setData({ ...data });
//     }

//     useEffect(() => {
//         dataRef.current = { ...data };
//     }, [data]);

//     useEffect(() => {
//         setData({ ...data, p: dataRef.current.p, ps: dataRef.current.ps });
//     }, [dataRef.current.p, dataRef.current.ps]);

//     return (
//         <form onSubmit={e => e.preventDefault()} autoComplete="off" spellCheck="false">
//             <div className="d-flex">
//                 <div>
//                     <Input placeholder="Search" allowClear value={data.k} onChange={e => handleChange(e.target.value, 'k')} />
//                 </div>
//                 <div>
//                     <Button type="primary" icon={<i className="fa fa-search fs13"></i>} onClick={() => onSearch()}></Button>
//                 </div>
//             </div>
//         </form>
//     )
// }

// const AddForm = forwardRef((props, ref) => {
//     const { callback, pageno } = props;
//     const [showForm, setShowForm] = useState(false);
//     const [data, setData] = useState({});
//     const [variables, setVariables] = useState([]);
//     const [newVariable, setNewVariable] = useState({ key: '', description: '' });

//     const handleChange = (v, k) => {
//         data[k] = v;
//         setData({ ...data });
//     }

//     const save = () => {
//         message.destroy();
//         util.showLoader();

//         const variablesObj = {};
//         variables.forEach(v => {
//             if (v.key && v.description) {
//                 variablesObj[v.key] = v.description;
//             }
//         });

//         const submitData = {
//             ...data,
//             category: data.type,
//             body: data.message,
//             variables: JSON.stringify(variablesObj || {}),
//         }

//         const apiCall = submitData.id
//             ? CmasterService.updateWhatsappTemplate(submitData.id, submitData)
//             : CmasterService.saveWhatsappTemplate(submitData);

//         apiCall.then(({ data: res }) => {
//             message.success(res.message || 'Saved');
//             callback(submitData.id ? pageno : 1);
//             setShowForm(false);
//         }).catch(e => {
//             message.error(e.message);
//         }).finally(() => {
//             util.hideLoader();
//         })
//     }

//     useImperativeHandle(ref, () => ({
//         openForm(dtl) {
//             if (dtl) {
//                 const variablesArray = [];
//                 let parsedVars = dtl.variables;
//                 try {
//                     if (typeof parsedVars === 'string') parsedVars = JSON.parse(parsedVars);
//                 } catch (e) {
//                     parsedVars = {};
//                 }
//                 if (parsedVars && typeof parsedVars === 'object') {
//                     Object.keys(parsedVars).forEach(key => {
//                         variablesArray.push({ key, description: parsedVars[key] });
//                     });
//                 }
//                 setVariables(variablesArray);
//                 setData({
//                     ...dtl,
//                     type: dtl.category || "",
//                     message: dtl.message || "",
//                     status: dtl.status || "ACTIVE",
//                 })
//             } else {
//                 setVariables([]);
//                 setData({
//                     status: 'ACTIVE',
//                     language: 'en',
//                     type: 'Follow Up'
//                 });
//             }
//             setShowForm(true);
//         }
//     }));

//     const addVariable = () => {
//         if (newVariable.key && newVariable.description) {
//             setVariables([...variables, { ...newVariable }]);
//             setNewVariable({ key: '', description: '' });
//         }
//     }

//     const removeVariable = (index) => {
//         setVariables(variables.filter((_, i) => i !== index));
//     }

//     const templateTypes = [
//         { value: 'Follow Up', label: 'Follow Up' },
//         { value: 'Bulk Campaign', label: 'Bulk Campaign' },
//         { value: 'Notification', label: 'Notification' },
//     ];

//     return (
//         <Modal
//             title={`${data.id ? 'Edit' : 'Add'} WhatsApp Template`}
//             open={showForm}
//             okText="Save"
//             onOk={save}
//             onCancel={() => setShowForm(false)}
//             destroyOnClose
//             maskClosable={false}
//             width={800}
//         >
//             <form onSubmit={e => { e.preventDefault(); save() }} autoComplete="off" spellCheck="false">
//                 <div className="row mingap">
//                     <div className="col-md-6 form-group">
//                         <label className="req">Name</label>
//                         <Input value={data.name || ''} onChange={e => handleChange(e.target.value, 'name')} />
//                     </div>
//                     <div className="col-md-6 form-group">
//                         <label className="req">Type</label>
//                         <Select value={data.type} onChange={v => handleChange(v, 'type')} style={{ width: '100%' }}>
//                             {templateTypes.map(t => <Option key={t.value} value={t.value}>{t.label}</Option>)}
//                         </Select>
//                     </div>
//                     <div className="col-md-12 form-group">
//                         <label className="req">Message</label>
//                         <TextArea
//                             rows={6}
//                             value={data.message || ''}
//                             onChange={e => handleChange(e.target.value, 'message')}
//                             placeholder="Enter WhatsApp message. Use {{variable_name}} for dynamic content."
//                         />
//                     </div>
//                     <div className="col-md-6 form-group">
//                         <label className="req">Language</label>
//                         <Select value={data.language} onChange={v => handleChange(v, 'language')} style={{ width: '100%' }}>
//                             <Option value="en">English</Option>
//                             <Option value="es">Spanish</Option>
//                             <Option value="fr">French</Option>
//                             <Option value="de">German</Option>
//                             <Option value="it">Italian</Option>
//                             <Option value="pt">Portuguese</Option>
//                             <Option value="ru">Russian</Option>
//                             <Option value="zh">Chinese</Option>
//                             <Option value="ja">Japanese</Option>
//                             <Option value="ko">Korean</Option>
//                             <Option value="ar">Arabic</Option>
//                             <Option value="hi">Hindi</Option>
//                         </Select>
//                     </div>
//                     <div className="col-md-6 form-group">
//                         <label className="req">Status</label>
//                         <Select value={data.status} onChange={v => handleChange(v, 'status')} style={{ width: '100%' }}>
//                             <Option value="ACTIVE">Active</Option>
//                             <Option value="INACTIVE">Inactive</Option>
//                         </Select>
//                     </div>
//                     <div className="col-md-12 form-group">
//                         <label>Variables</label>
//                         <div className="mb-2">
//                             <div className="d-flex">
//                                 <Input
//                                     placeholder="Variable key"
//                                     value={newVariable.key}
//                                     onChange={e => setNewVariable({ ...newVariable, key: e.target.value })}
//                                     style={{ marginRight: '5px' }}
//                                 />
//                                 <Input
//                                     placeholder="Description"
//                                     value={newVariable.description}
//                                     onChange={e => setNewVariable({ ...newVariable, description: e.target.value })}
//                                     style={{ marginRight: '5px' }}
//                                 />
//                                 <Button type="primary" onClick={addVariable}>Add</Button>
//                             </div>
//                         </div>
//                         {variables.map((v, i) => (
//                             <div key={i} className="d-flex align-items-center mb-1">
//                                 <span className="mr-2"><strong>{`{{${v.key}}}:`}</strong> {v.description}</span>
//                                 <Button type="link" danger size="small" onClick={() => removeVariable(i)}>Remove</Button>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             </form>
//         </Modal>
//     )
// })


/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import CmasterService from "../../services/CmasterService";
import { If } from "../../utils/Controls";
import { AntdPaging, AntdTag } from "../../utils/Antd";
import util from "../../utils/util";
import { TEMPLATE_TAGS } from "../../constants";
import {
    Input,
    Button,
    message,
    Modal,
    Select,
} from 'antd';
import {
    ExclamationCircleOutlined,
} from '@ant-design/icons';
const { confirm } = Modal;
const { Option } = Select;
const { TextArea } = Input;

export default function WhatsappTemplates() {
    const [result, setResult] = useState({ data: [], page: {} });
    const sdataRef = useRef({ p: 1, ps: 50 });
    const formRef = useRef();

    const list = (p, ps) => {
        sdataRef.current.p = p || 1;
        sdataRef.current.ps = ps || sdataRef.current.ps;
        util.showLoader();
        CmasterService.whatsappTemplates(sdataRef.current)
            .then(({ data }) => {
                const payload = (data && (data.result || data)) || {}
                let nextResult

                if (payload.data && Array.isArray(payload.data)) {
                    const mappedData = payload.data.map((v) => ({
                        ...v,
                        message: v.message || "",
                        type: v.type || v.category || "",
                        status: v.status || "ACTIVE",
                    }))

                    const pageData = payload.page || {}
                    nextResult = {
                        data: mappedData,
                        page: pageData,
                    }
                } else {
                    nextResult = { data: [], page: {} }
                }

                console.log("Mapped Result:", nextResult)
                setResult({
                    ...nextResult,
                    data: [...(nextResult.data || [])].reverse(),
                })
            })
            .catch((e) => {
                message.error(e.message)
            })
            .finally(() => {
                util.hideLoader()
            })
    }

    const deleteRecord = (id) => {
        message.destroy();
        confirm({
            title: `Do you want to delete this WhatsApp template?`,
            icon: <ExclamationCircleOutlined />,
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk() {
                util.showLoader();
                CmasterService.deleteWhatsappTemplate(id).then(({ data }) => {
                    message.success(data.message || 'Deleted');
                    list();
                }).catch(e => {
                    message.error(e.message);
                }).finally(() => {
                    util.hideLoader();
                })
            },
            onCancel() { }
        })
    }

    useEffect(() => {
        list();
        return () => { message.destroy() }
    }, []);

    return (
        <div className="page-content">
            <div className="page-head-gradient">
                <div>
                    <h2>
                        <i className="fa fa-whatsapp"></i> WhatsApp Templates
                    </h2>
                </div>
            </div>

            <div className="page-pad">
                <div className="d-flex tbl-search-head">
                    <div className="my-auto">
                        <SearchForm dataRef={sdataRef} onSearch={list} />
                    </div>
                    <div className="ml-auto my-auto">
                        <Button onClick={() => formRef.current.openForm()} style={{ background: 'linear-gradient(135deg, #588d93, #568cb1)', color: '#fff', border: 'none', fontWeight: 600, borderRadius: 8 }}><i className="fa fa-plus mr5"></i> Add</Button>
                    </div>
                </div>

                <If cond={result.data.length}>
                    <div className="mb8" style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>
                        Showing {result.page.start + 1} - {result.page.start + result.page.total} of {result.page.total_records} records.
                    </div>
                    <div className="table-responsive">
                        <table className="table table-bordered table-md table-striped table-hover m-0 whatsapp-templates-table">
                            <thead className="thead-light text-uppercase table-text-vmid">
                                <tr>
                                    <th className="w60">SN</th>
                                    <th>Name</th>
                                    <th className="col-message">Message</th>
                                    <th className="w100 col-type">Type</th>
                                    <th className="w100 col-lang">Language</th>
                                    <th className="w60">Status</th>
                                    <th className="w70">Action</th>
                                </tr>
                            </thead>
                            <tbody className="table-text-top">
                                {result.data.map((v, i) => (
                                    <tr key={i}>
                                        <td>{(result.page.start || 0) + i + 1}.</td>
                                        <td>{v.name}</td>
                                        <td className="col-message">{v.message}</td>
                                        <td className="col-type">{v.type || v.category}</td>
                                        <td className="col-lang">{v.language}</td>
                                        <td className="nowrap">
                                            {v.status === 'ACTIVE'
                                                ? (<AntdTag style={{ background: '#121513', color: '#fff', fontWeight: 600, borderRadius: 6, padding: '2px 10px', border: 'none' }}>Active</AntdTag>)
                                                : (<AntdTag type="danger">Inactive</AntdTag>)
                                            }
                                        </td>
                                        <td className="text-center">
                                            <Button.Group size="small">
                                                <Button type="default" onClick={() => formRef.current.openForm(v)}><i className="fa fa-edit"></i></Button>
                                                <Button type="default" onClick={() => deleteRecord(v.id)}><i className="fa fa-times-circle font-red"></i></Button>
                                            </Button.Group>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="d-flex tbl-foot-bx" style={{ justifyContent: 'center', marginTop: 12 }}>
                        <AntdPaging
                            onChange={list}
                            total={result.page.total_records}
                            current={result.page.cur_page}
                            pageSize={sdataRef.current.ps}
                            showSizeChanger
                            showTotal={(total, range) => (
                                <span style={{ background: 'linear-gradient(135deg, #588d93, #568cb1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 700, fontSize: 13, marginRight: 12 }}>
                                    {range[0]}–{range[1]} of {total} templates
                                </span>
                            )}
                        />
                    </div>
                </If>

                <If cond={!result.data.length}>
                    <div className="no-rec">No record found</div>
                </If>
            </div>

            <AddForm
                ref={formRef}
                callback={list}
                pageno={sdataRef.current.p}
            />
        </div>
    )
}

const SearchForm = (props) => {
    const { dataRef, onSearch } = props;
    const [data, setData] = useState({ ...dataRef.current });

    const handleChange = (v, k) => {
        data[k] = v;
        setData({ ...data });
    }

    useEffect(() => {
        dataRef.current = { ...data };
    }, [data]);

    useEffect(() => {
        setData({ ...data, p: dataRef.current.p, ps: dataRef.current.ps });
    }, [dataRef.current.p, dataRef.current.ps]);

    return (
        <form onSubmit={e => e.preventDefault()} autoComplete="off" spellCheck="false">
            <style>{`.wa-tpl-search .ant-input::placeholder { color: #000000 !important; font-weight: 700 !important; font-size: 14px !important; opacity: 1 !important; }`}</style>
            <div className="d-flex wa-tpl-search" style={{ gap: 8 }}>
                <div>
                    <Input placeholder="Search" allowClear value={data.k} onChange={e => handleChange(e.target.value, 'k')} />
                </div>
                <div>
                    <Button icon={<i className="fa fa-search fs13"></i>} onClick={() => onSearch()} style={{ background: 'linear-gradient(135deg, #588d93, #568cb1)', color: '#fff', border: 'none', fontWeight: 600, borderRadius: 6, height: 32 }}></Button>
                </div>
            </div>
        </form>
    )
}

const AddForm = forwardRef((props, ref) => {
    const { callback, pageno } = props;
    const [showForm, setShowForm] = useState(false);
    const [data, setData] = useState({});
    const [variables, setVariables] = useState([]);
    const [newVariable, setNewVariable] = useState({ key: '', description: '' });

    const insertAtCursor = (el, text) => {
        if (!el) return;
        const start = el.selectionStart ?? el.value.length;
        const end = el.selectionEnd ?? el.value.length;
        const next = el.value.substring(0, start) + text + el.value.substring(end);
        el.value = next;
        el.focus({ preventScroll: true });
        el.selectionStart = el.selectionEnd = start + text.length;
        handleChange(next, 'message');
    }

    const handleChange = (v, k) => {
        data[k] = v;
        setData({ ...data });
    }

    const save = () => {
        message.destroy();
        util.showLoader();

        const variablesObj = {};
        variables.forEach(v => {
            if (v.key && v.description) {
                variablesObj[v.key] = v.description;
            }
        });

        const submitData = {
            ...data,
            type: data.type,
            category: data.type,
            body: data.message,
            variables: JSON.stringify(variablesObj || {}),
        }

        const apiCall = submitData.id
            ? CmasterService.updateWhatsappTemplate(submitData.id, submitData)
            : CmasterService.saveWhatsappTemplate(submitData);

        apiCall.then(({ data: res }) => {
            message.success(res.message || 'Saved');
            callback(submitData.id ? pageno : 1);
            setShowForm(false);
        }).catch(e => {
            message.error(e.message);
        }).finally(() => {
            util.hideLoader();
        })
    }

    useImperativeHandle(ref, () => ({
        openForm(dtl) {
            if (dtl) {
                const variablesArray = [];
                let parsedVars = dtl.variables;
                try {
                    if (typeof parsedVars === 'string') parsedVars = JSON.parse(parsedVars);
                } catch (e) {
                    parsedVars = {};
                }
                if (parsedVars && typeof parsedVars === 'object') {
                    Object.keys(parsedVars).forEach(key => {
                        variablesArray.push({ key, description: parsedVars[key] });
                    });
                }
                setVariables(variablesArray);
                setData({
                    ...dtl,
                    type: dtl.type || dtl.category || "",
                    message: dtl.message || "",
                    status: dtl.status || "ACTIVE",
                })
            } else {
                setVariables([]);
                setData({
                    status: 'ACTIVE',
                    language: 'en',
                    type: 'Follow Up'
                });
            }
            setShowForm(true);
        }
    }));

    const addVariable = () => {
        if (newVariable.key && newVariable.description) {
            setVariables([...variables, { ...newVariable }]);
            setNewVariable({ key: '', description: '' });
        }
    }

    const removeVariable = (index) => {
        setVariables(variables.filter((_, i) => i !== index));
    }


    return (
        <Modal
            title={`${data.id ? 'Edit' : 'Add'} WhatsApp Template`}
            open={showForm}
            okText="Save"
            onOk={save}
            onCancel={() => setShowForm(false)}
            destroyOnClose
            maskClosable={false}
            width={800}
        >
            <form onSubmit={e => { e.preventDefault(); save() }} autoComplete="off" spellCheck="false">
                <div className="row mingap">
                    <div className="col-md-6 form-group">
                        <label className="req">Name</label>
                        <Input value={data.name || ''} onChange={e => handleChange(e.target.value, 'name')} />
                    </div>
                    <div className="col-md-6 form-group">
                        <label>Type</label>
                        <Input value="Follow Up" disabled style={{ backgroundColor: '#f5f5f5' }} />
                    </div>
                    <div className="col-md-12 form-group">
                        <label className="req">Message</label>
                        <div className="mb-1">
                            <Select
                                placeholder="Insert attribute"
                                style={{ width: 250 }}
                                value={undefined}
                                onChange={(v) => {
                                    const token = `{%${v}%}`;
                                    insertAtCursor(document.getElementById('wa_template_message'), token);
                                }}
                            >
                                {TEMPLATE_TAGS.map((t) => (
                                    <Option key={t} value={t}>{`{%${t}%}`}</Option>
                                ))}
                            </Select>
                        </div>
                        <TextArea
                            id="wa_template_message"
                            rows={6}
                            value={data.message || ''}
                            onChange={e => handleChange(e.target.value, 'message')}
                            placeholder="Enter WhatsApp message."
                        />
                    </div>
                    <div className="col-md-6 form-group">
                        <label className="req">Language</label>
                        <Select value={data.language} onChange={v => handleChange(v, 'language')} style={{ width: '100%' }}>
                            <Option value="en">English</Option>
                            <Option value="es">Spanish</Option>
                            <Option value="fr">French</Option>
                            <Option value="de">German</Option>
                            <Option value="it">Italian</Option>
                            <Option value="pt">Portuguese</Option>
                            <Option value="ru">Russian</Option>
                            <Option value="zh">Chinese</Option>
                            <Option value="ja">Japanese</Option>
                            <Option value="ko">Korean</Option>
                            <Option value="ar">Arabic</Option>
                            <Option value="hi">Hindi</Option>
                        </Select>
                    </div>
                    <div className="col-md-6 form-group">
                        <label className="req">Status</label>
                        <Select value={data.status} onChange={v => handleChange(v, 'status')} style={{ width: '100%' }}>
                            <Option value="ACTIVE">Active</Option>
                            <Option value="INACTIVE">Inactive</Option>
                        </Select>
                    </div>
                    {/* <div className="col-md-12 form-group">
                        <label>Variables</label>
                        <div className="mb-2">
                            <div className="d-flex">
                                <Input
                                    placeholder="Variable key"
                                    value={newVariable.key}
                                    onChange={e => setNewVariable({ ...newVariable, key: e.target.value })}
                                    style={{ marginRight: '5px' }}
                                />
                                <Input
                                    placeholder="Description"
                                    value={newVariable.description}
                                    onChange={e => setNewVariable({ ...newVariable, description: e.target.value })}
                                    style={{ marginRight: '5px' }}
                                />
                                <Button type="primary" onClick={addVariable}>Add</Button>
                            </div>
                        </div>
                        {variables.map((v, i) => (
                            <div key={i} className="d-flex align-items-center mb-1">
                                <span className="mr-2"><strong>{`{{${v.key}}}:`}</strong> {v.description}</span>
                                <Button type="link" danger size="small" onClick={() => removeVariable(i)}>Remove</Button>
                            </div>
                        ))}
                    </div> */}
                </div>
            </form>
        </Modal>
    )
})
