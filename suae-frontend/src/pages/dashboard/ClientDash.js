// import React, { useEffect, useState, useMemo, useContext } from 'react'
// import { Empty, Table } from 'antd'
// import CmasterService from '../../services/CmasterService'
// import {
//   ResponsiveContainer,
//   Tooltip,
//   Legend,
//   PieChart,
//   Pie,
//   Cell,
//   BarChart,
//   CartesianGrid,
//   XAxis,
//   YAxis,
//   Bar,
// } from 'recharts'
// import { SessionContext } from '../../context/SessionContext'

// export default function ClientDash() {
//   const [result, setResult] = useState(null)
//   const [instScore, setInstScore] = useState(null)
//   const [genderRatio, setGenderRatio] = useState(null)
//   const [issueStats, setIssueStats] = useState(null)
//   const [ageRangeStats, setAgeRange] = useState(null)
//   const [topInst, setTopInst] = useState(null)
//   const [topCountry, setTopCountry] = useState(null)
//   const [agentStage, setAgentStage] = useState(null)
//   const { selectedSession, activeSession } = useContext(SessionContext)

//   const session = selectedSession?.name || activeSession?.name || "";

//   useEffect(() => {

//     if (!session) return;

//     CmasterService.getClientDashDetail(session)
//       .then(res => setResult(res?.result || null))
//       .catch(() => setResult(null))

//     CmasterService.getInstituteDashDeatil(session)
//       .then(res => setInstScore(res?.result?.data || null))
//       .catch(() => setInstScore(null))

//     CmasterService.getGenderRatio(session)
//       .then(res => setGenderRatio(res?.result || null))
//       .catch(() => setGenderRatio(null))

//     CmasterService.getStuIssueStats(session)
//       .then(res => setIssueStats(res?.result || null))
//       .catch(() => setIssueStats(null))

//     CmasterService.getAgeRange(session)
//       .then(res => setAgeRange(res?.result || null))
//       .catch(() => setAgeRange(null))

//     CmasterService.getTopInstitutes(session)
//       .then(res => setTopInst(res?.result?.data || null))
//       .catch(() => setTopInst(null))

//     CmasterService.getTopCountries(session)
//       .then(res => setTopCountry(res?.result?.data || null))
//       .catch(() => setTopCountry(null))

//     CmasterService.getAgentStage(session)
//       .then(res => setAgentStage(res?.result || null))
//       .catch(() => setAgentStage(null))
//   }, [session])

//   return (
//     <div className="ndashbx">
//       <ScoreBoard
//         result={result}
//         instScore={instScore}
//         genderRatio={genderRatio}
//         issueStats={issueStats}
//         ageRangeStats={ageRangeStats}
//         topInst={topInst}
//         topCountry={topCountry}
//         agentStage={agentStage}
//       />
//     </div>
//   )
// }

// function ScoreBoard({ result, instScore, genderRatio, issueStats, ageRangeStats, topInst, topCountry, agentStage }) {
//   return (
//     <div>
//       <StudentScoreCards result={result} />
//       {agentStage ? <AgentScoreCards agentStage={agentStage} /> : null}

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         {/* Left: Student Issues */}
//         <IssueStatsChart issueStats={issueStats} />
//         {/* Right: Gender Ratio */}
//         <GenderRatioChart genderRatio={genderRatio} />
//       </div>
//       <AgeRangeChart ageRangeStats={ageRangeStats} />
//       <InstituteStage instScore={instScore} />
//       <TopInstitutesChart topInst={topInst} />
//       <TopCountriesChart topCountry={topCountry} />

//       <LeadsModule result={result} />
//     </div>
//   )
// }

// function StudentScoreCards({ result }) {
//   const totals = useMemo(() => ({
//     total_students: Number(result?.total_students || 0),
//     basic_info_completed: Number(result?.basic_info_completed || 0),
//     additional_info_completed: Number(result?.additional_info_completed || 0),
//     educational_info_completed: Number(result?.educational_info_completed || 0),
//     background_info_completed: Number(result?.background_info_completed || 0),
//     choice_filling_completed: Number(result?.choice_filling_completed || 0),
//     admission_offered: Number(result?.admission_offered || 0),
//     offer_accepted: Number(result?.offer_accepted || 0),
//     payment_proof_uploaded: Number(result?.payment_proof_uploaded || 0),
//     visa_letter_sent: Number(result?.visa_letter_sent || 0),
//     pickup_scheduled: Number(result?.pickup_scheduled || 0),
//     enrolled: Number(result?.enrolled || 0),
//   }), [result])

//   const cards = [
//     { key: 'total_students', label: 'Total Students', value: totals.total_students, icon: 'fa-users', iconBg: '#e6f4ff', iconFg: '#1677ff', href: '/students?stage=all' },
//     { key: 'basic_info_completed', label: 'Basic Info', value: totals.basic_info_completed, icon: 'fa-id-card', iconBg: '#f0f5ff', iconFg: '#2f54eb', href: '/students?basic_info=Yes' },
//     { key: 'additional_info_completed', label: 'Additional Info', value: totals.additional_info_completed, icon: 'fa-info-circle', iconBg: '#e6fffb', iconFg: '#13c2c2', href: '/students?stage=additional_info_completed' },
//     { key: 'educational_info_completed', label: 'Educational Info', value: totals.educational_info_completed, icon: 'fa-book', iconBg: '#fffbe6', iconFg: '#faad14', href: '/students?edu_info=Yes' },
//     { key: 'background_info_completed', label: 'Background Info', value: totals.background_info_completed, icon: 'fa-address-card', iconBg: '#f9f0ff', iconFg: '#722ed1', href: '/students?background_info=Yes' },
//     { key: 'choice_filling_completed', label: 'Choice Filling', value: totals.choice_filling_completed, icon: 'fa-list-ul', iconBg: '#f6ffed', iconFg: '#52c41a', href: '/students?stage=choice_filling_completed' },
//     { key: 'admission_offered', label: 'Admission Offered', value: totals.admission_offered, icon: 'fa-check-circle', iconBg: '#edfff3', iconFg: '#389e0d', href: '/students?stage=admission_offered' },
//     { key: 'offer_accepted', label: 'Offer Accepted', value: totals.offer_accepted, icon: 'fa-thumbs-up', iconBg: '#e6fffb', iconFg: '#13c2c2', href: '/students?stage=offer_accepted' },
//     { key: 'payment_proof_uploaded', label: 'Payment Proof', value: totals.payment_proof_uploaded, icon: 'fa-credit-card', iconBg: '#edf5ff', iconFg: '#1890ff', href: '/students?payment_proof=Uploaded' },
//     { key: 'visa_letter_sent', label: 'Visa Letters', value: totals.visa_letter_sent, icon: 'fa-envelope-open', iconBg: '#fff0f6', iconFg: '#eb2f96', href: '/students?stage=visa_letter_sent' },
//     { key: 'pickup_scheduled', label: 'Pickup Scheduled', value: totals.pickup_scheduled, icon: 'fa-calendar', iconBg: '#f6ffed', iconFg: '#389e0d', href: '/students?stage=pickup_scheduled' },
//     { key: 'enrolled', label: 'Enrolled', value: totals.enrolled, icon: 'fa-graduation-cap', iconBg: '#f9f0ff', iconFg: '#722ed1', href: '/students?stage=enrolled' },
//   ]

//   return (
//     <div className="dash-section">
//       <div className="dash-header"><h2 className="dash-title">Student Scoreboard</h2></div>
//       <div className="dash-body">
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
//           {cards.map(c => (
//             <a key={c.key} href={c.href} target="_blank" rel="noreferrer" className="no-underline" style={{ color: 'inherit' }}>
//               <div className="shadow-md rounded-lg" style={{ background: '#fff', border: '1px solid #eef2ff', padding: 10 }}>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//                   <span style={{ width: 30, height: 30, borderRadius: 8, background: c.iconBg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
//                     <i className={`fa ${c.icon}`} aria-hidden="true" style={{ color: c.iconFg }}></i>
//                   </span>
//                   <div className="dash-muted" style={{ fontSize: 11 }}>{c.label}</div>
//                 </div>
//                 <div style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginTop: 6 }}>{Number(c.value || 0).toLocaleString()}</div>
//               </div>
//             </a>
//           ))}
//         </div>
//       </div>
//     </div>
//   )
// }

// function AgentScoreCards({ agentStage }) {
//   const totals = useMemo(() => ({
//     total_agents: Number(agentStage?.summary?.total_agents || 0),
//     total_registered: Number(agentStage?.summary?.total_registered || 0),
//     total_choice_filled: Number(agentStage?.summary?.total_choice_filled || 0),
//     total_admission_offered: Number(agentStage?.summary?.total_admission_offered || 0),
//     total_admission_rejected: Number(agentStage?.summary?.total_admission_rejected || 0),
//     total_accepted_by_student: Number(agentStage?.summary?.total_accepted_by_student || 0),
//     total_rejected_by_student: Number(agentStage?.summary?.total_rejected_by_student || 0),
//     total_payment_proof_uploaded: Number(agentStage?.summary?.total_payment_proof_uploaded || 0),
//     total_enrolled: Number(agentStage?.summary?.total_enrolled || 0),
//   }), [agentStage])

//   const cards = [
//     { key: 'total_agents', label: 'Agents', value: totals.total_agents, icon: 'fa-user-tie', iconBg: '#e6f4ff', iconFg: '#1677ff' },
//     { key: 'total_registered', label: 'Registered', value: totals.total_registered, icon: 'fa-user-check', iconBg: '#f6ffed', iconFg: '#52c41a' },
//     { key: 'total_choice_filled', label: 'Choices Filled', value: totals.total_choice_filled, icon: 'fa-list-ul', iconBg: '#fffbe6', iconFg: '#faad14' },
//     { key: 'total_admission_offered', label: 'Admission Offered', value: totals.total_admission_offered, icon: 'fa-check-circle', iconBg: '#eafff5', iconFg: '#389e0d' },
//     { key: 'total_admission_rejected', label: 'Admission Rejected', value: totals.total_admission_rejected, icon: 'fa-times-circle', iconBg: '#fff2f0', iconFg: '#f5222d' },
//     { key: 'total_accepted_by_student', label: 'Accepted by Student', value: totals.total_accepted_by_student, icon: 'fa-thumbs-up', iconBg: '#e6fffb', iconFg: '#13c2c2' },
//     { key: 'total_rejected_by_student', label: 'Rejected by Student', value: totals.total_rejected_by_student, icon: 'fa-thumbs-down', iconBg: '#fff7e6', iconFg: '#fa8c16' },
//     { key: 'total_payment_proof_uploaded', label: 'Payment Proof', value: totals.total_payment_proof_uploaded, icon: 'fa-credit-card', iconBg: '#edf5ff', iconFg: '#1890ff' },
//     { key: 'total_enrolled', label: 'Enrolled', value: totals.total_enrolled, icon: 'fa-graduation-cap', iconBg: '#f9f0ff', iconFg: '#722ed1' },
//   ]

//   return (
//     <div className="dash-section">
//       <div className="dash-header"><h2 className="dash-title">Agent Scoreboard</h2></div>
//       <div className="dash-body">
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
//           {cards.map(c => (
//             <div key={c.key} className="shadow-md rounded-lg" style={{ background: '#fff', border: '1px solid #eef2ff', padding: 10 }}>
//               <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//                 <span style={{ width: 30, height: 30, borderRadius: 8, background: c.iconBg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
//                   <i className={`fa ${c.icon}`} aria-hidden="true" style={{ color: c.iconFg }}></i>
//                 </span>
//                 <div className="dash-muted" style={{ fontSize: 11 }}>{c.label}</div>
//               </div>
//               <div style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginTop: 6 }}>{Number(c.value || 0).toLocaleString()}</div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   )
// }

// function LeadsModule({ result }) {
//   return (
//     <div className="dash-section">
//       <div className="dash-header"><h2 className="dash-title">Leads</h2></div>
//       <div className="dash-body">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <ScoreBoardTotalLeads result={result} />
//           <ScoreBoardTotalLeadsStage result={result} />
//         </div>
//       </div>
//     </div>
//   )
// }


// function ScoreBoardTotalLeads({ result }) {
//   const total = Number(result?.total_students || 0)
//   const online = Number(result?.additional_info_completed || 0)
//   const offline = Math.max(0, total - online)
//   const onlinePct = total ? (online / total) * 100 : 0
//   const offlinePct = total ? (offline / total) * 100 : 0

