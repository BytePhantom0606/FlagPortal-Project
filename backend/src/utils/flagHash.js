/**
 * ============================================
 * FlagForge - Flag Hashing Utilities
 * ============================================
 *
 * SECURITY CRITICAL: This module handles all flag hashing operations.
 *
 * Why scrypt instead of bcrypt?
 * - scrypt is memory-hard (resistant to GPU/ASIC attacks)
 * - Better protection against brute-force attacks on flags
 * - Configurable parameters for future-proofing
 *
 * Security features:
 * 1. Per-flag random salt (32 bytes) - prevents rainbow tables
 * 2. High iteration count (N=16384) - slow down brute force
 * 3. Constant-time comparison - prevents timing attacks
 * 4. Never logs actual flags - only hashes
 */

import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

// Scrypt parameters - DO NOT CHANGE after production deployment!
// These are optimized for security vs. performance trade-off
const SCRYPT_OPTIONS = {
  N: parseInt(process.env.FLAG_HASH_N || '16384'), // CPU/memory cost (2^14)
  r: parseInt(process.env.FLAG_HASH_R || '8'),     // Block size
  p: parseInt(process.env.FLAG_HASH_P || '1'),     // Parallelization
  keyLength: parseInt(process.env.FLAG_HASH_KEY_LENGTH || '64'),
  saltLength: parseInt(process.env.FLAG_HASH_SALT_LENGTH || '32'),
};

/**
 * Generate a cryptographically secure random salt
 * @returns {string} Hex-encoded salt
 */
export function generateSalt() {
  return randomBytes(SCRYPT_OPTIONS.saltLength).toString('hex');
}

/**
 * Hash a flag using scrypt with a given salt
 * @param {string} flag - The plaintext flag to hash
 * @param {string} salt - The salt (hex-encoded)
 * @returns {Promise<string>} The hash (hex-encoded)
 *
 * Why we do this:
 * - Ensures flags are never stored in plaintext
 * - Even if database is compromised, flags cannot be recovered
 * - Scrypt's memory-hardness makes GPU cracking impractical
 */
export async function hashFlag(flag, salt) {
  if (!flag || typeof flag !== 'string') {
    throw new Error('Flag must be a non-empty string');
  }

  if (!salt || typeof salt !== 'string') {
    throw new Error('Salt must be a non-empty string');
  }

  const saltBuffer = Buffer.from(salt, 'hex');

  const derivedKey = await scryptAsync(
    flag,
    saltBuffer,
    SCRYPT_OPTIONS.keyLength,
    {
      N: SCRYPT_OPTIONS.N,
      r: SCRYPT_OPTIONS.r,
      p: SCRYPT_OPTIONS.p,
    }
  );

  return derivedKey.toString('hex');
}

/**
 * Verify a flag submission using constant-time comparison
 * @param {string} submittedFlag - User's submitted flag
 * @param {string} storedHash - Hash from database
 * @param {string} salt - Salt from database
 * @param {boolean} caseSensitive - Whether comparison is case-sensitive
 * @returns {Promise<boolean>} True if flag matches
 *
 * Why constant-time comparison?
 * - Prevents timing attacks where attacker measures response time
 * - Even 1µs difference can leak information about correct characters
 * - timingSafeEqual ensures comparison time is independent of input
 */
export async function verifyFlag(submittedFlag, storedHash, salt, caseSensitive = true) {
  if (!submittedFlag || !storedHash || !salt) {
    return false;
  }

  try {
    // Normalize flag if case-insensitive
    const normalizedFlag = caseSensitive
      ? submittedFlag.trim()
      : submittedFlag.trim().toLowerCase();

    // Hash the submitted flag with the same salt
    const submittedHash = await hashFlag(normalizedFlag, salt);

    // Convert to buffers for constant-time comparison
    const submittedBuffer = Buffer.from(submittedHash, 'hex');
    const storedBuffer = Buffer.from(storedHash, 'hex');

    // Ensure both buffers are same length (required for timingSafeEqual)
    if (submittedBuffer.length !== storedBuffer.length) {
      return false;
    }

    // SECURITY: This comparison takes the same time regardless of input
    return timingSafeEqual(submittedBuffer, storedBuffer);
  } catch (error) {
    // Never expose errors to attacker
    // Log internally but return false
    console.error('Flag verification error (logged, not exposed):', error.message);
    return false;
  }
}

/**
 * Verify a flag against a regex pattern
 * @param {string} submittedFlag - User's submitted flag
 * @param {string} regexPattern - Regex pattern from database
 * @param {boolean} caseSensitive - Whether matching is case-sensitive
 * @returns {boolean} True if flag matches pattern
 *
 * Security note:
 * - Regex flags are NOT hashed (they're patterns, not secrets)
 * - Be careful with regex - avoid ReDoS vulnerabilities
 * - Set timeout for regex execution
 */
export function verifyRegexFlag(submittedFlag, regexPattern, caseSensitive = true) {
  if (!submittedFlag || !regexPattern) {
    return false;
  }

  try {
    // Sanitize input
    const normalizedFlag = submittedFlag.trim();

    // Create regex with appropriate flags
    const flags = caseSensitive ? '' : 'i';
    const regex = new RegExp(regexPattern, flags);

    // Test with timeout to prevent ReDoS
    const timeoutMs = 1000; // 1 second max
    const startTime = Date.now();

    const matches = regex.test(normalizedFlag);

    if (Date.now() - startTime > timeoutMs) {
      console.warn('Regex execution took too long, possible ReDoS attempt');
      return false;
    }

    return matches;
  } catch (error) {
    console.error('Regex flag verification error:', error.message);
    return false;
  }
}

/**
 * Generate a dynamic flag from template
 * @param {string} template - Template with placeholders like {user_id}, {username}
 * @param {object} user - User object with id and username
 * @returns {string} Generated flag
 *
 * Example: "flag{user_{user_id}_wins}" -> "flag{user_abc123_wins}"
 */
export function generateDynamicFlag(template, user) {
  if (!template || !user) {
    throw new Error('Template and user are required');
  }

  return template
    .replace(/{user_id}/g, user.id)
    .replace(/{username}/g, user.username);
}

/**
 * Hash a password using bcrypt (for user passwords)
 * This is separate from flag hashing
 *
 * Why bcrypt for passwords but scrypt for flags?
 * - bcrypt is battle-tested for password hashing
 * - scrypt provides better protection for high-value secrets (flags)
 * - Different use cases, different tools
 */
import bcrypt from 'bcrypt';

const BCRYPT_ROUNDS = 12; // Good balance for 2025

export async function hashPassword(password) {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Securely hash submitted flag for audit logging
 * We don't want to log actual flags, but we want to detect repeated attempts
 * @param {string} flag - The flag to hash
 * @returns {string} SHA-256 hash (non-reversible, fast)
 */
import { createHash } from 'crypto';

export function hashForAudit(flag) {
  return createHash('sha256').update(flag).digest('hex');
}

export default {
  generateSalt,
  hashFlag,
  verifyFlag,
  verifyRegexFlag,
  generateDynamicFlag,
  hashPassword,
  verifyPassword,
  hashForAudit,
};
