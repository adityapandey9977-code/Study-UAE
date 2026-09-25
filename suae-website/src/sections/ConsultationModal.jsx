import { X } from "lucide-react";

export function ConsultationModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <section id="consultation">
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#0d1f39]/65 px-4 py-4 backdrop-blur-[2px]">
        <div
          className="relative my-auto w-full max-w-[800px] overflow-hidden rounded-[1.375rem] border border-[#d8e3ef] bg-white text-night shadow-[0_24px_80px_rgba(5,21,44,0.24)]"
        >
          <button
            className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-[#d7e2ee] bg-white text-night transition hover:border-[#FACC15] hover:text-[#EAB308]"
            type="button"
            onClick={onClose}
            aria-label="Close consultation form"
          >
            <X size={18} />
          </button>

          <div className="pt-0">
            <div class="suae-dynamic-form" data-slug="consult-form"></div><script src="https://suae-php.questdigiflex.com/theme/js/form-embed.js"></script>
          </div>
        </div>
      </div>
    </section>
  );
}