//   const pieData = [
//     { name: 'Online', value: online },
//     { name: 'Offline', value: offline },
//   ]

//   const getPieColor = (name, value, totalVal) => {
//     if (totalVal === 0) return '#d9d9d9'
//     const ratio = Math.max(0, Math.min(1, value / totalVal))
//     if (name === 'Online') {
//       return ratio === 0 ? '#d9e8ff' : ratio < 0.33 ? '#69b1ff' : ratio < 0.66 ? '#4096ff' : '#1677ff'
//     }
//     return ratio === 0 ? '#d6f4f4' : ratio < 0.33 ? '#87e8de' : ratio < 0.66 ? '#36cfc9' : '#13c2c2'
//   }

//   return (
//     <div className="dash-section">
//       <div className="dash-header"><h3 className="dash-title">Total Leads</h3></div>
//       <div className="dash-body">
//         <div className="pb10">
//           <h1 className="m0 p0 bold500 text-info">{total.toLocaleString()}</h1>
//         </div>
//         <div className="mb8">
//           <div className="progress m0">
//             <div className="lbl">Online: {online.toLocaleString()}</div>
//             <div className="progress-bar progress-bar-info" style={{ width: `${onlinePct}%` }}></div>
//           </div>
//         </div>
//         <div className="mb8">
//           <div className="progress progress-striped1 active1 m0">
//             <div className="lbl">Offline: {offline.toLocaleString()}</div>
//             <div className="progress-bar progress-bar-info" style={{ width: `${offlinePct}%` }}></div>
//           </div>
//         </div>
//         <div style={{ width: '100%', height: 220 }}>
//           <ResponsiveContainer>
//             <PieChart>
//               <Pie dataKey="value" data={pieData} cx="50%" cy="50%" outerRadius={70} label>
//                 {pieData.map((entry, index) => (
//                   <Cell key={`slice-${index}`} fill={getPieColor(entry.name, entry.value, total)} />
//                 ))}
//               </Pie>
//               <Tooltip formatter={(v) => Number(v).toLocaleString()} />
//               <Legend />
//             </PieChart>
//           </ResponsiveContainer>
//         </div>
//       </div>
//     </div>
//   )
// }

// function ScoreBoardTotalLeadsStage({ result }) {
//   const total = Number(result?.total_students || 0)
//   const stageRows = [
//     { label: 'Basic Info', value: Number(result?.basic_info_completed || 0) },
//     { label: 'Additional Info', value: Number(result?.additional_info_completed || 0) },
//     { label: 'Educational Info', value: Number(result?.educational_info_completed || 0) },
//     { label: 'Background Info', value: Number(result?.background_info_completed || 0) },
//     { label: 'Choice Filling', value: Number(result?.choice_filling_completed || 0) },
//     { label: 'Admission Offered', value: Number(result?.admission_offered || 0) },
//     { label: 'Offer Accepted', value: Number(result?.offer_accepted || 0) },
//     { label: 'Payment Proof Updated', value: Number(result?.payment_proof_uploaded || 0) },
//     { label: 'Visa Letter Sent', value: Number(result?.visa_letter_sent || 0) },
//     { label: 'Pickup Scheduled', value: Number(result?.pickup_scheduled || 0) },
//     { label: 'Enrolled', value: Number(result?.enrolled || 0) },
//   ]

//   return (
//     <div className="dash-section">
//       <div className="dash-header"><h3 className="dash-title">Total Leads Stages</h3></div>
//       <div className="dash-body">
//         <div className="pb10">
//           <h1 className="m0 p0 bold500 text-info">{total.toLocaleString()}</h1>
//         </div>
//         {stageRows.map((row) => {
//           const pct = total ? (row.value / total) * 100 : 0
//           return (
//             <div className="mb8" key={row.label}>
//               <div className="progress m0">
//                 <div className="lbl">{row.label}: {row.value.toLocaleString()}</div>
//                 <div className="progress-bar progress-bar-info" style={{ width: `${pct}%` }}></div>
//               </div>
//             </div>
//           )
//         })}
//       </div>
//     </div>
//   )
// }

// function GenderRatioChart({ genderRatio }) {
//   const data = useMemo(() => {
//     const arr = genderRatio?.data || []
//     return arr.map(d => ({ name: d.gender, value: Number(d.count || 0), percentage: Number(d.percentage || 0) }))
//   }, [genderRatio])
//   const total = Number(genderRatio?.summary?.total || data.reduce((s, d) => s + d.value, 0))
//   const colorMap = { Male: '#1890ff', Female: '#eb2f96', Transgender: '#722ed1', Unknown: '#8c8c8c' }
//   const getColor = (name) => colorMap[name] || '#bfbfbf'
//   const renderGenderLabel = ({ name, percent, value }) => {
//     if (!value || (percent * 100) < 2) return null
//     return `${name}: ${Math.round(percent * 100)}%`
//   }
//   if (!data || data.length === 0) {
//     return (
//       <div className="dash-section">
//         <div className="dash-header"><h3 className="dash-title">Gender Ratio</h3></div>
//         <div className="dash-body"><Empty description="No data" /></div>
//       </div>
//     )
//   }
//   return (
//     <div className='dash-section'>
//       <div className="dash-header"><h3 className="dash-title">Gender Ratio</h3></div>
//       <div className="dash-body">
//         <div style={{ width: '100%', height: 280 }}>
//           <ResponsiveContainer>
//             <PieChart>
//               <Pie dataKey="value" data={data} cx="50%" cy="50%" outerRadius={90} label={renderGenderLabel} labelLine={false} minAngle={2} paddingAngle={1}>
//                 {data.map((entry, index) => <Cell key={`gender-${index}`} fill={getColor(entry.name)} />)}
//               </Pie>
//               <Tooltip formatter={(v, n, p) => [`${Number(v).toLocaleString()}`, p?.payload?.name]} />
//             </PieChart>
//           </ResponsiveContainer>
//         </div>
//         <div className="mt10">
//           <div className="pb5 bold500">Total: {total.toLocaleString()}</div>
//           {data.map(d => (
//             <div key={d.name} className="mb5" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//               <span style={{ display: 'inline-block', width: 10, height: 10, background: getColor(d.name), borderRadius: 2 }}></span>
//               <span style={{ minWidth: 90 }}>{d.name}</span>
//               <span className="dash-muted" style={{ marginLeft: 'auto' }}>
//                 {d.value.toLocaleString()} ({d.percentage}%)
//               </span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   )
// }

// function IssueStatsChart({ issueStats }) {
//   const rows = useMemo(() => {
//     const arr = issueStats?.data || [];
//     return arr.map((d) => ({
//       name: String(d.status || ""),
//       value: Number(d.count || 0),
//     }));
//   }, [issueStats]);

//   if (!rows || rows.length === 0) {
//     return (
//       <div className="dash-section">
//         <div className="dash-header"><h3 className="dash-title">Student Issues</h3></div>
//         <div className="dash-body"><Empty description="No issues" /></div>
//       </div>
//     );
//   }

//   const iconFor = (name) => {
//     if (/open/i.test(name)) return { icon: 'fa-exclamation-circle', fg: '#f5222d', bg: '#fff1f0' }
//     if (/process|progress/i.test(name)) return { icon: 'fa-hourglass-half', fg: '#faad14', bg: '#fffbe6' }
//     if (/closed|resolved|done/i.test(name)) return { icon: 'fa-check-circle', fg: '#52c41a', bg: '#f6ffed' }
//     return { icon: 'fa-circle', fg: '#8c8c8c', bg: '#f5f5f5' }
//   }

//   return (
//     <div className="dash-section">
//       <div className="dash-header"><h3 className="dash-title">Student Issues</h3></div>
//       <div className="dash-body">
//         <div style={{ display: 'grid', gridTemplateRows: `repeat(${rows.length}, 1fr)`, rowGap: 8, minHeight: 280 }}>
//           {rows.map((d) => {
//             const i = iconFor(d.name)
//             return (
//               <div key={d.name} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
//                 <span style={{ width: 28, height: 28, borderRadius: 6, background: i.bg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
//                   <i className={`fa ${i.icon}`} aria-hidden="true" style={{ color: i.fg }}></i>
//                 </span>
//                 <div style={{ fontSize: 13, color: '#374151' }}>{d.name}</div>
//                 <div style={{ marginLeft: 'auto', fontWeight: 700, color: '#111827' }}>{Number(d.value || 0).toLocaleString()}</div>
//               </div>
//             )
//           })}
//         </div>
//       </div>
//     </div>
//   );
// }


// function AgeRangeChart({ ageRangeStats }) {
//   const rows = useMemo(() => {
//     const arr = ageRangeStats?.data || [];
//     return arr.map((d) => ({
//       range: d.range,
//       count: Number(d.count || 0),
//       percentage: Number(d.percentage || 0),
//     }));
//   }, [ageRangeStats]);

//   if (!rows || rows.length === 0) {
//     return (
//       <div className="dash-section">
//         <div className="dash-header"><h3 className="dash-title">Age Range</h3></div>
//         <div className="dash-body"><Empty description="No data" /></div>
//       </div>
//     );
//   }

//   // Soft pastel transparent colors
//   const COLORS = [
//     "rgba(72, 201, 176, 0.3)",   // soft green
//     "rgba(241, 196, 15, 0.3)",   // soft yellow
//     "rgba(231, 76, 60, 0.3)",    // soft red
//     "rgba(24, 144, 255, 0.3)",   // soft blue
//     "rgba(114, 46, 209, 0.3)",   // soft purple
//   ];

//   const BORDER_COLORS = [
//     "#48C9B0",
//     "#F1C40F",
//     "#E74C3C",
//     "#1890ff",
//     "#722ed1",
//   ];

//   return (
//     <div className="dash-section">
//       <div className="dash-header"><h3 className="dash-title">Age Range</h3></div>
//       <div className="dash-body" style={{ width: "100%", height: 300 }}>
//         <ResponsiveContainer>
//           <BarChart
//             data={rows}
//             margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
//           >
//             <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
//             <XAxis dataKey="range" tick={{ fill: "#374151" }} />
//             <YAxis tick={{ fill: "#374151" }} />
//             <Tooltip
//               formatter={(v, n, p) => [`${v} (${p.payload.percentage}%)`, n]}
//               contentStyle={{ backgroundColor: "#f9f9f9", borderRadius: 6, border: "1px solid #ddd" }}
//             />
//             <Legend />
//             <Bar dataKey="count" name="Students" radius={[6, 6, 0, 0]}>
//               {rows.map((entry, index) => (
//                 <Cell
//                   key={`cell-${index}`}
//                   fill={COLORS[index % COLORS.length]}
//                   stroke={BORDER_COLORS[index % BORDER_COLORS.length]}
//                   strokeWidth={2}
//                 />
//               ))}
//             </Bar>
//           </BarChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// }


