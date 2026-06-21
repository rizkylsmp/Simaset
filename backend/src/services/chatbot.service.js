// Chatbot Service - FAQ-based responses (tahap pengembangan)
// TODO: Integrate AI service (OpenAI/Anthropic) di masa depan

const FAQ_RESPONSES = [
  {
    keywords: ["halo", "hai", "hello", "hi", "selamat"],
    response: "Halo! Selamat datang di SIMASET - Sistem Manajemen Aset Tanah Kota Pasuruan. Ada yang bisa saya bantu?",
    kategori: "greeting",
  },
  {
    keywords: ["login", "masuk", "akun", "password", "kata sandi"],
    response: "Untuk login ke SIMASET, gunakan username dan password yang telah diberikan. Jika lupa password, hubungi admin untuk reset akun. Pastikan Anda memiliki akses yang sesuai dengan peran Anda (Admin BPKA/BPN, Staff, atau Masyarakat).",
    kategori: "akun",
  },
  {
    keywords: ["aset", "tanah", "bidang", "sertifikat"],
    response: "SIMASET mengelola data aset tanah milik Pemkot Pasuruan. Anda dapat melihat data aset, status sertifikat, lokasi bidang tanah, dan informasi lainnya melalui menu navigasi. Untuk pertanyaan spesifik tentang aset tertentu, silakan hubungi Admin BPKA.",
    kategori: "aset",
  },
  {
    keywords: ["peta", "map", "lokasi", "gis"],
    response: "Fitur peta menampilkan visualisasi geografis aset tanah. Anda dapat melihat bidang tanah, batas wilayah, dan layer lainnya. Gunakan kontrol layer untuk menampilkan/menyembunyikan informasi yang dibutuhkan.",
    kategori: "peta",
  },
  {
    keywords: ["sewa", "rental", "peminjaman"],
    response: "Untuk informasi penyewaan aset, Anda dapat melihat daftar aset yang tersedia di menu 'Aset Tersedia'. Proses penyewaan memerlukan persetujuan dari Admin BPKA. Silakan ajukan permintaan melalui form yang tersedia.",
    kategori: "sewa",
  },
  {
    keywords: ["notifikasi", "notification", "pemberitahuan"],
    response: "Notifikasi akan muncul di pojok kanan atas untuk memberitahu Anda tentang aktivitas terbaru seperti status aset, permintaan sewa, dan informasi penting lainnya. Anda dapat menandai semua sebagai sudah dibaca.",
    kategori: "notifikasi",
  },
  {
    keywords: ["laporan", "report", "export", "download"],
    response: "Anda dapat mengunduh laporan dalam format PDF atau Excel dari berbagai halaman. Cari tombol 'Download' atau 'Export' di halaman yang ingin Anda laporkan.",
    kategori: "laporan",
  },
  {
    keywords: ["kontak", "hubungi", "contact", "admin"],
    response: "Untuk bantuan lebih lanjut, silakan hubungi:\n- Admin BPKA: admin_bpka@simaset.com\n- Admin BPN: admin_bpn@simaset.com\n- Jam operasional: Senin-Jumat, 08:00-16:00 WIB",
    kategori: "kontak",
  },
  {
    keywords: ["error", "masalah", "problem", "bug", "tidak bisa"],
    response: "Mohon maaf atas ketidaknyamanannya. Jika Anda mengalami masalah teknis, silakan:\n1. Refresh halaman\n2. Clear cache browser\n3. Hubungi admin jika masalah berlanjut\n\nCatatan: Chatbot ini masih dalam tahap pengembangan. Tim kami sedang berupaya meningkatkan layanan.",
    kategori: "support",
  },
  {
    keywords: ["fitur", "feature", "fungsi", "cara pakai", "panduan"],
    response: "SIMASET menyediakan fitur:\n- Manajemen data aset tanah\n- Visualisasi peta interaktif\n- Sistem penyewaan aset\n- Riwayat aktivitas\n- Laporan dan ekspor data\n\nUntuk panduan penggunaan, silakan hubungi admin atau lihat dokumentasi yang tersedia.",
    kategori: "fitur",
  },
  {
    keywords: ["terima kasih", "thanks", "makasih"],
    response: "Sama-sama! Senang bisa membantu. Jika ada pertanyaan lain, jangan ragu untuk bertanya lagi. 😊",
    kategori: "closing",
  },
  {
    keywords: ["bantuan", "help", "bantu"],
    response: "Saya siap membantu! Anda bisa bertanya tentang:\n- Cara login dan manajemen akun\n- Informasi aset dan sertifikat\n- Fitur peta dan visualisasi\n- Proses penyewaan aset\n- Laporan dan ekspor data\n- Kontak admin\n\nAtau ajukan pertanyaan spesifik yang Anda butuhkan.",
    kategori: "help",
  },
];

// Default response jika tidak ada match
const DEFAULT_RESPONSE = {
  response: "Mohon maaf, saya belum memahami pertanyaan Anda. Chatbot ini masih dalam tahap pengembangan dan terus ditingkatkan.\n\nAnda dapat mencoba:\n- Menanyakan tentang login, aset, peta, sewa, atau fitur lainnya\n- Menghubungi admin untuk bantuan langsung\n\nTerima kasih atas pengertiannya!",
  kategori: "default",
};

class ChatbotService {
  /**
   * Find best matching response based on user message
   * @param {string} message - User's message
   * @returns {object} - Response object with jawaban and kategori
   */
  findResponse(message) {
    const lowerMessage = message.toLowerCase().trim();

    // Check each FAQ response
    for (const faq of FAQ_RESPONSES) {
      const hasKeyword = faq.keywords.some((keyword) =>
        lowerMessage.includes(keyword)
      );

      if (hasKeyword) {
        return {
          jawaban: faq.response,
          kategori: faq.kategori,
        };
      }
    }

    // Return default response if no match
    return {
      jawaban: DEFAULT_RESPONSE.response,
      kategori: DEFAULT_RESPONSE.kategori,
    };
  }

  /**
   * Get suggested questions for quick access
   * @returns {array} - List of suggested questions
   */
  getSuggestedQuestions() {
    return [
      "Cara login ke SIMASET?",
      "Bagaimana melihat data aset?",
      "Cara menggunakan peta?",
      "Bagaimana proses sewa aset?",
      "Cara download laporan?",
      "Kontak admin",
    ];
  }

  /**
   * Get quick reply options based on current context
   * @param {string} kategori - Current conversation kategori
   * @returns {array} - List of quick reply buttons
   */
  getQuickReplies(kategori) {
    const quickReplies = {
      greeting: [
        "Apa itu SIMASET?",
        "Cara login",
        "Lihat fitur",
      ],
      akun: [
        "Lupa password",
        "Cara daftar",
        "Hubungi admin",
      ],
      aset: [
        "Lihat daftar aset",
        "Status sertifikat",
        "Cari aset tertentu",
      ],
      peta: [
        "Layer yang tersedia",
        "Cara zoom peta",
        "Lihat batas wilayah",
      ],
      sewa: [
        "Aset tersedia",
        "Cara mengajukan sewa",
        "Status permintaan",
      ],
      default: [
        "Fitur SIMASET",
        "Cara pakai",
        "Hubungi admin",
      ],
    };

    return quickReplies[kategori] || quickReplies.default;
  }
}

export default new ChatbotService();
