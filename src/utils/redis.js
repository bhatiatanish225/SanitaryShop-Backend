const Redis = require('ioredis')

const redis = new Redis(
  process.env.REDIS_URL || {
    host: 'localhost',
    port: 6379,
    password: '',
  }
)

redis.on('connect', () => console.log('✅ Connected to Redis!'))
redis.on('error', (err) => console.error('❌ Redis error:', err))

module.exports = redis
