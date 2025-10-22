// ============================================================
// 🔧 SERVER ENTRY POINT — FIXED VERSION
// ============================================================

// 1️⃣ Load environment variables paling awal
require('dotenv').config();

// 2️⃣ Import dependencies utama
const express = require('express');
const cors = require('cors');
const morgan = require('morgan'); // optional: untuk logging request
const path = require('path');

// 3️⃣ Inisialisasi server
const app = express();

// 4️⃣ Validasi variabel environment kritis
if (!process.env.AI_API_KEY) {
  console.error("❌ [CONFIG ERROR] Variabel AI_API_KEY hilang atau belum diset di file .env");
  process.exit(1); // hentikan server
}

// 5️⃣ Konfigurasi CORS dengan whitelist origin (React dev server)
const corsOptions = {
  origin: 'http://localhost:3000', // sesuaikan dengan port frontend kamu
  methods: ['GET', 'POST'],
  credentials: true
};
app.use(cors(corsOptions));

// 6️⃣ Middleware umum
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // log semua request di console

// 7️⃣ Routing utama (AI Client)
const aiClientRoutes = require('./ai-client');
app.use('/api/ai', aiClientRoutes);

// 8️⃣ Fallback route (404)
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Endpoint tidak ditemukan: ${req.originalUrl}`
  });
});

// 9️⃣ Global Error Handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Terjadi kesalahan tak terduga pada server.';

  console.error(`[ERROR ${status}] ${req.method} ${req.originalUrl}:`, message, err.stack);

  res.status(status).json({
    success: false,
    status,
    message: status === 500 ? 'Internal Server Error' : message
  });
});

// 🔟 Jalankan server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});
