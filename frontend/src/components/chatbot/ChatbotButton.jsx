import { ChatCircleIcon } from "@phosphor-icons/react";

const ChatbotButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-accent hover:bg-accent/90 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
      title="Buka chatbot bantuan"
      aria-label="Buka chatbot bantuan"
    >
      <ChatCircleIcon size={28} weight="fill" />

      {/* Notification Badge */}
      <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 border-2 border-white rounded-full flex items-center justify-center">
        <span className="text-[10px] font-bold text-white">?</span>
      </span>

      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-surface border border-border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
        <p className="text-xs font-medium text-text-primary">Butuh bantuan?</p>
        <p className="text-[10px] text-text-muted">Klik untuk chat</p>
      </div>
    </button>
  );
};

export default ChatbotButton;