// function InstituteStage({ instScore }) {
//   // Define all columns for the table
//   const columns = [
//     {
//       title: "Institute Name",
//       dataIndex: "institute_name",
//       key: "institute_name",
//       width: 220,
//       render: (name) => (
//         <span style={{ fontWeight: 500, color: "#333" }}>{name}</span>
//       ),
//     },
//     {
//       title: "Type",
//       dataIndex: "institute_type",
//       key: "institute_type",
//       width: 120,
//       render: (type) => <span style={{ color: "#666" }}>{type}</span>,
//     },
//     {
//       title: "City",
//       dataIndex: "city",
//       key: "city",
//       width: 150,
//       render: (city) => <span style={{ color: "#666" }}>{city}</span>,
//     },
//     {
//       title: "Total Choice Filled",
//       dataIndex: "total_choice_filled",
//       key: "total_choice_filled",
//       align: "right",
//       width: 160,
//       render: (val) => (
//         <span style={{ fontWeight: 600, color: "#1677ff" }}>
//           {val.toLocaleString()}
//         </span>
//       ),
//     },
//     {
//       title: "Admission Offered",
//       dataIndex: "admission_offered",
//       key: "admission_offered",
//       align: "right",
//       width: 160,
//       render: (val) => (
//         <span style={{ fontWeight: 600, color: "#52c41a" }}>
//           {val.toLocaleString()}
//         </span>
//       ),
//     },
//     {
//       title: "Admission Rejected",
//       dataIndex: "admission_rejected",
//       key: "admission_rejected",
//       align: "right",
//       width: 160,
//       render: (val) => (
//         <span style={{ fontWeight: 600, color: "#f5222d" }}>
//           {val.toLocaleString()}
//         </span>
//       ),
//     },
//     {
//       title: "Accepted by Student",
//       dataIndex: "accepted_by_student",
//       key: "accepted_by_student",
//       align: "right",
//       width: 180,
//       render: (val) => (
//         <span style={{ fontWeight: 600, color: "#52c41a" }}>
//           {val.toLocaleString()}
//         </span>
//       ),
//     },
//     {
//       title: "Rejected by Student",
//       dataIndex: "rejected_by_student",
//       key: "rejected_by_student",
//       align: "right",
//       width: 180,
//       render: (val) => (
//         <span style={{ fontWeight: 600, color: "#fa8c16" }}>
//           {val.toLocaleString()}
//         </span>
//       ),
//     },
//     {
//       title: "Payment Proof Uploaded",
//       dataIndex: "payment_proof_uploaded",
//       key: "payment_proof_uploaded",
//       align: "right",
//       width: 200,
//       render: (val) => (
//         <span style={{ fontWeight: 600, color: "#1890ff" }}>
//           {val.toLocaleString()}
//         </span>
//       ),
//     },
//     {
//       title: "Enrolled",
//       dataIndex: "enrolled",
//       key: "enrolled",
//       align: "right",
//       width: 140,
//       render: (val) => (
//         <span style={{ fontWeight: 600, color: "#722ed1" }}>
//           {val.toLocaleString()}
//         </span>
//       ),
//     },
//     {
//       title: "Ticket/Visa Uploaded",
//       dataIndex: "ticket_visa_uploaded",
//       key: "ticket_visa_uploaded",
//       align: "right",
//       width: 200,
//       render: (val) => (
//         <span style={{ fontWeight: 600, color: "#13c2c2" }}>
//           {val.toLocaleString()}
//         </span>
//       ),
//     },
//   ];

//   // Format data safely
//   const data = useMemo(() => {
//     if (!Array.isArray(instScore)) return [];
//     return instScore.map((i, index) => ({
//       key: index,
//       institute_name: i.institute_name || "—",
//       institute_type: i.institute_type || "—",
//       city: i.city || "—",
//       total_choice_filled: Number(i.total_choice_filled || 0),
//       admission_offered: Number(i.admission_offered || 0),
//       admission_rejected: Number(i.admission_rejected || 0),
//       accepted_by_student: Number(i.accepted_by_student || 0),
//       rejected_by_student: Number(i.rejected_by_student || 0),
//       payment_proof_uploaded: Number(i.payment_proof_uploaded || 0),
//       enrolled: Number(i.enrolled || 0),
//       ticket_visa_uploaded: Number(i.ticket_visa_uploaded || 0),
//     }));
//   }, [instScore]);

//   return (
//     <div className="dash-section">
//       <div className="dash-header"><h3 className="dash-title">Institute Wise Summary</h3></div>
//       <div className="dash-body">
//         {data.length === 0 ? (
//           <Empty description="No institute data" />
//         ) : (
//           <Table
//             columns={columns}
//             dataSource={data}
//             pagination={false}
//             bordered
//             size="middle"
//             scroll={{ x: "max-content", y: 400 }}
//             className="dash-table-bg"
//           />
//         )}
//       </div>
//     </div>
//   );
// }

// function TopInstitutesChart({ topInst }) {
//   const rows = useMemo(() => {
//     if (!Array.isArray(topInst)) return [];
//     return topInst.map((i, idx) => ({
//       key: i.institute_id,
//       rank: idx + 1,
//       name: i.institute_name,
//       city: i.city,
//       applications: i.total_applications || 0,
//     }));
//   }, [topInst]);

//   if (rows.length === 0) {
//     return (
//       <div className="dash-section">
//         <div className="dash-header"><h3 className="dash-title">Top Institutes</h3></div>
//         <div className="dash-body"><Empty description="No data" /></div>
//       </div>
//     );
//   }

//   const columns = [
//     {
//       title: "Rank",
//       dataIndex: "rank",
//       key: "rank",
//       align: "center",
//       width: 80,
//       render: (rank) => (
//         <span style={{ fontWeight: 600, color: "#1677ff" }}>{rank}</span>
//       ),
//     },
//     {
//       title: "Institute Name",
//       dataIndex: "name",
//       key: "name",
//       width: 200,
//       render: (name) => (
//         <span style={{ fontWeight: 500, color: "#333" }}>{name}</span>
//       ),
//     },
//     {
//       title: "City",
//       dataIndex: "city",
//       key: "city",
//       width: 150,
//       render: (city) => <span style={{ color: "#666" }}>{city}</span>,
//     },
//     {
//       title: "Applications",
//       dataIndex: "applications",
//       key: "applications",
//       align: "right",
//       width: 150,
//       render: (apps) => (
//         <span style={{ fontWeight: 600, color: "#52c41a" }}>
//           {apps.toLocaleString()}
//         </span>
//       ),
//     },
//   ];

//   return (
//     <div className="dash-section">
//       <div className="dash-header"><h3 className="dash-title">Top Institutes</h3></div>
//       <div className="dash-body">
//         <Table
//           columns={columns}
//           dataSource={rows}
//           pagination={false}
//           size="middle"
//           bordered
//           scroll={{ y: 300, x: true }}
//           className="dash-table-bg"
//         />
//       </div>
//     </div>
//   );
// }


// function TopCountriesChart({ topCountry }) {
//   const rows = useMemo(() => {
//     if (!Array.isArray(topCountry)) return [];
//     const arr = topCountry.map((c) => ({
//       id: c.country_id,
//       name: c.country_name,
//       code: c.country_code,
//       applications: Number(c.total_applications || 0),
//     }))
//     arr.sort((a, b) => b.applications - a.applications)
//     return arr.map((c, idx) => ({ ...c, rank: idx + 1 }))
//   }, [topCountry]);

//   const maxApps = useMemo(() => {
//     return rows.reduce((m, r) => Math.max(m, r.applications), 0) || 1
//   }, [rows])

//   return (
//     <div className="dash-section">
//       <div className="dash-header"><h3 className="dash-title">Top Countries</h3></div>
//       <div className="dash-body">
//         {rows.length === 0 ? (
//           <Empty description="No data" />
//         ) : (
//           <div style={{ maxHeight: 260, overflowY: 'auto' }}>
//             {rows.map((d) => (
//               <div key={d.id} style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//                   <div style={{ width: 22, height: 22, borderRadius: 6, background: '#f3f4f6', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#374151' }}>#{d.rank}</div>
//                   <div style={{ fontWeight: 600, color: '#111827' }}>{d.name} <span className="dash-muted">({d.code})</span></div>
//                   <div style={{ marginLeft: 'auto', fontWeight: 700, color: '#1677ff' }}>{d.applications.toLocaleString()}</div>
//                 </div>
//                 <div style={{ marginTop: 6, height: 6, background: '#f5f5f5', borderRadius: 4, overflow: 'hidden' }}>
//                   <div style={{ width: `${(d.applications / maxApps) * 100}%`, height: '100%', background: '#1677ff' }}></div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }





// import React, { useEffect, useState, useMemo, useContext } from 'react'
// import { Empty, Table } from 'antd'
// import CmasterService from '../../services/CmasterService'
// import {
//   ResponsiveContainer,
//   Tooltip,
//   Legend,
//   PieChart,
//   Pie,
//   Cell,
//   BarChart,
//   CartesianGrid,
//   XAxis,
//   YAxis,
//   Bar,
// } from 'recharts'
// import { SessionContext } from '../../context/SessionContext'

// export default function ClientDash() {
//   const [result, setResult] = useState(null)
//   const [instScore, setInstScore] = useState(null)
//   const [genderRatio, setGenderRatio] = useState(null)
//   const [issueStats, setIssueStats] = useState(null)
//   const [ageRangeStats, setAgeRange] = useState(null)
//   const [topInst, setTopInst] = useState(null)
//   const [topCountry, setTopCountry] = useState(null)
//   const [agentStage, setAgentStage] = useState(null)
//   const { selectedSession, activeSession } = useContext(SessionContext)

//   const session = selectedSession?.name || activeSession?.name || "";

//   useEffect(() => {

//     if (!session) return;

//     CmasterService.getClientDashDetailSmart(session)
//       .then(res => {
//         console.log('API Response:', res); // Debug log
//         setResult(res?.result?.student_scoreboard || null);
//       })
//       .catch(() => setResult(null))

//     CmasterService.getInstituteDashDeatil(session)
//       .then(res => setInstScore(res?.result?.data || null))
//       .catch(() => setInstScore(null))

//     CmasterService.getGenderRatio(session)
//       .then(res => setGenderRatio(res?.result || null))
//       .catch(() => setGenderRatio(null))

//     CmasterService.getStuIssueStats(session)
//       .then(res => setIssueStats(res?.result || null))
//       .catch(() => setIssueStats(null))

//     CmasterService.getAgeRange(session)
//       .then(res => setAgeRange(res?.result || null))
//       .catch(() => setAgeRange(null))

//     CmasterService.getTopInstitutes(session)
//       .then(res => setTopInst(res?.result?.data || null))
//       .catch(() => setTopInst(null))

//     CmasterService.getTopCountries(session)
//       .then(res => setTopCountry(res?.result?.data || null))
//       .catch(() => setTopCountry(null))

//     CmasterService.getAgentStage(session)
//       .then(res => setAgentStage(res?.result || null))
//       .catch(() => setAgentStage(null))
//   }, [session])

//   return (
//     <div className="ndashbx">
//       <ScoreBoard
//         result={result}
//         instScore={instScore}
//         genderRatio={genderRatio}
//         issueStats={issueStats}
//         ageRangeStats={ageRangeStats}
//         topInst={topInst}
//         topCountry={topCountry}
//         agentStage={agentStage}
//       />
//     </div>
//   )
// }

// function ScoreBoard({ result, instScore, genderRatio, issueStats, ageRangeStats, topInst, topCountry, agentStage }) {
//   return (
//     <div>
//       <StudentScoreCards result={result} />

//       {agentStage ? <AgentScoreCards agentStage={agentStage} /> : null}

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <IssueStatsChart issueStats={issueStats} />
//         <GenderRatioChart genderRatio={genderRatio} />
//       </div>

//       <LeadsModule result={result} />

//       <AgeRangeChart ageRangeStats={ageRangeStats} />

//       <InstituteStage instScore={instScore} />

//       <div className="flex gap-6">
//         <TopInstitutesChart topInst={topInst} />
//         <TopCountriesChart topCountry={topCountry} />
//       </div>
//     </div>
//   )
// }

// function StudentScoreCards({ result }) {
//   const { selectedSession, activeSession, sessions } = useContext(SessionContext)
//   const session = selectedSession?.name || activeSession?.name || "";

//   // Prefer the session id coming from SessionContext; fall back to resolving by name.
//   const sessionId =
//     selectedSession?.key ||
//     selectedSession?.id ||
//     sessions?.find((s) => s?.name === session)?.key ||
//     null;
  
//   const totals = useMemo(() => ({
//     total_students: Number(result?.total_students || 0),
//     registration_completed: Number(result?.registration_completed || 0),
//     basic_info_completed: Number(result?.basic_info_completed || 0),
//     educational_info_completed: Number(result?.educational_info_completed || 0),
//     background_info_completed: Number(result?.background_info_completed || 0),
//     choice_filling_completed: Number(result?.choice_filling_completed || 0),
//     admission_offered: Number(result?.admission_offered || 0),
//     offer_accepted: Number(result?.offer_accepted || 0),
//     payment_proof: Number(result?.payment_proof || 0),
//     visa_letters: Number(result?.visa_letters || 0),
//     pickup_scheduled: Number(result?.pickup_scheduled || 0),
//     enrolled: Number(result?.enrolled || 0),
//   }), [result])

//   // Helper function to build URL with session
//   const buildUrl = (baseParams) => {
//     const params = new URLSearchParams(baseParams);
//     if (sessionId) {
//       params.set('master_session_id', sessionId);
//     }
//     if (session) {
//       params.set('session_name', session);
//     }
//     return `/students?${params.toString()}`;
//   };

