import React, {
	useState,
	useEffect,
	useRef,
	forwardRef,
	useImperativeHandle,
} from "react"
import { useNavigate, useLocation } from "react-router-dom"

import CmasterService from "../../services/CmasterService"
import FileService from "../../services/FileService"
import StudentService from "../../services/StudentService"
import InstituteService from "../../services/InstituteService"
import {
	RawHTML,
	Tinymce,
	GetTinymceContent,
	SetTinymceContent,
} from "../../utils/Controls"
import { AntdPaging, AntdSelect, AntdTag } from "../../utils/Antd"
import util from "../../utils/util"
import { Input, Button, message, Modal, Image, Tabs } from "antd"
import { ExclamationCircleOutlined } from "@ant-design/icons"
import TabPane from "antd/lib/tabs/TabPane"
const { confirm } = Modal
let $ = window.$

const normalizeUploadsUrl = (rawUrl, preferOrigin = "node") => {
	if (!rawUrl || typeof rawUrl !== "string") return rawUrl
	rawUrl = rawUrl.trim()
	if (rawUrl.startsWith("blob:")) return rawUrl

	const getOrigin = (baseUrl) => {
		try {
			return new URL(baseUrl).origin
		} catch (e) {
			return ""
		}
	}

	const nodeOrigin = getOrigin(util.apiUrlNode)
	const phpOrigin = getOrigin(util.apiUrl)
	const preferred = preferOrigin === "php" ? phpOrigin : nodeOrigin
	if (!preferred) return rawUrl

	// If it's already an absolute URL, keep it as-is.
	// (Do NOT rewrite PHP URLs to Node; that causes 404 when file lives on PHP uploads.)
	try {
		// eslint-disable-next-line no-new
		new URL(rawUrl)
		return rawUrl
	} catch (e) {
		// continue
	}

	if (rawUrl.startsWith("/uploads/") || rawUrl.startsWith("uploads/")) {
		const path = rawUrl.startsWith("/") ? rawUrl : `/${rawUrl}`
		return `${preferred}${path}`
	}

	return rawUrl
}

