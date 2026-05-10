/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Garante que os CSVs em Telegram/Energy_bot sejam empacotados nas
  // serverless functions do Vercel. Sem isso, fs.readFileSync da rota
  // /api/send-quote falha em producao porque Vercel so inclui o que e
  // referenciado por imports estaticos.
  outputFileTracingIncludes: {
    "/api/send-quote": [
      "./Telegram/Energy_bot/credenciais.csv",
      "./Telegram/Energy_bot/chat_id.csv",
    ],
  },
}

export default nextConfig