//   const cards = [
//     { key: 'total_students', label: 'Total Students', value: totals.total_students, icon: 'fa-users', iconBg: '#e6f4ff', iconFg: '#1677ff', href: buildUrl({}) },
//     { key: 'registration_completed', label: 'Registration Completed', value: totals.registration_completed, icon: 'fa-id-card', iconBg: '#f0f5ff', iconFg: '#2f54eb', href: buildUrl({}) },
//     { key: 'basic_info_completed', label: 'Basic Info Completed', value: totals.basic_info_completed, icon: 'fa-info-circle', iconBg: '#e6fffb', iconFg: '#13c2c2', href: buildUrl({}) },
//     { key: 'educational_info_completed', label: 'Educational Info', value: totals.educational_info_completed, icon: 'fa-book', iconBg: '#fffbe6', iconFg: '#faad14', href: buildUrl({}) },
//     { key: 'background_info_completed', label: 'Background Info', value: totals.background_info_completed, icon: 'fa-address-card', iconBg: '#f9f0ff', iconFg: '#722ed1', href: buildUrl({}) },
//     { key: 'choice_filling_completed', label: 'Choice Filling', value: totals.choice_filling_completed, icon: 'fa-list-ul', iconBg: '#f6ffed', iconFg: '#143703', href: buildUrl({}) },
//     { key: 'admission_offered', label: 'Admission Offered', value: totals.admission_offered, icon: 'fa-check-circle', iconBg: '#edfff3', iconFg: '#2c541a', href: buildUrl({}) },
//     { key: 'offer_accepted', label: 'Offer Accepted', value: totals.offer_accepted, icon: 'fa-thumbs-up', iconBg: '#e6fffb', iconFg: '#13c2c2', href: buildUrl({}) },
//     { key: 'payment_proof', label: 'Payment Proof', value: totals.payment_proof, icon: 'fa-credit-card', iconBg: '#edf5ff', iconFg: '#1890ff', href: buildUrl({}) },
//     { key: 'visa_letters', label: 'Visa Letters', value: totals.visa_letters, icon: 'fa-envelope-open', iconBg: '#fff0f6', iconFg: '#eb2f96', href: buildUrl({}) },
//     { key: 'pickup_scheduled', label: 'Pickup Scheduled', value: totals.pickup_scheduled, icon: 'fa-calendar', iconBg: '#f6ffed', iconFg: '#389e0d', href: buildUrl({}) },
//     { key: 'enrolled', label: 'Enrolled', value: totals.enrolled, icon: 'fa-graduation-cap', iconBg: '#f9f0ff', iconFg: '#722ed1', href: buildUrl({}) },
//   ]

//   return (
//     <div className="dash-section">
//       <div className="dash-header">
//         <h2 className="dash-title">
//           <i className="fa fa-graduation-cap" style={{ marginRight: 8, color: '#1677ff' }}></i>
//           Student Scoreboard
//         </h2>
//       </div>
//       <div className="dash-body">
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
//           {cards.map(c => (
//             <a key={c.key} href={c.href} target="_blank" rel="noreferrer" className="no-underline" style={{ color: 'inherit' }}>
//               <div style={{
//                 background: '#fff',
//                 border: '1px solid #e8ecf1',
//                 borderRadius: 12,
//                 padding: '16px 14px',
//                 transition: 'all 0.2s ease',
//                 cursor: 'pointer',
//                 position: 'relative',
//                 overflow: 'hidden'
//               }}
//               onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)'; }}
//               onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
//               >
//                 <div style={{
//                   position: 'absolute',
//                   top: 0,
//                   left: 0,
//                   right: 0,
//                   height: 3,
//                   background: c.iconFg,
//                   borderRadius: '12px 12px 0 0'
//                 }}></div>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
//                   <span style={{
//                     width: 40,
//                     height: 40,
//                     borderRadius: 10,
//                     background: c.iconBg,
//                     display: 'inline-flex',
//                     alignItems: 'center',
//                     justifyContent: 'center'
//                   }}>
//                     <i className={`fa ${c.icon}`} aria-hidden="true" style={{ color: c.iconFg, fontSize: 16 }}></i>
//                   </span>
//                   <div style={{ fontSize: 12, fontWeight: 500, color: '#6b7280', lineHeight: 1.3 }}>{c.label}</div>
//                 </div>
//                 <div style={{ fontSize: 26, fontWeight: 800, color: '#111827', letterSpacing: '-0.5px' }}>{Number(c.value || 0).toLocaleString()}</div>
//               </div>
//             </a>
//           ))}
//         </div>
//       </div>
//     </div>
//   )
// }

// function AgentScoreCards({ agentStage }) {
//   const totals = useMemo(() => ({
//     total_agents: Number(agentStage?.summary?.total_agents || 0),
//     total_registered: Number(agentStage?.summary?.total_registered || 0),
//     total_choice_filled: Number(agentStage?.summary?.total_choice_filled || 0),
//     total_admission_offered: Number(agentStage?.summary?.total_admission_offered || 0),
//     total_admission_rejected: Number(agentStage?.summary?.total_admission_rejected || 0),
//     total_accepted_by_student: Number(agentStage?.summary?.total_accepted_by_student || 0),
//     total_rejected_by_student: Number(agentStage?.summary?.total_rejected_by_student || 0),
//     total_payment_proof_uploaded: Number(agentStage?.summary?.total_payment_proof_uploaded || 0),
//     total_enrolled: Number(agentStage?.summary?.total_enrolled || 0),
//   }), [agentStage])

//   const cards = [
//     { key: 'total_agents', label: 'Agents', value: totals.total_agents, icon: 'fa-user-tie', iconBg: '#e6f4ff', iconFg: '#1677ff' },
//     { key: 'total_registered', label: 'Registered', value: totals.total_registered, icon: 'fa-user-check', iconBg: '#f6ffed', iconFg: '#52c41a' },
//     { key: 'total_choice_filled', label: 'Choices Filled', value: totals.total_choice_filled, icon: 'fa-list-ul', iconBg: '#fffbe6', iconFg: '#faad14' },
//     { key: 'total_admission_offered', label: 'Admission Offered', value: totals.total_admission_offered, icon: 'fa-check-circle', iconBg: '#eafff5', iconFg: '#389e0d' },
//     { key: 'total_admission_rejected', label: 'Admission Rejected', value: totals.total_admission_rejected, icon: 'fa-times-circle', iconBg: '#fff2f0', iconFg: '#f5222d' },
//     { key: 'total_accepted_by_student', label: 'Accepted by Student', value: totals.total_accepted_by_student, icon: 'fa-thumbs-up', iconBg: '#e6fffb', iconFg: '#13c2c2' },
//     { key: 'total_rejected_by_student', label: 'Rejected by Student', value: totals.total_rejected_by_student, icon: 'fa-thumbs-down', iconBg: '#fff7e6', iconFg: '#fa8c16' },
//     { key: 'total_payment_proof_uploaded', label: 'Payment Proof', value: totals.total_payment_proof_uploaded, icon: 'fa-credit-card', iconBg: '#edf5ff', iconFg: '#1890ff' },
//     { key: 'total_enrolled', label: 'Enrolled', value: totals.total_enrolled, icon: 'fa-graduation-cap', iconBg: '#f9f0ff', iconFg: '#722ed1' },
//   ]

//   return (
//     <div className="dash-section">
//       <div className="dash-header">
//         <h2 className="dash-title">
//           <i className="fa fa-user-tie" style={{ marginRight: 8, color: '#722ed1' }}></i>
//           Agent Scoreboard
//         </h2>
//       </div>
//       <div className="dash-body">
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
//           {cards.map(c => (
//             <div key={c.key} style={{
//               background: '#fff',
//               border: '1px solid #e8ecf1',
//               borderRadius: 12,
//               padding: '16px 14px',
//               transition: 'all 0.2s ease',
//               position: 'relative',
//               overflow: 'hidden'
//             }}
//             onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)'; }}
//             onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
//             >
//               <div style={{
//                 position: 'absolute',
//                 top: 0,
//                 left: 0,
//                 right: 0,
//                 height: 3,
//                 background: c.iconFg,
//                 borderRadius: '12px 12px 0 0'
//               }}></div>
//               <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
//                 <span style={{
//                   width: 40,
//                   height: 40,
//                   borderRadius: 10,
//                   background: c.iconBg,
//                   display: 'inline-flex',
//                   alignItems: 'center',
//                   justifyContent: 'center'
//                 }}>
//                   <i className={`fa ${c.icon}`} aria-hidden="true" style={{ color: c.iconFg, fontSize: 16 }}></i>
//                 </span>
//                 <div style={{ fontSize: 12, fontWeight: 500, color: '#6b7280', lineHeight: 1.3 }}>{c.label}</div>
//               </div>
//               <div style={{ fontSize: 26, fontWeight: 800, color: '#111827', letterSpacing: '-0.5px' }}>{Number(c.value || 0).toLocaleString()}</div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   )
// }

// function LeadsModule({ result }) {
//   return (
//     <div className="dash-section">
//       <div className="dash-header">
//         <h2 className="dash-title">
//           <i className="fa fa-funnel-dollar" style={{ marginRight: 8, color: '#52c41a' }}></i>
//           Leads Pipeline
//         </h2>
//       </div>
//       <div className="dash-body">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <ScoreBoardTotalLeads result={result} />
//           <ScoreBoardTotalLeadsStage result={result} />
//         </div>
//       </div>
//     </div>
//   )
// }


// function ScoreBoardTotalLeads({ result }) {
//   const total = Number(result?.total_students || 0)
//   const online = Number(result?.basic_info_completed || 0)
//   const offline = Math.max(0, total - online)
//   const onlinePct = total ? (online / total) * 100 : 0
//   const offlinePct = total ? (offline / total) * 100 : 0

//   const pieData = [
//     { name: 'Online', value: online },
//     { name: 'Offline', value: offline },
//   ]

//   const getPieColor = (name, value, totalVal) => {
//     if (totalVal === 0) return '#d9d9d9'
//     if (name === 'Online') return '#133f49'
//     return '#93c5fd'
//   }

//   return (
//     <div className="dash-section">
//       <div className="dash-header">
//         <h3 className="dash-title">
//           <i className="fa fa-chart-pie" style={{ marginRight: 6, color: '#1e6f5e' }}></i>
//           Total Leads
//         </h3>
//       </div>
//       <div className="dash-body">
//         <div className="pb10">
//           <h1 className="m0 p0 bold500 text-info">{total.toLocaleString()}</h1>
//         </div>
//         <div className="mb8">
//           <div className="progress m0">
//             <div className="lbl">Online: {online.toLocaleString()}</div>
//             <div className="progress-bar progress-bar-info" style={{ width: `${onlinePct}%` }}></div>
//           </div>
//         </div>
//         <div className="mb8">
//           <div className="progress progress-striped1 active1 m0">
//             <div className="lbl">Offline: {offline.toLocaleString()}</div>
//             <div className="progress-bar progress-bar-info" style={{ width: `${offlinePct}%` }}></div>
//           </div>
//         </div>
//         <div style={{ width: '100%', height: 220 }}>
//           <ResponsiveContainer>
//             <PieChart>
//               <Pie dataKey="value" data={pieData} cx="50%" cy="50%" outerRadius={70} label>
//                 {pieData.map((entry, index) => (
//                   <Cell key={`slice-${index}`} fill={getPieColor(entry.name, entry.value, total)} />
//                 ))}
//               </Pie>
//               <Tooltip formatter={(v) => Number(v).toLocaleString()} />
//               <Legend />
//             </PieChart>
//           </ResponsiveContainer>
//         </div>
//       </div>
//     </div>
//   )
// }

// function ScoreBoardTotalLeadsStage({ result }) {
//   const total = Number(result?.total_students || 0)
//   const stageRows = [
//     { label: 'Registration Completed', value: Number(result?.registration_completed || 0), color: '#3b82f6' },
//     { label: 'Basic Info Completed', value: Number(result?.basic_info_completed || 0), color: '#6366f1' },
//     { label: 'Educational Info', value: Number(result?.educational_info_completed || 0), color: '#8b5cf6' },
//     { label: 'Background Info/Document Uploaded', value: Number(result?.background_info_completed || 0), color: '#a855f7' },
//     { label: 'Choice Filling', value: Number(result?.choice_filling_completed || 0), color: '#e24dd1' },
//     { label: 'Admission Offered', value: Number(result?.admission_offered || 0), color: '#90e3ac' },
//     { label: 'Offer Accepted', value: Number(result?.offer_accepted || 0), color: '#14b8a6' },
//     { label: 'Payment Proof Updated', value: Number(result?.payment_proof || 0), color: '#f59e0b' },
//     { label: 'Visa Letter Sent', value: Number(result?.visa_letters || 0), color: '#ef4444' },
//     { label: 'Pickup Scheduled', value: Number(result?.pickup_scheduled || 0), color: '#ec4899' },
//     { label: 'Enrolled', value: Number(result?.enrolled || 0), color: '#722ed1' },
//   ]