export default function Issues(props) {
	const navigate = useNavigate()
	const location = useLocation()
	const cref = props.cref || null
	const forceStudentIssuesOnly = props.forceStudentIssuesOnly || false
	const [result, setResult] = useState({ data: [], page: {} })
	const sdataRef = useRef({ p: 1, ps: 25 })
	const formRef = useRef({})
	const replyRef = useRef({})
	const [cats, setCats] = useState([])
	
	// Set default tab based on route
	const getDefaultTab = () => {
		if (location.pathname.indexOf("/institute-queries") >= 0) {
			return "institutes";
		}
		return "students";
	}
	
	const [activeTab, setActiveTab] = useState(getDefaultTab())
	const page = result?.page || {}
	const pageStart = Number(page?.start) || 0
	const pageTotal = Number(page?.total) || 0
	const pageTotalRecords = Number(page?.total_records) || 0
	const pageCurPage = Number(page?.cur_page) || 1


	// institute-only dataset store (for client-side paginate/filter)
	const isInstitute = util.isInstitute() === 1
	// active tab (students | institutes) — super admin will see tabs
	const isInstituteQueriesLayout =
		location.pathname.indexOf("/institute-queries") >= 0
	const isStudentIssuesLayout = location.pathname.includes("/student-issues")
	// Hide tabs when opened from Students modal
	const showTabs = util.isClientAdmin() === 1 && !forceStudentIssuesOnly
	const uploadsPreferOrigin =
		util.isClientAdmin && util.isClientAdmin() === 1
			? activeTab === "institutes"
				? "node"
				: "php"
			: isInstituteQueriesLayout
				? "node"
				: "php"
	const hideStudentDetailsColumn =
		util.isStudent() === 1 || isInstituteQueriesLayout
	// ...existing code...
	const fullIssuesRef = useRef([]) // raw mapped rows for institute endpoint
	const mapCatName = (cat_id) => {
		if (!cat_id || !Array.isArray(cats) || cats.length === 0) return ""
		const found = cats.find((c) => Number(c.id) === Number(cat_id))
		return found ? found.name || found.cat || "" : ""
	}

	const applyFiltersAndPaginate = () => {
		// client-side filtering for institute list
		let rows = [...fullIssuesRef.current]

		// apply SearchForm filters (same keys used by server version)
		const { cat_id, status, k } = sdataRef.current || {}
		if (cat_id) {
			rows = rows.filter((r) => Number(r.cat_id) === Number(cat_id))
		}
		if (status) {
			rows = rows.filter(
				(r) => (r.status || "").toLowerCase() === String(status).toLowerCase()
			)
		}
		if (k && String(k).trim() !== "") {
			const s = String(k).toLowerCase()
			rows = rows.filter(
				(r) =>
					(r.regno || "").toLowerCase().includes(s) ||
					(r.name || "").toLowerCase().includes(s) ||
					(r.email || "").toLowerCase().includes(s) ||
					(r.mobile || "").toLowerCase().includes(s) ||
					(r.cat || "").toLowerCase().includes(s)
			)
		}

		// pagination slice
		const p = Number(sdataRef.current.p) || 1
		const ps = Number(sdataRef.current.ps) || 25
		const startIdx = (p - 1) * ps
		const pageSlice = rows.slice(startIdx, startIdx + ps)

		const page = {
			start: startIdx,
			total: pageSlice.length,
			total_records: rows.length,
			cur_page: p,
		}

		setResult({ data: pageSlice, page })
	}

	const ensureStudentContext = async () => {
		if (util.isStudent() !== 1) return
		if (sdataRef.current.student_id && sdataRef.current.institute_id) return
		try {
			const { data } = await InstituteService.getInstituteId()
			const studentId =
				data?.data?.student_id ||
				data?.student_id ||
				data?.result?.student_id ||
				null
			const instituteId =
				data?.data?.institute_id ||
				data?.institute_id ||
				data?.result?.institute_id ||
				null
			if (studentId) sdataRef.current.student_id = studentId
			if (instituteId) sdataRef.current.institute_id = instituteId
		} catch (e) {
			// silent: list will still attempt with whatever context we have
		}
	}

	const list = async (p, ps, tabKey) => {
		sdataRef.current.p = p || 1
		sdataRef.current.ps = ps || sdataRef.current.ps
		util.showLoader()

		const currentTab = tabKey || activeTab

		try {
			// -------------------------------
			// 🧩 Decide which issues to fetch
			// -------------------------------
			if (util.isClientAdmin() === 1) {
				// SUPER ADMIN mode → use tabs
				if (currentTab === "institutes") {
					// all institute issues (admin view)
					const res = await InstituteService.allInstituteIssuesforAdmin(
						sdataRef.current
					)
					handleInstituteResult(res)
				} else {
					// student issues (admin view)
					const { data } = await StudentService.allStudentIssues(
						sdataRef.current
					)
					const resultData = data.result || data
					setResult({
						data: Array.isArray(resultData.data) ? resultData.data : [],
						page: resultData.page || {
							start: 0,
							total: Array.isArray(resultData.data) ? resultData.data.length : 0,
							total_records: resultData.page?.total_records || (Array.isArray(resultData.data) ? resultData.data.length : 0),
							cur_page: resultData.page?.cur_page || 1
						}
					})
				}
			} else if (isInstitute) {
				// INSTITUTE mode  use route, not tab
				if (isInstituteQueriesLayout) {
					// own institute issues
					const res = await InstituteService.allInstituteIssues(
						sdataRef.current
					)
					handleInstituteResult(res)
				} else if (isStudentIssuesLayout) {
					// student issues belonging to this institute
					try {
						// resolve current institute id
						let insId = null
						try {
							const { sdx } = await import("../../sdx")
							if (sdx && sdx.institute_id) {
								insId = sdx.institute_id
							}
						} catch (e) { }
						// fall back to any existing value on sdataRef if present
						if (!insId && sdataRef.current.institute_id) {
							insId = sdataRef.current.institute_id
						}
						const params = { institute_id: insId }
						const { data } = await StudentService.allStudentIssues(params)
						const resultData = data.result || data
						setResult({
							data: Array.isArray(resultData.data) ? resultData.data : [],
							page: resultData.page || {
								start: 0,
								total: Array.isArray(resultData.data) ? resultData.data.length : 0,
								total_records: resultData.page?.total_records || (Array.isArray(resultData.data) ? resultData.data.length : 0),
								cur_page: resultData.page?.cur_page || 1
							}
						})
					} catch (e) {
						throw e
					}
				}
			} else {
				// STUDENT mode
				await ensureStudentContext()
				const { data } = await StudentService.allStudentIssues({
					...sdataRef.current,
				})
				const resultData = data.result || data
				setResult({
					data: Array.isArray(resultData.data) ? resultData.data : [],
					page: resultData.page || {
						start: 0,
						total: Array.isArray(resultData.data) ? resultData.data.length : 0,
						total_records: resultData.page?.total_records || (Array.isArray(resultData.data) ? resultData.data.length : 0),
						cur_page: resultData.page?.cur_page || 1
					}
				})
			}
		} catch (e) {
			message.error(e?.message || "Failed to load issues")
			setResult({ data: [], page: {} })
		} finally {
			util.hideLoader()
		}
	}

	// helper for mapping institute results
	const normalizeReplyCount = (r) => {
		const raw =
			r?.reply_count ??
			r?.replies_count ??
			r?.repliesCount ??
			r?.comments_count ??
			r?.commentsCount ??
			r?.comment_count ??
			r?.commentCount ??
			r?.total_comments ??
			r?.totalComments

		const num = Number(raw)
		if (Number.isFinite(num)) return num

		const arr = r?.replies ?? r?.comments ?? r?.issue_replies ?? r?.issue_comments
		if (Array.isArray(arr)) return arr.length

		return 0
	}

	const handleInstituteResult = (res) => {
		const arr = Array.isArray(res?.data?.result)
			? res.data.result
			: Array.isArray(res?.result)
				? res.result
				: []
		const mapped = arr.map((r) => {
			const cat_id = r.cat_id || r.category_id
			const mappedCat = mapCatName(cat_id)
			return {
				id: r.issue_id || r.id,
				cat_id,
				description: r.description || "",
				status: r.status || "",
				created: r.created || r.created_at,
				name: r.student_name || r.institute_name || r.created_by_name,
				regno: r.student_regno || r.regno,
				email: r.student_email || r.email,
				mobile: r.student_mobile || r.mobile,
				// Ensure a visible heading for institute issues
				cat:
					mappedCat ||
					 r.category_name ||
					 r.cat ||
					 r.title ||
					 "Issue",
				reply_count: normalizeReplyCount(r),
				file_url: normalizeUploadsUrl(
					r.file_url || (r.file && r.file.file_url) || "",
					uploadsPreferOrigin
				),
				institute_id: r.institute_id,
			}
		})
		fullIssuesRef.current = mapped
		applyFiltersAndPaginate()
	}


	const updateRow = (rowDtl) => {
		result.data.forEach((v, i) => {
			if (v.id === rowDtl.id) {
				result.data[i] = { ...rowDtl }
				setResult({ ...result })
				return false
			}
		})
	}

	const deleteRecord = (id) => {
		message.destroy()
		confirm({
			title: "Do you Want to delete this issue?",
			icon: <ExclamationCircleOutlined />,
			content: "",
			okText: "Yes",
			okType: "danger",
			cancelText: "No",
			onOk() {
				util.showLoader()
				// Use correct API based on whether it's institute queries or student issues
				const deletePromise = isInstituteQueriesLayout || activeTab === "institutes"
					? InstituteService.deleteInstituteIssue(id)
					: StudentService.deleteIssue(id)
				
				deletePromise
					.then(({ data }) => {
						message.success(data.message || "Deleted")
						// refresh current page
						if (isInstitute) {
							// remove from local and re-page
							fullIssuesRef.current = fullIssuesRef.current.filter(
								(x) => x.id !== id
							)
							applyFiltersAndPaginate()
							util.hideLoader()
						} else {
							list()
						}
					})
					.catch((e) => {
						message.error(e.message)
					})
					.finally(() => {
						if (!isInstitute) util.hideLoader()
					})
			},
			onCancel() { },
		})
	}

	if (cref !== null) {
		cref.current = {
			...cref.current,
			getIssues: (student_id) => {
				sdataRef.current.student_id = student_id
				list()
			},
		}
	}

	useEffect(() => {
		const boot = async () => {
			try {
				setResult({ data: [], page: {} })
				util.showLoader()
				const res = await CmasterService.allIssuesCats({ status: 1 })
				setCats([...res.data.result.data])
				await ensureStudentContext()
				await list(1, sdataRef.current.ps)
			} catch (e) {
				// ignore
			} finally {
				if (cref === null) {
					list()
				}
				util.hideLoader()
			}
		}
		boot()
		return () => {
			message.destroy()
		}
	}, [location.pathname])

	useEffect(() => {
		const handleSessionChanged = (e) => {
			const session = e?.detail
			if (session && session.key) {
				sdataRef.current.master_session_id = session.key
			} else {
				delete sdataRef.current.master_session_id
			}
			sdataRef.current.p = 1
			list(1, sdataRef.current.ps, activeTab)
		}

		window.addEventListener("sessionChanged", handleSessionChanged)
		return () => {
			window.removeEventListener("sessionChanged", handleSessionChanged)
		}
	}, [activeTab])

	// When filters change (SearchForm updates sdataRef), recompute client-side page for institute
	useEffect(() => {
		if (
			isInstitute &&
			Array.isArray(fullIssuesRef?.current) &&
			fullIssuesRef.current.length >= 0
		) {
			applyFiltersAndPaginate()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [cats]) // cat names may load after first list; remap display

	//Delete institute record
	// const deleteStuIssue = (issue_id) =>{
	//     StudentService.deleteIssue(issue_id).then(({ data }) => {
	//         message.success(data.message || 'Deleted');
	//         list();
	//     }).catch(e => {
	//         message.error(e.message);
	//     })
	// }

	return (
		<div className="page-content">
			<div className="page-head-gradient">
				<div>
					<h2>
						<i className="fa fa-exclamation-triangle"></i> Issues/Queries
					</h2>
				</div>
				{util.isStudent() === 1 && (
					<div className="d-flex align-items-center mt10" style={{ gap: 10 }}>
						<span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600, fontSize: 14 }}>
							Reg. No: <span className="bold600">{util.getRegno()}</span>
						</span>
						<div
							className="pill-btn sm"
							style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none' }}
							onClick={() => {
								navigate("/dashboard")
							}}
						>
							Go To Dashboard
						</div>
					</div>
				)}
			</div>
			{showTabs && (
				<div className="mb15 ml-4">
					<Tabs
						activeKey={activeTab}
						onChange={(key) => {
							setActiveTab(key)
							sdataRef.current.p = 1
							list(1, sdataRef.current.ps, key) // <-- pass key
						}}
						className="nav nav-tabs uc tabs-sm1"
					>
						<TabPane tab="Student Queries" key="students"></TabPane>
						<TabPane tab="Institute Queries" key="institutes"></TabPane>
					</Tabs>
				</div>
			)}

			<div className="page-pad">
				{Array.isArray(result?.data) && result.data.length > 0 && (
					<div className="mb8" style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>
						Showing {pageStart + 1} -{" "}
						{Math.min(pageStart + result.data.length, pageTotalRecords)} of{" "}
						{pageTotalRecords} records.
					</div>
				)}

				<div className="d-flex tbl-search-head">
					<div className="my-auto">
						<SearchForm
							dataRef={sdataRef}
							
							onSearch={() => {
								// For institute, re-apply client filters; for others call API
								if (isInstitute) {
									sdataRef.current.p = 1
									applyFiltersAndPaginate()
								} else {
									sdataRef.current.p = 1
									list()
								}
							}}
							cats={cats}
						/>
					</div>
					{(util.isStudent() === 1 || isInstituteQueriesLayout) && (
						<div className="ml-auto my-auto">
						<Button onClick={() => formRef.current.openForm()} style={{ background: 'linear-gradient(135deg, #588d93, #568cb1)', color: '#fff', border: 'none', fontWeight: 600, borderRadius: 8 }}>
							<i className="fa fa-plus mr5"></i> Add Query
						</Button>
						</div>
					)}
				</div>

				{Array.isArray(result?.data) && result.data.length > 0 && (
					<>
						<div className="table-responsive">
							<table className="table table-bordered table-md table-striped table-hover m-0">
								<thead className="thead-light text-uppercase table-text-vmid">
									<tr>
										<th className="w20">SN</th>
										{!hideStudentDetailsColumn && (
											<th className="w300">Student Detail</th>
										)}
										<th>Issue</th>
										<th className="w150">Created</th>
										<th className="w60">Status</th>
										{util.isStudent() === 0 && !isInstitute && (
											<th className="w20"></th>
										)}
									</tr>
								</thead>
								<tbody className="table-text-top">
									{result.data.map((v, i) => (
										<tr key={i}>
											<td>{pageStart + i + 1}.</td>
											{!hideStudentDetailsColumn && (
												<td>
													<div className="">{v.name}</div>
													{/* Only show student details if they exist */}
													{v.regno && (
														<div className="font-purple bold600 pb3 fs13">
															Reg No: {v.regno}
														</div>
													)}
													{/* Show institute details for institute queries */}
													{v.institute_id && (
														<div className="font-purple bold600 pb3 fs13">
															Institute Query
														</div>
													)}
													<div className="note-text pt3">
														<div className="pb1">
															{v.email}
															{v.email_verified === 1 ? (
																<span className="font-green-jungle fs10 pl4">
																	<i className="fa fa-check-circle"></i>{" "}
																	Verified
																</span>
															) : (
																<span className="font-red fs10 pl4">
																	Not Verified
																</span>
															)}
														</div>
														<div>
															<i className="fa fa-mobile mr4"></i>
															{v.isd_code}-{v.mobile}
															{v.mobile_verified === 1 ? (
																<span className="font-green-jungle fs10 pl4">
																	<i className="fa fa-check-circle"></i>{" "}
																	Verified
																</span>
															) : (
																<span className="font-red fs10 pl4">
																	Not Verified
																</span>
															)}
														</div>
													</div>
												</td>
											)}
											<td>
												<div
													className="bold600 link"
													onClick={() => replyRef.current.open({ ...v })}
												>
													{v.cat}
												</div>
												<div
													className="font-yellow cpointer"
													onClick={() => replyRef.current.open({ ...v })}
												>
													<i className="icon-bubbles"></i> {v.reply_count}{" "}
													Comments
												</div>

												<div className="email-body pt5 text-secondary">
													<RawHTML html={v.description} />
												</div>
												{v.file_url !== "" && (
													<div className="w80">
														<Image
															src={normalizeUploadsUrl(v.file_url, uploadsPreferOrigin)}
															className="mw-100"
															preview={{ mask: "View" }}
														/>
													</div>
												)}
											</td>
											<td>
												<span className="nowrap fs12">
													{util.getDate(v.created, "DD MMM YYYY @ hh:mm A")}
												</span>
											</td>
											<td>
												<AntdTag
													type={
														v.status === "Open"
															? "danger"
															: v.status === "Closed"
																? "success"
																: "primary"
													}
												>
													{v.status}
												</AntdTag>
											</td>

											{util.isStudent() === 0 && !isInstitute && (
												<td className="text-center">
													<Button
														type="default"
														size="small"
														onClick={() => deleteRecord(v.id)}
													>
														<i className="fa fa-times-circle font-red"></i>
													</Button>
												</td>
											)}
										</tr>
									))}
								</tbody>
							</table>
						</div>
						<div className="d-flex tbl-foot-bx">
							<AntdPaging
								onChange={(page, pageSize) => {
									if (isInstitute) {
										sdataRef.current.p = page
										sdataRef.current.ps = pageSize
										applyFiltersAndPaginate()
									} else {
										list(page, pageSize)
									}
								}}
								total={pageTotalRecords}
								current={pageCurPage}
								pageSize={sdataRef.current.ps}
								showSizeChanger
							/>
						</div>
					</>
				)}
				{Array.isArray(result?.data) && result.data.length === 0 && (
					<div className="no-rec">No record found</div>
				)}
			</div>

			<AddForm
				ref={formRef}
				callback={list}
				pageno={sdataRef.current.p}
				cats={cats}
				isInstitute={isInstitute}
			/>

			<ReplyModal
				ref={replyRef}
				updateRow={updateRow}
				isInstitute={isInstitute}
				isInstituteQueriesLayout={isInstituteQueriesLayout}
				isStudentIssuesLayout={isStudentIssuesLayout}
				activeTab={activeTab}
			/>
		</div>
	);
}

