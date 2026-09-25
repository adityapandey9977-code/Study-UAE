import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentService from "../../services/StudentService";
import { RawHTML } from "../../utils/Controls";
import util from "../../utils/util";
import { message, List, Tabs, Tag, Card, Button } from 'antd';
import { MailOutlined, WhatsAppOutlined } from '@ant-design/icons';

export default function Communications() {
	const navigate = useNavigate();
	const [sentEmails, setSentEmails] = useState([]);
	const [sentWhatsapp, setSentWhatsapp] = useState([]);
	const [expanded, setExpanded] = useState({}); // keyed by item key
	const isInstitute = util.isInstitute() === 1;

	const makeKey = (it, idx, type) => {
		return it.id ?? it._id ?? `${type}-${it.created ?? ''}-${idx}`;
	};

	const stripTags = (html = '') => {
		const div = document.createElement('div');
		div.innerHTML = html;
		return div.textContent || div.innerText || '';
	};

	const getSentEmails = () => {
		util.showLoader();
		StudentService.allSentEmails({})
			.then(({ data }) => {
				setSentEmails(data.result?.data || []);
			})
			.catch(e => message.error(e.message))
			.finally(() => util.hideLoader());
	};

	const getSentWhatsapp = () => {
		util.showLoader();
		StudentService.getAllSentWhatsapp()
			.then((data) => {
				setSentWhatsapp(data || []);
			})
			.catch(e => message.error(e.message))
			.finally(() => util.hideLoader());
	};

	useEffect(() => {
		getSentEmails();
		if (isInstitute) {
			getSentWhatsapp();
		}
	}, [isInstitute]);

	const toggleExpand = (key) => {
		setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
	};

	// Renderer with read-more/less for both email (HTML) and whatsapp (text)
	const renderList = (data, type = "email") => (
		<List
			itemLayout="vertical"
			dataSource={data}
			renderItem={(item, idx) => {
				const key = makeKey(item, idx, type);
				const createdAt = util.getDate(item.created, 'DD MMM YYYY @ hh:mm A');

				// Derive title/body and metadata per type
				const title = type === 'email' ? (item.subject || 'No Subject') : 'WhatsApp Message';
				const fromLabel = type === 'email'
					? (item.from_email || item.from || '')
					: (item.from_mobile || item.from || '');
				const toLabel = type === 'email'
					? (Array.isArray(item.to_emails) ? item.to_emails.join(', ') : (item.to_email || item.to || ''))
					: (item.to_mobile || item.to || '');

				const isExpanded = !!expanded[key];

				// Compute content and long indicator
				const htmlBody = type === 'email' ? (item.body || '') : '';
				const plainBody = type === 'email' ? stripTags(htmlBody) : (item.msg || '');
				const isLong = (plainBody || '').length > 280;

				return (
					<List.Item className="comm-item">
						<div className="comm-item-header">
							<div className="comm-item-title">
								{type === 'email' ? <MailOutlined className="mr8" /> : <WhatsAppOutlined className="mr8" />}
								<span>{title}</span>
							</div>
							<Tag color="blue">{createdAt}</Tag>
						</div>

						{(fromLabel || toLabel) && (
							<div className="comm-meta">
								{fromLabel && (
									<div className="comm-meta-field">
										<span className="label">From:</span>
										<span className="value" title={fromLabel}>{fromLabel}</span>
									</div>
								)}
								{toLabel && (
									<div className="comm-meta-field">
										<span className="label">To:</span>
										<span className="value" title={toLabel}>{toLabel}</span>
									</div>
								)}
							</div>
						)}

						{/* Body */}
						{type === "email" ? (
							<div className={isExpanded ? "comm-body" : "comm-body clamped"}>
								<RawHTML html={htmlBody} />
							</div>
						) : (
							<div className={isExpanded ? "comm-body text" : "comm-body text clamped"}>
								{plainBody || '-'}
							</div>
						)}

						{isLong && (
							<div className="comm-actions">
								<Button type="link" size="small" onClick={() => toggleExpand(key)}>
									{isExpanded ? 'Read less' : 'Read more'}
								</Button>
							</div>
						)}
					</List.Item>
				);
			}}
		/>
	);

	return (
		<div className="page-content">
			<style>{`
				.comm-item { background: #fff; border: 1px solid #f0f0f0; border-radius: 8px; margin-bottom: 12px; padding: 12px 14px; box-shadow: 0 1px 2px rgba(0,0,0,0.03); }
				.comm-item:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
				.comm-item-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
				.comm-item-title { font-weight: 600; font-size: 14px; display: inline-flex; align-items: center; gap: 8px; }
				.comm-meta { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 4px 16px; margin-bottom: 8px; }
				.comm-meta-field { display: flex; gap: 6px; min-width: 0; }
				.comm-meta-field .label { color: #8c8c8c; font-size: 12px; white-space: nowrap; }
				.comm-meta-field .value { font-size: 12px; color: #262626; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
				.comm-body { font-size: 13px; color: #4a4a4a; line-height: 1.6; }
				.comm-body.text { white-space: pre-wrap; }
				/* clamp 6 lines by default */
				.comm-body.clamped { display: -webkit-box; -webkit-line-clamp: 6; -webkit-box-orient: vertical; overflow: hidden; }
				.comm-actions { margin-top: 6px; }
				/* header styles */
				.page-head h2 { margin: 0; }
				.mr8 { margin-right: 8px; }
			`}</style>

			{/* Header */}
			<div className="page-head-gradient" style={{ justifyContent: 'space-between', flexDirection: 'row' }}>
				<h2>Communications</h2>
				<div className="d-flex align-items-center" style={{ gap: 10 }}>
					{!isInstitute && (
						<span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
							Reg. No: <span className="bold600">{util.getRegno()}</span>
						</span>
					)}
					<div
						className="pill-btn sm cursor-pointer"
						style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none' }}
						onClick={() => navigate("/dashboard")}
					>
						Go To Dashboard
					</div>
				</div>
			</div>

			<Card className="shadow-sm rounded-lg">
				{isInstitute ? (
					<Tabs
						defaultActiveKey="emails"
						className="custom-tabs"
						items={[
							{
								key: 'emails',
								label: 'Emails',
								children: sentEmails.length > 0
									? renderList(sentEmails, "email")
									: <div className="p-6 text-gray-500 text-center">No emails found.</div>
							},
							{
								key: 'whatsapp',
								label: 'WhatsApp',
								children: sentWhatsapp.length > 0
									? renderList(sentWhatsapp, "whatsapp")
									: <div className="p-6 text-gray-500 text-center">No WhatsApp messages found.</div>
							}
						]}
					/>
				) : (
					<>
						{sentEmails.length > 0
							? renderList(sentEmails, "email")
							: <div className="p-6 text-gray-500 text-center">No emails found.</div>}
					</>
				)}
			</Card>
		</div>
	);
}