//   return (
//     <div className="dash-section">
//       <div className="dash-header">
//         <h3 className="dash-title">
//           <i className="fa fa-layer-group" style={{ marginRight: 6, color: '#1e6f5e' }}></i>
//           Total Leads Stages
//         </h3>
//       </div>
//       <div className="dash-body">
//         <div className="pb10">
//           <h1 className="m0 p0 bold500" style={{ color: '#13c2c2' }}>{total.toLocaleString()}</h1>
//         </div>
//         {stageRows.map((row) => {
//           const pct = total ? (row.value / total) * 100 : 0
//           return (
//             <div className="mb8" key={row.label}>
//               <div className="progress m0">
//                 <div className="lbl">{row.label}: {row.value.toLocaleString()}</div>
//                 <div className="progress-bar" style={{ width: `${pct}%`, background: row.color, borderRadius: 12 }}></div>
//               </div>
//             </div>
//           )
//         })}
//       </div>
//     </div>
//   )
// }

// function GenderRatioChart({ genderRatio }) {
//   const data = useMemo(() => {
//     const arr = genderRatio?.data || []
//     return arr.map(d => ({ name: d.gender, value: Number(d.count || 0), percentage: Number(d.percentage || 0) }))
//   }, [genderRatio])
//   const total = Number(genderRatio?.summary?.total || data.reduce((s, d) => s + d.value, 0))
//   const colorMap = { Male: '#1890ff', Female: '#eb2f96', Transgender: '#722ed1', Unknown: '#8c8c8c' }
//   const getColor = (name) => colorMap[name] || '#bfbfbf'
//   const renderGenderLabel = ({ name, percent, value }) => {
//     if (!value || (percent * 100) < 2) return null
//     return `${name}: ${Math.round(percent * 100)}%`
//   }
//   if (!data || data.length === 0) {
//     return (
//       <div className="dash-section">
//         <div className="dash-header">
//           <h3 className="dash-title">
//             <i className="fa fa-venus-mars" style={{ marginRight: 6, color: '#eb2f96' }}></i>
//             Gender Ratio
//           </h3>
//         </div>
//         <div className="dash-body"><Empty description="No data" /></div>
//       </div>
//     )
//   }
//   return (
//     <div className='dash-section'>
//       <div className="dash-header">
//         <h3 className="dash-title">
//           <i className="fa fa-venus-mars" style={{ marginRight: 6, color: '#eb2f96' }}></i>
//           Gender Ratio
//         </h3>
//       </div>
//       <div className="dash-body">
//         <div style={{ width: '100%', height: 280 }}>
//           <ResponsiveContainer>
//             <PieChart>
//               <Pie dataKey="value" data={data} cx="50%" cy="50%" outerRadius={90} label={renderGenderLabel} labelLine={false} minAngle={2} paddingAngle={1}>
//                 {data.map((entry, index) => <Cell key={`gender-${index}`} fill={getColor(entry.name)} />)}
//               </Pie>
//               <Tooltip formatter={(v, n, p) => [`${Number(v).toLocaleString()}`, p?.payload?.name]} />
//             </PieChart>
//           </ResponsiveContainer>
//         </div>
//         <div className="mt10">
//           <div className="pb5 bold500">Total: {total.toLocaleString()}</div>
//           {data.map(d => (
//             <div key={d.name} className="mb5" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//               <span style={{ display: 'inline-block', width: 10, height: 10, background: getColor(d.name), borderRadius: 2 }}></span>
//               <span style={{ minWidth: 90 }}>{d.name}</span>
//               <span className="dash-muted" style={{ marginLeft: 'auto' }}>
//                 {d.value.toLocaleString()} ({d.percentage}%)
//               </span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   )
// }

// function IssueStatsChart({ issueStats }) {
//   const rows = useMemo(() => {
//     const arr = issueStats?.data || [];
//     return arr.map((d) => ({
//       name: String(d.status || ""),
//       value: Number(d.count || 0),
//     }));
//   }, [issueStats]);

//   if (!rows || rows.length === 0) {
//     return (
//       <div className="dash-section">
//         <div className="dash-header">
//           <h3 className="dash-title">
//             <i className="fa fa-exclamation-triangle" style={{ marginRight: 6, color: '#faad14' }}></i>
//             Student Issues
//           </h3>
//         </div>
//         <div className="dash-body"><Empty description="No issues" /></div>
//       </div>
//     );
//   }

//   const iconFor = (name) => {
//     if (/open/i.test(name)) return { icon: 'fa-exclamation-circle', fg: '#f5222d', bg: '#fff1f0' }
//     if (/process|progress/i.test(name)) return { icon: 'fa-hourglass-half', fg: '#faad14', bg: '#fffbe6' }
//     if (/closed|resolved|done/i.test(name)) return { icon: 'fa-check-circle', fg: '#52c41a', bg: '#f6ffed' }
//     return { icon: 'fa-circle', fg: '#8c8c8c', bg: '#f5f5f5' }
//   }

//   return (
//     <div className="dash-section">
//       <div className="dash-header">
//         <h3 className="dash-title">
//           <i className="fa fa-exclamation-triangle" style={{ marginRight: 6, color: '#faad14' }}></i>
//           Student Issues
//         </h3>
//       </div>
//       <div className="dash-body">
//         <div style={{ display: 'grid', gridTemplateRows: `repeat(${rows.length}, 1fr)`, rowGap: 8, minHeight: 280 }}>
//           {rows.map((d) => {
//             const i = iconFor(d.name)
//             return (
//               <div key={d.name} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
//                 <span style={{ width: 28, height: 28, borderRadius: 6, background: i.bg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
//                   <i className={`fa ${i.icon}`} aria-hidden="true" style={{ color: i.fg }}></i>
//                 </span>
//                 <div style={{ fontSize: 13, color: '#374151' }}>{d.name}</div>
//                 <div style={{ marginLeft: 'auto', fontWeight: 700, color: '#111827' }}>{Number(d.value || 0).toLocaleString()}</div>
//               </div>
//             )
//           })}
//         </div>
//       </div>
//     </div>
//   );
// }


// function AgeRangeChart({ ageRangeStats }) {
//   const rows = useMemo(() => {
//     const arr = ageRangeStats?.data || [];
//     return arr.map((d) => ({
//       range: d.range,
//       count: Number(d.count || 0),
//       percentage: Number(d.percentage || 0),
//     }));
//   }, [ageRangeStats]);

//   if (!rows || rows.length === 0) {
//     return (
//       <div className="dash-section">
//         <div className="dash-header">
//           <h3 className="dash-title">
//             <i className="fa fa-birthday-cake" style={{ marginRight: 6, color: '#722ed1' }}></i>
//             Age Range
//           </h3>
//         </div>
//         <div className="dash-body"><Empty description="No data" /></div>
//       </div>
//     );
//   }

//   // Soft pastel transparent colors
//   const COLORS = [
//     "rgba(72, 201, 176, 0.3)",   // soft green
//     "rgba(241, 196, 15, 0.3)",   // soft yellow
//     "rgba(231, 76, 60, 0.3)",    // soft red
//     "rgba(24, 144, 255, 0.3)",   // soft blue
//     "rgba(114, 46, 209, 0.3)",   // soft purple
//   ];

//   const BORDER_COLORS = [
//     "#48C9B0",
//     "#F1C40F",
//     "#E74C3C",
//     "#1890ff",
//     "#722ed1",
//   ];

//   return (
//     <div className="dash-section">
//       <div className="dash-header">
//         <h3 className="dash-title">
//           <i className="fa fa-birthday-cake" style={{ marginRight: 6, color: '#722ed1' }}></i>
//           Age Range
//         </h3>
//       </div>
//       <div className="dash-body" style={{ width: "100%", height: 300 }}>
//         <ResponsiveContainer>
//           <BarChart
//             data={rows}
//             margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
//           >
//             <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
//             <XAxis dataKey="range" tick={{ fill: "#374151" }} />
//             <YAxis tick={{ fill: "#374151" }} />
//             <Tooltip
//               formatter={(v, n, p) => [`${v} (${p.payload.percentage}%)`, n]}
//               contentStyle={{ backgroundColor: "#f9f9f9", borderRadius: 6, border: "1px solid #ddd" }}
//             />
//             <Legend />
//             <Bar dataKey="count" name="Students" radius={[6, 6, 0, 0]}>
//               {rows.map((entry, index) => (
//                 <Cell
//                   key={`cell-${index}`}
//                   fill={COLORS[index % COLORS.length]}
//                   stroke={BORDER_COLORS[index % BORDER_COLORS.length]}
//                   strokeWidth={2}
//                 />
//               ))}
//             </Bar>
//           </BarChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// }


// function InstituteStage({ instScore }) {
//   // Define all columns for the table
//   const columns = [
//     {
//       title: "Institute Name",
//       dataIndex: "institute_name",
//       key: "institute_name",
//       width: 220,
//       render: (name) => (
//         <span style={{ fontWeight: 500, color: "#333" }}>{name}</span>
//       ),
//     },
//     {
//       title: "Type",
//       dataIndex: "institute_type",
//       key: "institute_type",
//       width: 120,
//       render: (type) => <span style={{ color: "#666" }}>{type}</span>,
//     },
//     {
//       title: "City",
//       dataIndex: "city",
//       key: "city",
//       width: 150,
//       render: (city) => <span style={{ color: "#666" }}>{city}</span>,
//     },
//     {
//       title: "Total Choice Filled",
//       dataIndex: "total_choice_filled",
//       key: "total_choice_filled",
//       align: "right",
//       width: 160,
//       render: (val) => (
//         <span style={{ fontWeight: 600, color: "#1677ff" }}>
//           {val.toLocaleString()}
//         </span>
//       ),
//     },
//     {
//       title: "Admission Offered",
//       dataIndex: "admission_offered",
//       key: "admission_offered",
//       align: "right",
//       width: 160,
//       render: (val) => (
//         <span style={{ fontWeight: 600, color: "#52c41a" }}>
//           {val.toLocaleString()}
//         </span>
//       ),
//     },
//     {
//       title: "Admission Rejected",
//       dataIndex: "admission_rejected",
//       key: "admission_rejected",
//       align: "right",
//       width: 160,
//       render: (val) => (
//         <span style={{ fontWeight: 600, color: "#f5222d" }}>
//           {val.toLocaleString()}
//         </span>
//       ),
//     },
//     {
//       title: "Accepted by Student",
//       dataIndex: "accepted_by_student",
//       key: "accepted_by_student",
//       align: "right",
//       width: 180,
//       render: (val) => (
//         <span style={{ fontWeight: 600, color: "#52c41a" }}>
//           {val.toLocaleString()}
//         </span>
//       ),
//     },
//     {
//       title: "Rejected by Student",
//       dataIndex: "rejected_by_student",
//       key: "rejected_by_student",
//       align: "right",
//       width: 180,
//       render: (val) => (
//         <span style={{ fontWeight: 600, color: "#fa8c16" }}>
//           {val.toLocaleString()}
//         </span>
//       ),
//     },
//     {
//       title: "Payment Proof Uploaded",
//       dataIndex: "payment_proof_uploaded",
//       key: "payment_proof_uploaded",
//       align: "right",
//       width: 200,
//       render: (val) => (
//         <span style={{ fontWeight: 600, color: "#1890ff" }}>
//           {val.toLocaleString()}
//         </span>
//       ),
//     },
//     {
//       title: "Enrolled",
//       dataIndex: "enrolled",
//       key: "enrolled",
//       align: "right",
//       width: 140,
//       render: (val) => (
//         <span style={{ fontWeight: 600, color: "#722ed1" }}>
//           {val.toLocaleString()}
//         </span>
//       ),
//     },
//     {
//       title: "Ticket/Visa Uploaded",
//       dataIndex: "ticket_visa_uploaded",
//       key: "ticket_visa_uploaded",
//       align: "right",
//       width: 200,
//       render: (val) => (
//         <span style={{ fontWeight: 600, color: "#13c2c2" }}>
//           {val.toLocaleString()}
//         </span>
//       ),
//     },
//   ];

