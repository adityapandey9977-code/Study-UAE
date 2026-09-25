import { Button, Dropdown, Tag, Space, message } from "antd";
import { DownOutlined, CheckCircleTwoTone } from "@ant-design/icons";
import InstituteService from "../../services/InstituteService";

const items = [
  { key: "Rejected", label: "Rejected" },
  { key: "Acknowledged", label: "Acknowledged" },
];

export default function PaymentStatusDropdown({ status, scf_id, student_id, onChange }) {
  const updateStatus = async (newStatus) => {
    const payload = {
      id : scf_id,
      payment_status: newStatus,
      studentid : student_id
    }
    try {
      const res = await InstituteService.updatePaymentStatus(payload);

      if (res?.data?.code === 200) {
        const successMessage = newStatus === 'Acknowledged' 
          ? 'Payment acknowledged successfully. Student has been notified via email.'
          : 'Payment rejected successfully. Student has been notified via email.';
        message.success(res.data.message || successMessage);
        if (onChange) onChange(newStatus); // notify parent
      } else {
        message.error(res?.data?.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Error:", err);
      message.error("Error updating payment status");
    }
  };

  if (status === "Acknowledged") {
    return (
      <Space>
        <Tag
          icon={<CheckCircleTwoTone twoToneColor="#52c41a" />}
          color="success"
          style={{ fontSize: "14px", padding: "4px 10px", border: "none" }}
        >
          Acknowledged
        </Tag>
        <Button danger size="small" onClick={() => updateStatus("Rejected")}>
          Reject
        </Button>
      </Space>
    );
  }

  return (
   <Dropdown
  menu={{
    items,
    onClick: ({ key }) => updateStatus(key),
  }}
  placement="bottomLeft"
  arrow
>
  <Button className="flex items-center gap-2 border rounded-sm px-3 py-1 shadow-sm hover:bg-gray-100">
    <DownOutlined className="text-gray-500" />
  </Button>
</Dropdown>
  );
}