const SearchForm = (props) => {
	let { dataRef, onSearch } = props
	let [data, setData] = useState({ ...dataRef.current })
	let [cats, setCats] = useState([])
	const handleChange = (v, k) => {
		data[k] = v
		setData({ ...data })
		dataRef.current = { ...dataRef.current, ...data, [k]: v, p: 1 }
	}
	useEffect(() => {
		// Merge to avoid wiping externally injected context fields like student_id/institute_id
		dataRef.current = { ...dataRef.current, ...data }
	}, [data])

	useEffect(() => {
		setCats([...props.cats])
	}, [props.cats])

	useEffect(() => {
		setData({ ...data, p: dataRef.current.p, ps: dataRef.current.ps })
	}, [dataRef.current.p, dataRef.current.ps])

	return (
		<form
			onSubmit={(e) => e.preventDefault()}
			autoComplete="off"
			spellCheck="false"
		>
			<style>{`.issues-search .ant-select-selection__placeholder { color: #000000 !important; font-weight: 700 !important; font-size: 13px !important; opacity: 1 !important; } .issues-search .ant-select-selection__placeholder span { color: #000000 !important; } .issues-search .ant-select .ant-select-selection__field { color: #000000 !important; } .issues-search .ant-input::placeholder { color: #000000 !important; font-weight: 700 !important; font-size: 13px !important; opacity: 1 !important; } .issues-search .ant-select-search__field::placeholder { color: #000000 !important; font-weight: 700 !important; font-size: 13px !important; opacity: 1 !important; }`}</style>
			<div className="d-flex issues-search" style={{ gap: 8 }}>
				<div className="w300">
					<AntdSelect
						placeholder="Category (All)"
						allowClear
						showSearch
						options={cats}
						value={data.cat_id}
						onChange={(v) => {
							handleChange(v, "cat_id")
						}}
						getPopupContainer={triggerNode => triggerNode.parentNode}
					/>
				</div>
				<div className="w150">
					<AntdSelect
						placeholder="Status (All)"
						allowClear
						options={["Open", "In Process", "Closed"]}
						value={data.status}
						onChange={(v) => {
							handleChange(v, "status")
						}}
						getPopupContainer={triggerNode => triggerNode.parentNode}
					/>
				</div>
				<div>
					<Input
						placeholder="Search"
						allowClear
						value={data.k}
						onChange={(e) => handleChange(e.target.value, "k")}
					/>
				</div>
				<div>
					<Button
						icon={<i className="fa fa-search fs13"></i>}
						onClick={() => onSearch()}
						style={{ background: 'linear-gradient(135deg, #588d93, #568cb1)', color: '#fff', border: 'none', fontWeight: 600, borderRadius: 6, height: 32 }}
					></Button>
				</div>
			</div>
		</form>
	)
}

