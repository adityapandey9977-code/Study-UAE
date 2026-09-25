import { MessageCircle } from "lucide-react";
import { usePreviewData } from "../context/PreviewContext";

export function SupportRails({ supportRails: publishedSupportRails, onOpenConsultation }) {
  const supportRails = usePreviewData("supportRails", publishedSupportRails);

  return (
    <>
      <button 
        className="fixed bottom-5 left-5 z-40 flex h-14 w-14 items-center justify-center border-4 border-white bg-lagoon text-white shadow-xl hover:opacity-90" 
        style={supportRails.whatsappColor ? { backgroundColor: supportRails.whatsappColor } : {}}
        onClick={onOpenConsultation}
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle size={28} />
      </button>
      {/* <button
        type="button"
        onClick={onOpenConsultation}
        className="fixed bottom-6 right-5 z-40 hidden border border-night/10 bg-white px-4 py-3 text-left text-sm shadow-xl md:flex md:items-center md:gap-3"
      >
        <span className="flex h-7 w-7 items-center justify-center bg-[#174a8b] text-xs font-black text-white">{supportRails.bottomPopup?.logoLetter}</span>
        <span>
          <b style={supportRails.popupTitleColor ? { color: supportRails.popupTitleColor } : {}}>{supportRails.bottomPopup?.title}</b>
          <br />
          <span style={supportRails.popupCopyColor ? { color: supportRails.popupCopyColor } : {}}>{supportRails.bottomPopup?.copy}</span>
        </span>
      </button> */}
    </>
  );
}
