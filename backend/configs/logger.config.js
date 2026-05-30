import pino from 'pino'

const logger = pino({
  level: process.env.LOG_LEVEL || 'info', // Default ke 'debug' jika tidak di-set
  transport: {
	  // Gunakan pino-pretty untuk output yang lebih mudah dibaca
    target: 'pino-pretty', 
    options: {
      colorize: true, // Aktifkan pewarnaan untuk konsol
      translateTime: 'yyyy-mm-dd HH:MM:ss', // Format waktu yang lebih baik
    },
  },
})

export default logger