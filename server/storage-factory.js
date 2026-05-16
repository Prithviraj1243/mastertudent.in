/**
 * Storage Factory
 * Dynamically loads the appropriate storage provider based on environment configuration
 */

const storageProvider = process.env.STORAGE_PROVIDER === 'supabase'
  ? require('./supabase-storage')
  : require('./storage');

module.exports = { storageProvider };