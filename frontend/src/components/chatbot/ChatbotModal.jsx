import { createPortal } from "react-dom";
import { XIcon, ChatCircleIcon, WrenchIcon } from "@phosphor-icons/react";

const ChatbotModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed bottom-20 right-6 z-50 w-full max-w-sm">
      {/* Chat Window */}
      <div className="w-full bg-surface border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden h-100">
        {/* Header */}
        <div className="bg-linear-to-r from-accent to-accent/90 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <ChatCircleIcon size={24} weight="fill" className="text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">
                Bantuan SIMASET
              </h3>
              <p className="text-white/70 text-xs">Chatbot Helpdesk</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Tutup"
          >
            <XIcon size={20} weight="bold" className="text-white" />
          </button>
        </div>

        {/* Center Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-surface-secondary">
          <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-6">
            <WrenchIcon
              size={40}
              weight="fill"
              className="text-amber-600 dark:text-amber-400"
            />
          </div>
          <p className="text-text-primary text-lg font-semibold mb-2">
            Fitur dalam Tahap Pengembangan
          </p>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ChatbotModal;