//   // Format data safely
//   const data = useMemo(() => {
//     if (!Array.isArray(instScore)) return [];
//     return instScore.map((i, index) => ({
//       key: index,
//       institute_name: i.institute_name || "—",
//       institute_type: i.institute_type || "—",
//       city: i.city || "—",
//       total_choice_filled: Number(i.total_choice_filled || 0),
//       admission_offered: Number(i.admission_offered || 0),
//       admission_rejected: Number(i.admission_rejected || 0),
//       accepted_by_student: Number(i.accepted_by_student || 0),
//       rejected_by_student: Number(i.rejected_by_student || 0),
//       payment_proof_uploaded: Number(i.payment_proof_uploaded || 0),
//       enrolled: Number(i.enrolled || 0),
//       ticket_visa_uploaded: Number(i.ticket_visa_uploaded || 0),
//     }));
//   }, [instScore]);

//   return (
//     <div className="dash-section">
//       <div className="dash-header">
//         <h3 className="dash-title">
//           <i className="fa fa-university" style={{ marginRight: 6, color: '#1677ff' }}></i>
//           Institute Wise Summary
//         </h3>
//       </div>
//       <div className="dash-body">
//         {data.length === 0 ? (
//           <Empty description="No institute data" />
//         ) : (
//           <Table
//             columns={columns}
//             dataSource={data}
//             pagination={false}
//             bordered
//             size="middle"
//             scroll={{ x: "max-content", y: 400 }}
//             className="dash-table-bg"
//           />
//         )}
//       </div>
//     </div>
//   );
// }

// function TopInstitutesChart({ topInst }) {
//   const rows = useMemo(() => {
//     if (!Array.isArray(topInst)) return [];
//     return topInst
//       .map((i) => ({
//         key: i.institute_id,
//         name: i.institute_name,
//         applications: i.total_applications || 0,
//         offered: i.admission_offered || 0,
//       }))
//       .sort((a, b) => b.applications - a.applications)
//       .slice(0, 10)
//   }, [topInst]);

//   if (rows.length === 0) {
//     return (
//       <div className="dash-section w-1/2">
//         <div className="dash-header">
//           <h3 className="dash-title">
//             <i className="fa fa-trophy" style={{ marginRight: 6, color: '#faad14' }}></i>
//             Top Institutes
//           </h3>
//         </div>
//         <div className="dash-body"><Empty description="No data" /></div>
//       </div>
//     );
//   }

//   const columns = [
//     {
//       title: "Institute Name",
//       dataIndex: "name",
//       key: "name",
//       width: 200,
//       render: (name) => (
//         <span style={{ fontWeight: 500, color: "#333" }}>{name}</span>
//       ),
//     },
//     {
//       title: "No. of Applications",
//       dataIndex: "applications",
//       key: "applications",
//       align: "left",
//       width: 150,
//       render: (apps) => (
//         <span style={{ fontWeight: 600, color: "#52c41a" }}>
//           {apps.toLocaleString()}
//         </span>
//       ),
//     },
//     {
//       title: "No. of Admission Offered",
//       dataIndex: "offered",
//       key: "offered",
//       width: 150,
//       render: (offered) => <span style={{ color: "#666" }}>{offered}</span>,
//     },
//   ]

//   return (
//     <div className="dash-section w-1/2">
//       <div className="dash-header">
//         <h3 className="dash-title">
//           <i className="fa fa-trophy" style={{ marginRight: 6, color: '#faad14' }}></i>
//           Top Institutes
//         </h3>
//       </div>
//       <div className="dash-body">
//         <Table
//           columns={columns}
//           dataSource={rows}
//           pagination={false}
//           size="middle"
//           bordered
//           scroll={{ y: 300, x: true }}
//           className="dash-table-bg"
//         />
//       </div>
//     </div>
//   )
// }


// function TopCountriesChart({ topCountry, result }) {
//   const rows = useMemo(() => {
//     if (!Array.isArray(topCountry)) return [];

//     const arr = topCountry.map((c) => ({
//       id: c.country_id,
//       name: c.country_name,
//       applications: Number(c.total_applications || 0),
//     }))
//     arr.sort((a, b) => b.applications - a.applications).slice(0, 10)
//     return arr.map((c, idx) => ({ ...c, rank: idx + 1 }))
//   }, [topCountry]);

//   const maxApps = useMemo(() => {
//     return rows.reduce((m, r) => Math.max(m, r.applications), 0) || 1
//   }, [rows])

//   const columns = [
//     {
//       title: "Country Name",
//       dataIndex: "name",
//       key: "name",
//       width: 200,
//       render: (name) => (
//         <span style={{ fontWeight: 500, color: "#333" }}>{name}</span>
//       ),
//     },
//     {
//       title: "No. of Admission Offered",
//       dataIndex: "applications",
//       key: "applications",
//       width: 150,
//       render: (apps) => (
//         <span style={{ color: "#666" }}>{apps.toLocaleString()}</span>
//       ),
//     },
//     // {
//     //   title: "Leads",
//     //   dataIndex: "leads",
//     //   key: "leads",
//     //   align: "left",
//     //   width: 150,
//     //   render: (leads) => (
//     //     <span style={{ fontWeight: 600, color: "#52c41a" }}>
//     //       {leads.toLocaleString()}
//     //     </span>
//     //   ),
//     // },
//   ]

//   return (
//     // <div className="dash-section w-1/2">
//     //   <div className="dash-header"><h3 className="dash-title">Top Countries</h3></div>
//     //   <div className="dash-body">
//     //     {rows.length === 0 ? (
//     //       <Empty description="No data" />
//     //     ) : (
//     //       <div style={{ maxHeight: 260, overflowY: 'auto' }}>
//     //         {rows.map((d) => (
//     //           <div key={d.id} style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>
//     //             <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//     //               <div style={{ width: 22, height: 22, borderRadius: 6, background: '#f3f4f6', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#374151' }}>#{d.rank}</div>
//     //               <div style={{ fontWeight: 600, color: '#111827' }}>{d.name} <span className="dash-muted">({d.code})</span></div>
//     //               <div style={{ marginLeft: 'auto', fontWeight: 700, color: '#1677ff' }}>{d.applications.toLocaleString()}</div>
//     //             </div>
//     //             <div style={{ marginTop: 6, height: 6, background: '#f5f5f5', borderRadius: 4, overflow: 'hidden' }}>
//     //               <div style={{ width: `${(d.applications / maxApps) * 100}%`, height: '100%', background: '#1677ff' }}></div>
//     //             </div>
//     //           </div>
//     //         ))}
//     //       </div>
//     //     )}
//     //   </div>
//     // </div>
//     <div className="dash-section w-1/2">
//       <div className="dash-header">
//         <h3 className="dash-title">
//           <i className="fa fa-globe-americas" style={{ marginRight: 6, color: '#13c2c2' }}></i>
//           Top Countries
//         </h3>
//       </div>
//       <div className="dash-body">
//         <Table
//           columns={columns}
//           dataSource={rows}
//           pagination={false}
//           size="middle"
//           bordered
//           scroll={{ y: 300, x: true }}
//           className="dash-table-bg"
//         />
//       </div>
//     </div>
//   )
// }









import React, { useEffect, useState, useMemo, useContext } from 'react'
import { Empty, Table } from 'antd'
import CmasterService from '../../services/CmasterService'
import {
  ResponsiveContainer,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
} from 'recharts'
import { SessionContext } from '../../context/SessionContext'
import "./style.css";

export default function ClientDash() {
  const [result, setResult] = useState(null)
  const [instScore, setInstScore] = useState(null)
  const [genderRatio, setGenderRatio] = useState(null)
  const [issueStats, setIssueStats] = useState(null)
  const [ageRangeStats, setAgeRange] = useState(null)
  const [topInst, setTopInst] = useState(null)
  const [topCountry, setTopCountry] = useState(null)
  const [agentStage, setAgentStage] = useState(null)
  const { selectedSession, activeSession } = useContext(SessionContext)

  const session = selectedSession?.name || activeSession?.name || "";

  useEffect(() => {
    if (!session) return;

    CmasterService.getClientDashDetailSmart(session)
      .then(res => setResult(res?.result?.student_scoreboard || null))
      .catch(() => setResult(null))

    CmasterService.getInstituteDashDeatil(session)
      .then(res => setInstScore(res?.result?.data || null))
      .catch(() => setInstScore(null))

    CmasterService.getGenderRatio(session)
      .then(res => setGenderRatio(res?.result || null))
      .catch(() => setGenderRatio(null))

    CmasterService.getStuIssueStats(session)
      .then(res => setIssueStats(res?.result || null))
      .catch(() => setIssueStats(null))

    CmasterService.getAgeRange(session)
      .then(res => setAgeRange(res?.result || null))
      .catch(() => setAgeRange(null))

    CmasterService.getTopInstitutes(session)
      .then(res => setTopInst(res?.result?.data || null))
      .catch(() => setTopInst(null))

    CmasterService.getTopCountries(session)
      .then(res => setTopCountry(res?.result?.data || null))
      .catch(() => setTopCountry(null))

    CmasterService.getAgentStage(session)
      .then(res => setAgentStage(res?.result || null))
      .catch(() => setAgentStage(null))
  }, [session])

  return (
    <div className="ndashbx">
      <div className="dash-welcome" style={{ textAlign: 'center' }}>
        <div className="dash-welcome-header">
          <div className="dash-header-icon-box">
            <i className="fa fa-home"></i>
          </div>
          <h1 style={{ margin: 0 }}>Dashboard</h1>
        </div>
        <p>Overview of all activities</p>
      </div>
      <ScoreBoard
        result={result}
        instScore={instScore}
        genderRatio={genderRatio}
        issueStats={issueStats}
        ageRangeStats={ageRangeStats}
        topInst={topInst}
        topCountry={topCountry}
        agentStage={agentStage}
      />
    </div>
  )
}

function ScoreBoard({ result, instScore, genderRatio, issueStats, ageRangeStats, topInst, topCountry, agentStage }) {
  return (
    <div>
      <StudentScoreCards result={result} />

      {agentStage ? <AgentScoreCards agentStage={agentStage} /> : null}

      <div className="dash-row-2-1">
        <LeadsModule result={result} />
        <GenderRatioChart genderRatio={genderRatio} />
      </div>

      <div className="dash-row-equal">
        <IssueStatsChart issueStats={issueStats} />
        <AgeRangeChart ageRangeStats={ageRangeStats} />
      </div>

      <InstituteStage instScore={instScore} />

      <div className="dash-row-equal">
        <TopInstitutesChart topInst={topInst} />
        <TopCountriesChart topCountry={topCountry} />
      </div>
    </div>
  )
}