const AddForm = forwardRef((props, ref) => {
	let { callback, pageno, cats, isInstitute } = props
	const [showForm, setShowForm] = useState(false)
	let [data, setData] = useState({})
	const [institutes, setInstitutes] = useState([])
	const [institutesLoading, setInstitutesLoading] = useState(false)
	const [studentInstituteOpt, setStudentInstituteOpt] = useState(null)
	const [hasAcceptedOffer, setHasAcceptedOffer] = useState(false)
	const handleChange = (v, k) => {
		data[k] = v
		setData({ ...data })
	}
	const save = () => {
		message.destroy()
		// Institute field is now optional - students can submit issues without selecting an institute
		util.showLoader()
		data.description = GetTinymceContent("ta_issue")
		const apiCall = isInstitute
			? InstituteService.createInstituteIssue(data)
			: StudentService.createIssue(data)
		apiCall
			.then(({ data }) => {
				message.success(data.message || "Saved")
				SetTinymceContent("ta_issue", "")
				callback(data.id ? pageno : 1)
				setShowForm(false)
			})
			.catch((e) => {
				message.error(e.message)
			})
			.finally(() => {
				util.hideLoader()
			})
	}

	const uploadFile = async (e) => {
		if (util.checkImage(e.target, 5)) {
			util.showLoader()
			try {
				let rs = isInstitute
					? await FileService.upload(e.target.files[0])
					: await FileService.uploadPhp(e.target.files[0])
				setData({
					...data,
					file_id: rs.data.file_id,
					file_url: rs.data.file_url,
				})
			} catch (e) { }
			e.target.value = ""
			util.hideLoader()
		}
	}

	const closeForm = () => {
		setShowForm(false)
	}

	useEffect(() => {
		if (isInstitute) return
		if (util.isStudent() !== 1) return
		let cancelled = false
		;(async () => {
			setInstitutesLoading(true)
			try {
				// Resolve session from local storage (fallback to activeSession)
				let session = ""
				try {
					const rawSelected = localStorage.getItem("selectedSession")
					const selected = rawSelected ? JSON.parse(rawSelected) : null
					if (selected && selected.name) session = selected.name
				} catch (e) {
					// ignore
				}
				if (!session) session = localStorage.getItem("activeSession") || "2025-2026"

				// Resolve student_id / institute_id (token-based) using existing endpoint used elsewhere
				let student_id = null
				let institute_id = null
				let instituteNameFromApplied = ""
				let appliedCoursesList = []
				try {
					const { data } = await InstituteService.getInstituteId()
					student_id =
						data?.data?.student_id ||
						data?.student_id ||
						data?.result?.student_id ||
						null
					institute_id =
						data?.data?.institute_id ||
						data?.institute_id ||
						data?.result?.institute_id ||
						null
				} catch (e) {
					// ignore: fallback below will try student detail
				}

				// Fallback: student_id from local storage and institute_id from student detail
				if (!student_id) {
					const fallbackStudentId = util.getUserId && util.getUserId()
					if (fallbackStudentId) student_id = fallbackStudentId
				}
				if (student_id && !institute_id) {
					try {
						const stuRes = await StudentService.detail(student_id)
						const container =
							(stuRes && (stuRes.data?.result || stuRes.data?.data || stuRes.data)) ||
							{}
						const foundInstituteId =
							container?.institute_id ||
							container?.inst_id ||
							container?.instituteId ||
							container?.student?.institute_id ||
							container?.student?.inst_id ||
							container?.student?.instituteId ||
							container?.user?.institute_id ||
							container?.profile?.institute_id ||
							null
						if (foundInstituteId) institute_id = foundInstituteId
					} catch (e) {
						// ignore
					}
				}
				if (student_id) {
					try {
						const { data: appliedRes } = await StudentService.appliedCourses({
							student_id,
						})
						const courses = appliedRes?.result?.data || []
						appliedCoursesList = Array.isArray(courses) ? courses : []
						
						// Filter to only show institutes where BOTH institute AND student have accepted
						const acceptedCourses = courses.filter((c) => {
							const insStatus = String(c?.ins_status || "").trim().toLowerCase()
							const stuStatus = String(c?.stu_status || "").trim().toLowerCase()
							return insStatus === "accepted" && stuStatus === "accepted"
						})
						
						// Set hasAcceptedOffer flag
						if (!cancelled) setHasAcceptedOffer(acceptedCourses.length > 0)
						
						// Use only accepted courses for institute list
						appliedCoursesList = acceptedCourses
						
						const picked = acceptedCourses[0]
						if (picked?.institute_id && !institute_id) institute_id = picked.institute_id
						if (picked?.institute_id) {
							instituteNameFromApplied =
								picked?.inst_name ||
								picked?.institute_name ||
								picked?.institute ||
								picked?.name ||
								""
						}
					} catch (e) {
						// ignore
					}
				}

				if (!student_id) {
					throw new Error("Student ID not found")
				}

				let assignedInstituteOpt = null
				if (institute_id) {
					assignedInstituteOpt = {
						value: institute_id,
						label:
							instituteNameFromApplied
								? instituteNameFromApplied
								: `Institute #${institute_id}`,
					}
					try {
						const insRes = await InstituteService.detail(institute_id)
						const ins = insRes?.data?.result
						const name =
							ins?.name ||
							ins?.institute_name ||
							ins?.inst_name ||
							ins?.institute ||
							ins?.title ||
							""
						if (name && !instituteNameFromApplied) {
							assignedInstituteOpt = {
								value: institute_id,
								label: name,
							}
						}
					} catch (e) {
						// ignore: fallback label will be used
					}
					if (!cancelled) setStudentInstituteOpt(assignedInstituteOpt)
				}

				// Only include institutes with accepted offers (both institute and student accepted)
				const raw = Array.isArray(appliedCoursesList) ? appliedCoursesList : []
				const byId = new Map()
				if (assignedInstituteOpt?.value) {
					byId.set(String(assignedInstituteOpt.value), assignedInstituteOpt)
				}
				raw.forEach((r) => {
					const id = r?.institute_id
					if (!id) return
					// Double-check that BOTH institute and student have accepted
					const insStatus = String(r?.ins_status || "").trim().toLowerCase()
					const stuStatus = String(r?.stu_status || "").trim().toLowerCase()
					if (insStatus !== "accepted" || stuStatus !== "accepted") return
					if (byId.has(String(id))) return
					byId.set(String(id), {
						value: id,
						label:
							r?.inst_name ||
							r?.institute_name ||
							r?.institute ||
							`Institute #${id}`,
					})
				})

				const opts = Array.from(byId.values())
				if (!cancelled) setInstitutes(opts)
			} catch (e) {
				if (!cancelled) {
					setInstitutes(studentInstituteOpt?.value ? [studentInstituteOpt] : [])
				}
			} finally {
				if (!cancelled) setInstitutesLoading(false)
			}
		})()
		return () => {
			cancelled = true
		}
	}, [isInstitute])

	// Removed auto-population of institute_id - students should manually select if needed
	// useEffect(() => {
	// 	if (isInstitute) return
	// 	if (!showForm) return
	// 	if (!studentInstituteOpt?.value) return
	// 	setData((prev) => {
	// 		if (prev && prev.institute_id) return prev
	// 		return { ...(prev || {}), institute_id: studentInstituteOpt.value }
	// 	})
	// }, [showForm, studentInstituteOpt, isInstitute])

	useImperativeHandle(ref, () => ({
		openForm(dtl) {
			if (dtl) {
				setData({ ...dtl })
			} else {
				// Initialize with empty form - no auto-population of institute
				const next = { description: "", status: "Open" }
				setData(next)
			}
			setShowForm(true)
		},
	}))

	return (
		<Modal
			title="Create Issue"
			visible={showForm}
			okText="Save"
			onOk={save}
			onCancel={closeForm}
			destroyOnClose
			maskClosable={false}
			width={1200}
			styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
		>
			<form
				onSubmit={(e) => {
					e.preventDefault()
					save()
				}}
				autoComplete="off"
				spellCheck="false"
			>
				<div className="">
					<div className="row mingap">
						{!isInstitute && hasAcceptedOffer && (
							<div className="col-md-12 form-group">
								<label>Institute (Optional)</label>
								<AntdSelect
									placeholder="Select Institute (Optional)"
									showSearch
									allowClear
									loading={institutesLoading}
									options={institutes}
									value={data.institute_id}
									onChange={(v) => {
										handleChange(v, "institute_id")
									}}
									getPopupContainer={triggerNode => triggerNode.parentNode}
									optionFilterProp="label"
								/>
							</div>
						)}
						<div className="col-md-12 form-group">
							<label className="req">Issue Category</label>
							<div>
								<AntdSelect
									options={cats}
									value={data.cat_id}
									onChange={(v) => {
										handleChange(v, "cat_id")
									}}
									getPopupContainer={triggerNode => triggerNode.parentNode}
								/>
							</div>
						</div>

						<div className="col-md-12 form-group">
							<label className="req">Issue Description</label>
							<Tinymce id="ta_issue" data={data.description} />
						</div>

						<div className="col-md-12 form-group">
							<div className="">
								<div className="pb5">
									<label className="ant-btn m-0">
										<input
											type="file"
											className="d-none"
											accept="image/*"
											onChange={(e) => uploadFile(e)}
										/>
										<i className="fa fa-paperclip"></i> Upload Attachment
									</label>
								</div>
								<div className="w100">
									{data.file_url && (
										<div>
											<Image
												src={normalizeUploadsUrl(
													data.file_url,
													isInstitute ? "node" : "php"
												)}
												className="mw-100"
												preview={{ mask: "View" }}
											/>
											<div
												className="font-red cpointer"
												onClick={() => {
													data.file_url = ""
													data.file_id = ""
													setData({ ...data })
												}}
											>
												Delete
											</div>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</form>
		</Modal>
	)
})

const ReplyModal = forwardRef((props, ref) => {
	const {
		updateRow,
		isInstitute,
		isInstituteQueriesLayout,
		isStudentIssuesLayout,
		activeTab,
	} = props
	const [showModal, setShowModal] = useState(false)
	const [dtl, setDtl] = useState({})
	const [replies, setReplies] = useState([])
	const [commnetText, setCommentText] = useState("")
	const cmtListBoxRef = useRef()
	const isAdminInstituteTab =
		util.isClientAdmin && util.isClientAdmin() === 1 && activeTab === "institutes"

	const resolveIssueId = (obj) => {
		return (
			(obj && (obj.id || obj.issue_id || obj.issueId || obj.issueID)) ||
			null
		)
	}

	const addReply = (data) => {
		const issueId = resolveIssueId(dtl)
		if (!issueId) {
			message.error("Issue ID required")
			return
		}
		data.issue_id = issueId
		message.destroy()
		util.showLoader()
		
		// Admin "institutes" tab uses Node list API (InstituteService.allInstituteIssuesforAdmin),
		// so the issue IDs belong to Node. Reply must also go to Node, otherwise PHP will return
		// "Invalid Issue ID".
		// Check if this is actually an institute issue by looking at the issue data structure
		// Student issues will have student_id or student_regno, institute issues will have institute_id
		const isStudentIssue = Boolean(
			(dtl && (dtl.student_id || dtl.student_regno)) // has student-specific fields
		)
		const isInstituteIssue = Boolean(
			(dtl && dtl.institute_id) || // has institute_id field
			isInstituteQueriesLayout || 
			isAdminInstituteTab
		)
		
		const req = isInstituteIssue && !isStudentIssue
			? InstituteService.addInstituteIssueReply(issueId, {
				msg: data.msg,
				file_id: data.file_id || null,
			})
			: StudentService.createIssueReply(data)

		req
			.then((res) => {
				message.success(res.data.message || "Saved")
				if (isInstituteIssue && !isStudentIssue) {
					const nextDtl = {
						...dtl,
						id: issueId,
						reply_count: Number(dtl.reply_count || 0) + 1,
					}
					updateRow({ ...nextDtl })
					setDtl(nextDtl)
					getReplies(issueId)
					setCommentText("")
					return
				}
				const row = res?.data?.row_dtl || {}
				const nextDtl = {
					...row,
					id: resolveIssueId(row) || issueId,
					reply_count: Number(row?.reply_count ?? dtl?.reply_count ?? 0),
				}
				updateRow(nextDtl)
				setDtl(nextDtl)
				getReplies(nextDtl.id)
				setCommentText("")
			})
			.catch((e) => {
				message.error(e.message)
			})
			.finally(() => {
				util.hideLoader()
			})
	}

	const getReplies = (id) => {
		const issueId = id || resolveIssueId(dtl)
		if (!issueId) {
			message.error("Issue ID required")
			return
		}
		util.showLoader()
		
		// Check if this is actually an institute issue by looking at the issue data structure
		// Student issues will have student_id or student_regno, institute issues will have institute_id
		const isStudentIssue = Boolean(
			(dtl && (dtl.student_id || dtl.student_regno)) // has student-specific fields
		)
		const isInstituteIssue = Boolean(
			(dtl && dtl.institute_id) || // has institute_id field
			isInstituteQueriesLayout || 
			isAdminInstituteTab
		)
		
		const preferOrigin = isInstituteIssue && !isStudentIssue ? "node" : "php"
		const req = isInstituteIssue && !isStudentIssue
			? InstituteService.instituteIssueReplies(issueId)
			: StudentService.issueReplies(issueId)
		req
			.then((res) => {
				const arr = Array.isArray(res?.data?.result) ? res.data.result : []
				
				// Filter out empty or invalid replies
				const filteredArr = arr.filter(v => v && (v.msg || v.file_url))
				
				if (isInstituteIssue && !isStudentIssue) {
					const mapped = filteredArr.map((v) => {
						const file_url =
							v.file_url || (v.file_name ? `/uploads/files/${v.file_name}` : "")
						return { ...v, file_url }
					})
					setReplies(mapped)
					return
				}
				setReplies(
					filteredArr.map((v) => {
						if (!v) return v
						if (!v.file_url) return v
						return { ...v, file_url: normalizeUploadsUrl(v.file_url, preferOrigin) }
					})
				)
			})
			.catch((e) => {
				console.error('[getReplies] Error:', e)
				// Suppress "not found" errors as they might be false positives
				if (e.message && !e.message.toLowerCase().includes('not found')) {
					message.error(e.message)
				}
			})
			.finally(() => {
				util.hideLoader()
			})
	}

	const uploadFile = async (e) => {
		if (util.checkImage(e.target, 5)) {
			util.showLoader()
			try {
				let rs = null
				// For PHP-backed replies, use PHP uploader so the reply endpoint gets a compatible file_id
				const usePhpUpload = Boolean(isStudentIssuesLayout)
				if (usePhpUpload) {
					rs = await FileService.uploadPhp(e.target.files[0])
				} else {
					rs = await FileService.upload(e.target.files[0])
				}

				if (!rs) {
					// fallback to node upload if php upload failed
					rs = await FileService.upload(e.target.files[0])
				}
				const fallbackMsg = (commnetText && String(commnetText).trim()) || "Photo"
				addReply({ file_id: rs.data.file_id, msg: fallbackMsg })
			} catch (e) { }
			e.target.value = ""
			util.hideLoader()
		}
	}

	const deleteReply = (id, i) => {
		message.destroy()
		confirm({
			title: "Do you Want to delete this comment?",
			icon: <ExclamationCircleOutlined />,
			content: "",
			okText: "Yes",
			okType: "danger",
			cancelText: "No",
			onOk() {
				util.showLoader()
				StudentService.deleteIssueReply(id)
					.then(({ data }) => {
						message.success(data.message || "Deleted")
						replies.splice(i, 1)
						setReplies([...replies])
						dtl.reply_count -= 1
						updateRow({ ...dtl })
						setDtl({ ...dtl })
					})
					.catch((e) => {
						message.error(e.message)
					})
					.finally(() => {
						util.hideLoader()
					})
			},
			onCancel() { },
		})
	}

	const setIssueStatus = (status) => {
		// Front-end guard: only allow known statuses
		const allowed = ["Open", "In Process", "Closed"]
		if (!allowed.includes(status)) {
			message.error("Invalid status")
			return
		}
		const issueId = resolveIssueId(dtl)
		if (!issueId) {
			message.error("Issue ID required")
			return
		}

		message.destroy()
		confirm({
			title: "Do you want to mark as " + status + "?",
			icon: <ExclamationCircleOutlined />,
			content: "",
			okText: "Yes",
			okType: "danger",
			cancelText: "No",
			onOk() {
				util.showLoader()
				// Check if this is actually an institute issue by looking at the issue data structure
				// Student issues will have student_id or student_regno, institute issues will have institute_id
				const isStudentIssue = Boolean(
					(dtl && (dtl.student_id || dtl.student_regno)) // has student-specific fields
				)
				const isInstituteIssue = Boolean(
					(dtl && dtl.institute_id) || // has institute_id field
					isInstituteQueriesLayout || 
					isAdminInstituteTab
				)
				const req = isInstituteIssue && !isStudentIssue
					? InstituteService.updateInstituteIssueStatus(issueId, status)
					: StudentService.setIssueStatus(issueId, status)
				
				req
					.then(({ data }) => {
						// both endpoints return a success message
						message.success(data?.message || "Issue status changed")
						
						// Update the local state immediately with the exact status we sent
						const nextDtl = { ...dtl, id: issueId, status: status }
						
						updateRow({ ...nextDtl })
						setDtl({ ...nextDtl })
						
						// If status is "Closed" and user is super admin, show option to send email
						// Only for student issues (not institute issues)
						if (status === "Closed" && util.isClientAdmin && util.isClientAdmin() === 1 && isStudentIssue) {
							setTimeout(() => {
								confirm({
									title: "Send Resolution Email?",
									icon: <ExclamationCircleOutlined />,
									content: "Would you like to send an email to the student notifying them that their issue has been resolved?",
									okText: "Send Email",
									cancelText: "Skip",
									onOk() {
										sendResolutionEmail(issueId, nextDtl)
									},
									onCancel() {
										// Explicitly preserve status when skipping
									},
								})
							}, 500)
						}
					})
					.catch((e) => {
						message.error(e.message)
					})
					.finally(() => {
						util.hideLoader()
					})
			},
			onCancel() { },
		})
	}

	const sendResolutionEmail = (issueId, issueDetails) => {
		if (!issueId) {
			message.error("Issue ID required")
			return
		}
		
		// Validate that we have the issue details
		if (!issueDetails) {
			message.error("Issue details not available")
			return
		}
		
		util.showLoader()
		StudentService.sendEmailToStudentForIssue({
			issue_id: issueId,
			subject: "Query Resolved - Study India Scholarship",
			message: "" // Backend will use default template
		})
			.then(async ({ data }) => {
				message.success(data?.message || "Email sent successfully")
				
				// Check if backend status differs from what we expect
				if (data?.result?.issue_status && data.result.issue_status !== "Closed") {
					// Re-update the status to ensure it's saved correctly
					try {
						await StudentService.setIssueStatus(issueId, "Closed")
					} catch (e) {
						// Silent fail
					}
				}
				
				// IMPORTANT: Ensure the status remains "Closed" in local state
				const preservedDtl = { 
					...issueDetails, 
					id: issueId,
					status: "Closed" // Explicitly set to Closed
				}
				
				setDtl(preservedDtl)
				updateRow(preservedDtl)
			})
			.catch((e) => {
				message.error(e?.message || "Failed to send email")
			})
			.finally(() => {
				util.hideLoader()
			})
	}

	const closeModal = () => {
		setShowModal(false)
	}

	useImperativeHandle(ref, () => ({
		open(idtl) {
			const issueId = resolveIssueId(idtl)
			setDtl({ ...(idtl || {}), id: issueId || (idtl && idtl.id) })
			setShowModal(true)
			getReplies(issueId)
			setCommentText("")
		},
	}))

	useEffect(() => {
		if (cmtListBoxRef.current) {
			cmtListBoxRef.current.scrollTop = cmtListBoxRef.current.scrollHeight
		}
	}, [replies])

	let commentListBoxHeight = $(window).height() - 490

	return (
		<Modal
			title="Issue"
			visible={showModal}
			onCancel={closeModal}
			destroyOnClose
			maskClosable={false}
			width={1200}
			style={{ top: 150 }}
			footer={null}
			styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
		>
			<div>
				<div className="border-bottom pb15 mb15">
					Student:{" "}
					<strong>
						{dtl.name} [{dtl.regno}] [{dtl.email}]
					</strong>
				</div>
				<div className="border-bottom pb15 mb15">
					<div className="uc">
						<div className="d-flex">
							<div className="my-auto">
								<strong>{dtl.cat}</strong> |{" "}
								<span>
									Created On:{" "}
									{util.getDate(dtl.created, "DD MMM YYYY @ hh:mm A")}
								</span>
							</div>
							<div className="my-auto pl5 pr10">| Current Status :</div>
							<div className="my-auto">
								<AntdTag
									type={
										dtl.status === "Open"
											? "danger"
											: dtl.status === "Closed"
												? "success"
												: "primary"
									}
								>
									{dtl.status}
								</AntdTag>
							</div>
						</div>
					</div>

					<div className="email-body pt5 text-secondary">
						<RawHTML html={dtl.description} />
					</div>
				</div>

				<div>
					<h4>
						Comments{" "}
						<span className="badge badge-default">{replies?.length}</span>
					</h4>
					{replies?.length > 0 && (
						<div
							className="mt-comments portlet-lgt mb15 cscroll"
							ref={cmtListBoxRef}
							style={{ maxHeight: commentListBoxHeight, overflow: "auto" }}
						>
							{replies?.filter(v => v && (v.msg || v.file_url)).map((v, i) => (
								<div key={v.id || `reply-${i}`} className="mt-comment">
									<div className="mt-comment-body pl-0">
										<div className="mt-comment-info">
											<span className="mt-comment-author mb2">
												{util.isStudent() === 1 &&
													v.created_by_type === "STUDENT" ? (
													<span>You</span>
												) : (
													<>
														<span>{v.created_by_name} </span>
														{v.created_by_type !== "STUDENT"
															? "(SIS Admin)"
															: "(Student)"}
													</>
												)}
											</span>
											<span className="mt-comment-date">
												{util.getDate(v.created, "DD MMM YYYY @ hh:mm A")}
											</span>
										</div>
										<div className="mt-comment-text">
											{v.file_url === "" ? (
												<RawHTML html={v.msg} />
											) : (
												<div className="w200 p5">
													<Image
														src={normalizeUploadsUrl(v.file_url, "php")}
														className="mw-100"
														preview={{ mask: "View" }}
													/>
												</div>
											)}
										</div>
									</div>
									{v.delete_allowed === 1 && (
										<div
											className="mt5 text-danger fs11 cpointer"
											onClick={() => deleteReply(v.id, i)}
										>
											<i className="fa fa-trash"></i> Delete
										</div>
									)}
								</div>
							))}
						</div>
					)}

					<div>
						<div className="p10 bg-light">
							<div className="mb5">
								<Input.TextArea
									placeholder="Leave your comment here..."
									value={commnetText}
									onChange={(e) => setCommentText(e.target.value)}
									allowClear
									rows="3"
									spellCheck="false"
									disabled={dtl.status === "Closed"}
								/>
							</div>
							<Button
								type="primary"
								onClick={() => addReply({ msg: commnetText })}
								disabled={dtl.status === "Closed"}
							>
								Submit
							</Button>
						</div>
						<div className="pt10">
							<div className="d-flex">
								<div>
									<label
										className="ant-btn ant-btn-dashed m-0"
										disabled={dtl.status === "Closed"}
									>
										<input
											type="file"
											className="d-none"
											onChange={uploadFile}
											accept="image/*"
											disabled={dtl.status === "Closed"}
										/>
										<i className="fa fa-upload mr5"></i> Upload Photo
									</label>
								</div>

								{((util.isClientAdmin && util.isClientAdmin() === 1) ||
									(isInstitute && isStudentIssuesLayout)) && (
									<>
										<div className="ml-auto">
											<div className="d-flex">
												<div className="mr5">
													<Button
														type="danger"
														onClick={() => setIssueStatus("Open")}
														disabled={dtl.status === "Open"}
													>
														Mark as Open
													</Button>
												</div>
												<div className="mr5">
													<button
														className="btn btn-primary"
														onClick={() => setIssueStatus("In Process")}
														disabled={dtl.status === "In Process"}
													>
														Mark as In Progress
													</button>
												</div>
												<div>
													<button
														className="btn green"
														onClick={() => setIssueStatus("Closed")}
														disabled={dtl.status === "Closed"}
													>
														Mark as Closed
													</button>
												</div>
											</div>
										</div>
									</>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</Modal>
	)
})
