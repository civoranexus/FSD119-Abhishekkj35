const crypto = require('crypto');

// Use environment variable for encryption key, fallback to a default for development
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'health_village_dev_key_256_bit!';

// Ensure key is 32 bytes (256 bits) for AES-256
const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32));

/**
 * Encrypt sensitive medical data using AES-256-CBC
 * @param {string} plaintext - Data to encrypt
 * @returns {string} - Encrypted data (IV:encryptedData in hex format)
 */
const encryptData = (plaintext) => {
  if (!plaintext) return null;
  
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    // Return IV + encrypted data separated by colon
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (err) {
    throw new Error(`Encryption failed: ${err.message}`);
  }
};

/**
 * Decrypt sensitive medical data
 * @param {string} encryptedData - Encrypted data (IV:encryptedData format)
 * @returns {string} - Decrypted plaintext
 */
const decryptData = (encryptedData) => {
  if (!encryptedData) return null;
  
  try {
    const [ivHex, encrypted] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    throw new Error(`Decryption failed: ${err.message}`);
  }
};

module.exports = {
  encryptData,
  decryptData
};