function StudentScoreCards({ result }) {
  const { selectedSession, activeSession, sessions } = useContext(SessionContext)
  const session = selectedSession?.name || activeSession?.name || "";

  const sessionId =
    selectedSession?.key ||
    selectedSession?.id ||
    sessions?.find((s) => s?.name === session)?.key ||
    null;

  const totals = useMemo(() => ({
    total_students: Number(result?.total_students || 0),
    registration_completed: Number(result?.registration_completed || 0),
    basic_info_completed: Number(result?.basic_info_completed || 0),
    educational_info_completed: Number(result?.educational_info_completed || 0),
    background_info_completed: Number(result?.background_info_completed || 0),
    choice_filling_completed: Number(result?.choice_filling_completed || 0),
    admission_offered: Number(result?.admission_offered || 0),
    offer_accepted: Number(result?.offer_accepted || 0),
    payment_proof: Number(result?.payment_proof || 0),
    visa_letters: Number(result?.visa_letters || 0),
    pickup_scheduled: Number(result?.pickup_scheduled || 0),
    enrolled: Number(result?.enrolled || 0),
  }), [result])

  const buildUrl = (baseParams) => {
    const params = new URLSearchParams(baseParams);
    if (sessionId) params.set('master_session_id', sessionId);
    if (session) params.set('session_name', session);
    return `/students?${params.toString()}`;
  };

  const cards = [
    { key: 'total_students', label: 'Total Students', value: totals.total_students, icon: 'fa-users', iconBg: '#e6f4ff', iconFg: '#1677ff', href: buildUrl({}) },
    { key: 'registration_completed', label: 'Registration', value: totals.registration_completed, icon: 'fa-id-card', iconBg: '#f0f5ff', iconFg: '#2f54eb', href: buildUrl({}) },
    { key: 'basic_info_completed', label: 'Basic Info', value: totals.basic_info_completed, icon: 'fa-info-circle', iconBg: '#e6fffb', iconFg: '#13c2c2', href: buildUrl({}) },
    { key: 'educational_info_completed', label: 'Education', value: totals.educational_info_completed, icon: 'fa-book', iconBg: '#fffbe6', iconFg: '#faad14', href: buildUrl({}) },
    { key: 'background_info_completed', label: 'Background', value: totals.background_info_completed, icon: 'fa-address-card', iconBg: '#f9f0ff', iconFg: '#722ed1', href: buildUrl({}) },
    { key: 'choice_filling_completed', label: 'Choices', value: totals.choice_filling_completed, icon: 'fa-list-ul', iconBg: '#f6ffed', iconFg: '#143703', href: buildUrl({}) },
    { key: 'admission_offered', label: 'Offered', value: totals.admission_offered, icon: 'fa-check-circle', iconBg: '#edfff3', iconFg: '#2c541a', href: buildUrl({}) },
    { key: 'offer_accepted', label: 'Accepted', value: totals.offer_accepted, icon: 'fa-thumbs-up', iconBg: '#e6fffb', iconFg: '#13c2c2', href: buildUrl({}) },
    { key: 'payment_proof', label: 'Payment', value: totals.payment_proof, icon: 'fa-credit-card', iconBg: '#edf5ff', iconFg: '#1890ff', href: buildUrl({}) },
    { key: 'visa_letters', label: 'Visa', value: totals.visa_letters, icon: 'fa-envelope-open', iconBg: '#fff0f6', iconFg: '#eb2f96', href: buildUrl({}) },
    { key: 'pickup_scheduled', label: 'Pickup', value: totals.pickup_scheduled, icon: 'fa-calendar', iconBg: '#f6ffed', iconFg: '#389e0d', href: buildUrl({}) },
    { key: 'enrolled', label: 'Enrolled', value: totals.enrolled, icon: 'fa-graduation-cap', iconBg: '#f9f0ff', iconFg: '#722ed1', href: buildUrl({}) },
  ]

  return (
    <div className="dash-section">
      <div className="dash-header">
        <h2 className="dash-title">
          <i className="fa fa-graduation-cap" style={{ marginRight: 8, color: '#1677ff' }}></i>
          Student Scoreboard
        </h2>
      </div>
      <div className="dash-body">
        <div className="dash-cards-grid">
          {cards.map(c => (
            <a key={c.key} href={c.href} target="_blank" rel="noreferrer" className="no-underline" style={{ color: 'inherit' }}>
              <div className="dash-stat-card" style={{ borderTopColor: c.iconFg }}>
                <div className="dash-stat-top">
                  <span className="dash-stat-icon" style={{ background: c.iconBg }}>
                    <i className={`fa ${c.icon}`} style={{ color: c.iconFg, fontSize: 16 }}></i>
                  </span>
                  <span className="dash-stat-label">{c.label}</span>
                </div>
                <div className="dash-stat-value">{Number(c.value || 0).toLocaleString()}</div>
                <div className="dash-stat-sparkline" style={{ background: c.iconFg }}></div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

function AgentScoreCards({ agentStage }) {
  const totals = useMemo(() => ({
    total_agents: Number(agentStage?.summary?.total_agents || 0),
    total_registered: Number(agentStage?.summary?.total_registered || 0),
    total_choice_filled: Number(agentStage?.summary?.total_choice_filled || 0),
    total_admission_offered: Number(agentStage?.summary?.total_admission_offered || 0),
    total_admission_rejected: Number(agentStage?.summary?.total_admission_rejected || 0),
    total_accepted_by_student: Number(agentStage?.summary?.total_accepted_by_student || 0),
    total_rejected_by_student: Number(agentStage?.summary?.total_rejected_by_student || 0),
    total_payment_proof_uploaded: Number(agentStage?.summary?.total_payment_proof_uploaded || 0),
    total_enrolled: Number(agentStage?.summary?.total_enrolled || 0),
  }), [agentStage])

  const cards = [
    { key: 'total_agents', label: 'Agents', value: totals.total_agents, icon: 'fa-user-tie', iconBg: '#e6f4ff', iconFg: '#1677ff' },
    { key: 'total_registered', label: 'Registered', value: totals.total_registered, icon: 'fa-user-check', iconBg: '#f6ffed', iconFg: '#52c41a' },
    { key: 'total_choice_filled', label: 'Choices', value: totals.total_choice_filled, icon: 'fa-list-ul', iconBg: '#fffbe6', iconFg: '#faad14' },
    { key: 'total_admission_offered', label: 'Offered', value: totals.total_admission_offered, icon: 'fa-check-circle', iconBg: '#eafff5', iconFg: '#389e0d' },
    { key: 'total_admission_rejected', label: 'Rejected', value: totals.total_admission_rejected, icon: 'fa-times-circle', iconBg: '#fff2f0', iconFg: '#f5222d' },
    { key: 'total_accepted_by_student', label: 'Accepted', value: totals.total_accepted_by_student, icon: 'fa-thumbs-up', iconBg: '#e6fffb', iconFg: '#13c2c2' },
    { key: 'total_rejected_by_student', label: 'Declined', value: totals.total_rejected_by_student, icon: 'fa-thumbs-down', iconBg: '#fff7e6', iconFg: '#fa8c16' },
    { key: 'total_payment_proof_uploaded', label: 'Payment', value: totals.total_payment_proof_uploaded, icon: 'fa-credit-card', iconBg: '#edf5ff', iconFg: '#1890ff' },
    { key: 'total_enrolled', label: 'Enrolled', value: totals.total_enrolled, icon: 'fa-graduation-cap', iconBg: '#f9f0ff', iconFg: '#722ed1' },
  ]

  return (
    <div className="dash-section">
      <div className="dash-header">
        <h2 className="dash-title">
          <i className="fa fa-user-tie" style={{ marginRight: 8, color: '#722ed1' }}></i>
          Agent Scoreboard
        </h2>
      </div>
      <div className="dash-body">
        <div className="dash-cards-grid-5">
          {cards.map(c => (
            <div key={c.key} className="dash-stat-card" style={{ borderTopColor: c.iconFg }}>
              <div className="dash-stat-top">
                <span className="dash-stat-icon" style={{ background: c.iconBg }}>
                  <i className={`fa ${c.icon}`} style={{ color: c.iconFg, fontSize: 16 }}></i>
                </span>
                <span className="dash-stat-label">{c.label}</span>
              </div>
              <div className="dash-stat-value">{Number(c.value || 0).toLocaleString()}</div>
              <div className="dash-stat-sparkline" style={{ background: c.iconFg }}></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function LeadsModule({ result }) {
  return (
    <div className="dash-section dash-flex-2">
      <div className="dash-header">
        <h2 className="dash-title">
          <i className="fa fa-funnel-dollar" style={{ marginRight: 8, color: '#52c41a' }}></i>
          Leads Pipeline
        </h2>
      </div>
      <div className="dash-body">
        <div className="dash-row-inner">
          <ScoreBoardTotalLeads result={result} />
          <ScoreBoardTotalLeadsStage result={result} />
        </div>
      </div>
    </div>
  )
}

function ScoreBoardTotalLeads({ result }) {
  const total = Number(result?.total_students || 0)
  const online = Number(result?.basic_info_completed || 0)
  const offline = Math.max(0, total - online)
  const onlinePct = total ? (online / total) * 100 : 0
  const offlinePct = total ? (offline / total) * 100 : 0

  const pieData = [
    { name: 'Online', value: online },
    { name: 'Offline', value: offline },
  ]

  const getPieColor = (name, value, totalVal) => {
    if (totalVal === 0) return '#d9d9d9'
    if (name === 'Online') return '#133f49'
    return '#93c5fd'
  }

  return (
    <div className="dash-lead-box">
      <h3 className="dash-sub-title">
        <i className="fa fa-chart-pie" style={{ marginRight: 6, color: '#1e6f5e' }}></i>
        Total Leads
      </h3>
      <div className="dash-lead-total">{total.toLocaleString()}</div>
      <div className="dash-progress-wrap">
        <div className="dash-progress">
          <div className="dash-progress-lbl">Online: {online.toLocaleString()}</div>
          <div className="dash-progress-bar" style={{ width: `${onlinePct}%`, background: '#133f49' }}></div>
        </div>
      </div>
      <div className="dash-progress-wrap">
        <div className="dash-progress dash-progress-alt">
          <div className="dash-progress-lbl">Offline: {offline.toLocaleString()}</div>
          <div className="dash-progress-bar" style={{ width: `${offlinePct}%`, background: '#93c5fd' }}></div>
        </div>
      </div>
      <div style={{ width: '100%', height: 200, marginTop: 12 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie dataKey="value" data={pieData} cx="50%" cy="50%" outerRadius={65} label>
              {pieData.map((entry, index) => (
                <Cell key={`slice-${index}`} fill={getPieColor(entry.name, entry.value, total)} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => Number(v).toLocaleString()} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function ScoreBoardTotalLeadsStage({ result }) {
  const total = Number(result?.total_students || 0)
  const stageRows = [
    { label: 'Registration', value: Number(result?.registration_completed || 0), color: '#3b82f6' },
    { label: 'Basic Info', value: Number(result?.basic_info_completed || 0), color: '#6366f1' },
    { label: 'Education', value: Number(result?.educational_info_completed || 0), color: '#8b5cf6' },
    { label: 'Background', value: Number(result?.background_info_completed || 0), color: '#a855f7' },
    { label: 'Choice Filling', value: Number(result?.choice_filling_completed || 0), color: '#e24dd1' },
    { label: 'Offered', value: Number(result?.admission_offered || 0), color: '#90e3ac' },
    { label: 'Accepted', value: Number(result?.offer_accepted || 0), color: '#14b8a6' },
    { label: 'Payment', value: Number(result?.payment_proof || 0), color: '#f59e0b' },
    { label: 'Visa', value: Number(result?.visa_letters || 0), color: '#ef4444' },
    { label: 'Pickup', value: Number(result?.pickup_scheduled || 0), color: '#ec4899' },
    { label: 'Enrolled', value: Number(result?.enrolled || 0), color: '#722ed1' },
  ]

  return (
    <div className="dash-lead-box">
      <h3 className="dash-sub-title">
        <i className="fa fa-layer-group" style={{ marginRight: 6, color: '#1e6f5e' }}></i>
        Total Leads Stages
      </h3>
      <div className="dash-lead-total" style={{ color: '#020f0f' }}>{total.toLocaleString()}</div>
      {stageRows.map((row) => {
        const pct = total ? (row.value / total) * 100 : 0
        return (
          <div className="dash-progress-wrap" key={row.label}>
            <div className="dash-progress">
              <div className="dash-progress-lbl">{row.label}: {row.value.toLocaleString()}</div>
              <div className="dash-progress-bar" style={{ width: `${pct}%`, background: row.color }}></div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function GenderRatioChart({ genderRatio }) {
  const data = useMemo(() => {
    const arr = genderRatio?.data || []
    return arr.map(d => ({ name: d.gender, value: Number(d.count || 0), percentage: Number(d.percentage || 0) }))
  }, [genderRatio])
  const total = Number(genderRatio?.summary?.total || data.reduce((s, d) => s + d.value, 0))
  const colorMap = { Male: '#1890ff', Female: '#eb2f96', Transgender: '#722ed1', Unknown: '#8c8c8c' }
  const getColor = (name) => colorMap[name] || '#bfbfbf'
  const renderGenderLabel = ({ name, percent, value }) => {
    if (!value || (percent * 100) < 2) return null
    return `${name}: ${Math.round(percent * 100)}%`
  }

  if (!data || data.length === 0) {
    return (
      <div className="dash-section dash-flex-1">
        <div className="dash-header">
          <h3 className="dash-title">
            <i className="fa fa-venus-mars" style={{ marginRight: 6, color: '#eb2f96' }}></i>
            Gender Ratio
          </h3>
        </div>
        <div className="dash-body"><Empty description="No data" /></div>
      </div>
    )
  }

  return (
    <div className="dash-section dash-flex-1">
      <div className="dash-header">
        <h3 className="dash-title">
          <i className="fa fa-venus-mars" style={{ marginRight: 6, color: '#eb2f96' }}></i>
          Gender Ratio
        </h3>
      </div>
      <div className="dash-body">
        <div style={{ width: '100%', height: 240 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie dataKey="value" data={data} cx="50%" cy="50%" outerRadius={80} label={renderGenderLabel} labelLine={false} minAngle={2} paddingAngle={1}>
                {data.map((entry, index) => <Cell key={`gender-${index}`} fill={getColor(entry.name)} />)}
              </Pie>
              <Tooltip formatter={(v, n, p) => [`${Number(v).toLocaleString()}`, p?.payload?.name]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{ marginTop: 8 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Total: {total.toLocaleString()}</div>
          {data.map(d => (
            <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
              <span style={{ width: 10, height: 10, background: getColor(d.name), borderRadius: 2 }}></span>
              <span style={{ minWidth: 90, fontSize: 13 }}>{d.name}</span>
              <span style={{ marginLeft: 'auto', color: '#6b7280', fontSize: 13 }}>{d.value.toLocaleString()} ({d.percentage}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function IssueStatsChart({ issueStats }) {
  const rows = useMemo(() => {
    const arr = issueStats?.data || [];
    return arr.map((d) => ({
      name: String(d.status || ""),
      value: Number(d.count || 0),
    }));
  }, [issueStats]);

  if (!rows || rows.length === 0) {
    return (
      <div className="dash-section dash-flex-1">
        <div className="dash-header">
          <h3 className="dash-title">
            <i className="fa fa-exclamation-triangle" style={{ marginRight: 6, color: '#faad14' }}></i>
            Student Issues
          </h3>
        </div>
        <div className="dash-body"><Empty description="No issues" /></div>
      </div>
    );
  }

  const iconFor = (name) => {
    if (/open/i.test(name)) return { icon: 'fa-exclamation-circle', fg: '#f5222d', bg: '#fff1f0' }
    if (/process|progress/i.test(name)) return { icon: 'fa-hourglass-half', fg: '#faad14', bg: '#fffbe6' }
    if (/closed|resolved|done/i.test(name)) return { icon: 'fa-check-circle', fg: '#52c41a', bg: '#f6ffed' }
    return { icon: 'fa-circle', fg: '#8c8c8c', bg: '#f5f5f5' }
  }

  return (
    <div className="dash-section dash-flex-1">
      <div className="dash-header">
        <h3 className="dash-title">
          <i className="fa fa-exclamation-triangle" style={{ marginRight: 6, color: '#faad14' }}></i>
          Student Issues
        </h3>
      </div>
      <div className="dash-body">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {rows.map((d) => {
            const i = iconFor(d.name)
            return (
              <div key={d.name} className="dash-issue-row">
                <span className="dash-issue-icon" style={{ background: i.bg }}>
                  <i className={`fa ${i.icon}`} style={{ color: i.fg }}></i>
                </span>
                <span className="dash-issue-name">{d.name}</span>
                <span className="dash-issue-count">{Number(d.value || 0).toLocaleString()}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}

function AgeRangeChart({ ageRangeStats }) {
  const rows = useMemo(() => {
    const arr = ageRangeStats?.data || [];
    return arr.map((d) => ({
      range: d.range,
      count: Number(d.count || 0),
      percentage: Number(d.percentage || 0),
    }));
  }, [ageRangeStats]);

  if (!rows || rows.length === 0) {
    return (
      <div className="dash-section dash-flex-1">
        <div className="dash-header">
          <h3 className="dash-title">
            <i className="fa fa-birthday-cake" style={{ marginRight: 6, color: '#722ed1' }}></i>
            Age Range
          </h3>
        </div>
        <div className="dash-body"><Empty description="No data" /></div>
      </div>
    );
  }

  const COLORS = [
    "rgba(72, 201, 176, 0.3)",
    "rgba(241, 196, 15, 0.3)",
    "rgba(231, 76, 60, 0.3)",
    "rgba(24, 144, 255, 0.3)",
    "rgba(114, 46, 209, 0.3)",
  ];

  const BORDER_COLORS = [
    "#48C9B0",
    "#F1C40F",
    "#E74C3C",
    "#1890ff",
    "#722ed1",
  ];

  return (
    <div className="dash-section dash-flex-1">
      <div className="dash-header">
        <h3 className="dash-title">
          <i className="fa fa-birthday-cake" style={{ marginRight: 6, color: '#722ed1' }}></i>
          Age Range
        </h3>
      </div>
      <div className="dash-body" style={{ width: "100%", height: 280 }}>
        <ResponsiveContainer>
          <BarChart data={rows} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
            <XAxis dataKey="range" tick={{ fill: "#374151", fontSize: 12 }} />
            <YAxis tick={{ fill: "#374151", fontSize: 12 }} />
            <Tooltip
              formatter={(v, n, p) => [`${v} (${p.payload.percentage}%)`, n]}
              contentStyle={{ backgroundColor: "#fff", borderRadius: 8, border: "1px solid #e5e7eb" }}
            />
            <Legend />
            <Bar dataKey="count" name="Students" radius={[6, 6, 0, 0]} barSize={40}>
              {rows.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke={BORDER_COLORS[index % BORDER_COLORS.length]}
                  strokeWidth={2}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function InstituteStage({ instScore }) {
  const columns = [
    {
      title: "Institute Name",
      dataIndex: "institute_name",
      key: "institute_name",
      width: 220,
      render: (name) => <span style={{ fontWeight: 500, color: "#333" }}>{name}</span>,
    },
    { title: "Type", dataIndex: "institute_type", key: "institute_type", width: 120, render: (type) => <span style={{ color: "#666" }}>{type}</span> },
    { title: "City", dataIndex: "city", key: "city", width: 150, render: (city) => <span style={{ color: "#666" }}>{city}</span> },
    { title: "Choice Filled", dataIndex: "total_choice_filled", key: "total_choice_filled", align: "right", width: 140, render: (val) => <span style={{ fontWeight: 600, color: "#1677ff" }}>{val.toLocaleString()}</span> },
    { title: "Offered", dataIndex: "admission_offered", key: "admission_offered", align: "right", width: 120, render: (val) => <span style={{ fontWeight: 600, color: "#52c41a" }}>{val.toLocaleString()}</span> },
    { title: "Rejected", dataIndex: "admission_rejected", key: "admission_rejected", align: "right", width: 120, render: (val) => <span style={{ fontWeight: 600, color: "#f5222d" }}>{val.toLocaleString()}</span> },
    { title: "Accepted", dataIndex: "accepted_by_student", key: "accepted_by_student", align: "right", width: 140, render: (val) => <span style={{ fontWeight: 600, color: "#52c41a" }}>{val.toLocaleString()}</span> },
    { title: "Rejected (Stu)", dataIndex: "rejected_by_student", key: "rejected_by_student", align: "right", width: 140, render: (val) => <span style={{ fontWeight: 600, color: "#fa8c16" }}>{val.toLocaleString()}</span> },
    { title: "Payment", dataIndex: "payment_proof_uploaded", key: "payment_proof_uploaded", align: "right", width: 140, render: (val) => <span style={{ fontWeight: 600, color: "#1890ff" }}>{val.toLocaleString()}</span> },
    { title: "Enrolled", dataIndex: "enrolled", key: "enrolled", align: "right", width: 120, render: (val) => <span style={{ fontWeight: 600, color: "#722ed1" }}>{val.toLocaleString()}</span> },
    { title: "Visa", dataIndex: "ticket_visa_uploaded", key: "ticket_visa_uploaded", align: "right", width: 120, render: (val) => <span style={{ fontWeight: 600, color: "#13c2c2" }}>{val.toLocaleString()}</span> },
  ];

  const data = useMemo(() => {
    if (!Array.isArray(instScore)) return [];
    return instScore.map((i, index) => ({
      key: index,
      institute_name: i.institute_name || "—",
      institute_type: i.institute_type || "—",
      city: i.city || "—",
      total_choice_filled: Number(i.total_choice_filled || 0),
      admission_offered: Number(i.admission_offered || 0),
      admission_rejected: Number(i.admission_rejected || 0),
      accepted_by_student: Number(i.accepted_by_student || 0),
      rejected_by_student: Number(i.rejected_by_student || 0),
      payment_proof_uploaded: Number(i.payment_proof_uploaded || 0),
      enrolled: Number(i.enrolled || 0),
      ticket_visa_uploaded: Number(i.ticket_visa_uploaded || 0),
    }));
  }, [instScore]);

  return (
    <div className="dash-section">
      <div className="dash-header">
        <h3 className="dash-title">
          <i className="fa fa-university" style={{ marginRight: 6, color: '#1677ff' }}></i>
          Institute Wise Summary
        </h3>
      </div>
      <div className="dash-body">
        {data.length === 0 ? (
          <Empty description="No institute data" />
        ) : (
          <Table
            columns={columns}
            dataSource={data}
            pagination={false}
            bordered
            size="middle"
            scroll={{ x: "max-content", y: 400 }}
            className="dash-table-bg"
          />
        )}
      </div>
    </div>
  );
}

function TopInstitutesChart({ topInst }) {
  const rows = useMemo(() => {
    if (!Array.isArray(topInst)) return [];
    return topInst
      .map((i) => ({
        key: i.institute_id,
        name: i.institute_name,
        applications: i.total_applications || 0,
        offered: i.admission_offered || 0,
      }))
      .sort((a, b) => b.applications - a.applications)
      .slice(0, 10)
  }, [topInst]);

  if (rows.length === 0) {
    return (
      <div className="dash-section dash-flex-1">
        <div className="dash-header">
          <h3 className="dash-title">
            <i className="fa fa-trophy" style={{ marginRight: 6, color: '#faad14' }}></i>
            Top Institutes
          </h3>
        </div>
        <div className="dash-body"><Empty description="No data" /></div>
      </div>
    );
  }

  const columns = [
    { title: "Institute", dataIndex: "name", key: "name", width: 200, render: (name) => <span style={{ fontWeight: 500, color: "#333" }}>{name}</span> },
    { title: "Applications", dataIndex: "applications", key: "applications", align: "left", width: 140, render: (apps) => <span style={{ fontWeight: 600, color: "#52c41a" }}>{apps.toLocaleString()}</span> },
    { title: "Offered", dataIndex: "offered", key: "offered", width: 120, render: (offered) => <span style={{ color: "#666" }}>{offered}</span> },
  ]

  return (
    <div className="dash-section dash-flex-1">
      <div className="dash-header">
        <h3 className="dash-title">
          <i className="fa fa-trophy" style={{ marginRight: 6, color: '#faad14' }}></i>
          Top Institutes
        </h3>
      </div>
      <div className="dash-body">
        <Table columns={columns} dataSource={rows} pagination={false} size="middle" bordered scroll={{ y: 300, x: true }} className="dash-table-bg" />
      </div>
    </div>
  )
}

function TopCountriesChart({ topCountry }) {
  const rows = useMemo(() => {
    if (!Array.isArray(topCountry)) return [];
    return topCountry.map((c, idx) => ({
      key: c.country_id,
      name: c.country_name,
      applications: Number(c.total_applications || 0),
      rank: idx + 1,
    }))
  }, [topCountry]);

  const columns = [
    { title: "Country", dataIndex: "name", key: "name", width: 200, render: (name) => <span style={{ fontWeight: 500, color: "#333" }}>{name}</span> },
    { title: "Applications", dataIndex: "applications", key: "applications", width: 150, render: (apps) => <span style={{ color: "#666" }}>{apps.toLocaleString()}</span> },
  ]

  return (
    <div className="dash-section dash-flex-1">
      <div className="dash-header">
        <h3 className="dash-title">
          <i className="fa fa-globe-americas" style={{ marginRight: 6, color: '#13c2c2' }}></i>
          Top Countries
        </h3>
      </div>
      <div className="dash-body">
        <Table columns={columns} dataSource={rows} pagination={false} size="middle" bordered scroll={{ y: 300, x: true }} className="dash-table-bg" />
      </div>
    </div>
  )
}


