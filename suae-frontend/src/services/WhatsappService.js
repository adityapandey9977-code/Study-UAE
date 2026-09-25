import axiosnode from "../utils/axiosnode";

class WhatsappService {
    static getQRCode = async () => {
        try {
            const { data } = await axiosnode.post("whatsapp/get-qr-code");
            return { ...data, success: true };
        } catch (e) {
            return { success: false, message: e.message };
        }
    }

    static setInstanceId = async (instance_id) => {
        try {
            const { data } = await axiosnode.post("whatsapp/set-instance-id", { instance_id });
            return { ...data, success: true };
        } catch (e) {
            return { success: false, message: e.message };
        }
    }

    static sendMessage = async ({ to, msg }) => {
        try {
            const { data } = await axiosnode.post("whatsapp/send-message", { to, msg });
            return { ...data, success: true };
        } catch (e) {
            return { success: false, message: e.message };
        }
    }
}

export default WhatsappService;
