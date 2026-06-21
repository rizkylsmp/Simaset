import api from "./api";

const chatbotService = {
  sendMessage: async (payload) => {
    const response = await api.post("/chatbot/chat", payload);
    return response;
  },

  getHistory: async (sessionId) => {
    const response = await api.get(`/chatbot/history/${sessionId}`);
    return response;
  },

  clearHistory: async (sessionId) => {
    const response = await api.delete(`/chatbot/history/${sessionId}`);
    return response;
  },

  getSuggestions: async () => {
    const response = await api.get("/chatbot/suggestions");
    return response;
  },
};

export default chatbotService;
