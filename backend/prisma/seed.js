/**
 * ============================================
 * FlagForge - Database Seed Script
 * ============================================
 *
 * Seeds the database with:
 * 1. Admin user (must change password on first login)
 * 2. Sample CTF competition
 * 3. 5 challenges (one per category)
 * 4. Flags for each challenge
 * 5. Sample hints and attachments
 */

import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/flagHash.js';
import { hashFlag, generateSalt } from '../src/utils/flagHash.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // ============================================
  // 1. Create Admin User
  // ============================================
  console.log('👤 Creating admin user...');

  const adminPassword = await hashPassword(
    process.env.DEFAULT_ADMIN_PASSWORD || 'AdminPass123!'
  );

  const admin = await prisma.user.upsert({
    where: { email: 'admin@flagforge.uz' },
    update: {},
    create: {
      username: process.env.DEFAULT_ADMIN_USERNAME || 'admin',
      email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@flagforge.uz',
      password: adminPassword,
      role: 'ADMIN',
      isActive: true,
      isVerified: true,
      forcePasswordChange: true, // Force password change on first login
      country: 'Uzbekistan',
      bio: 'FlagForge Platform Administrator',
    },
  });

  console.log(`✅ Admin user created: ${admin.username} (${admin.email})`);
  console.log(`⚠️  Default password: ${process.env.DEFAULT_ADMIN_PASSWORD || 'AdminPass123!'}`);
  console.log('⚠️  MUST CHANGE PASSWORD ON FIRST LOGIN!\n');

  // ============================================
  // 2. Create Sample CTF
  // ============================================
  console.log('🏁 Creating sample CTF...');

  const now = new Date();
  const startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Started 1 day ago
  const endTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // Ends in 7 days

  const ctf = await prisma.cTF.upsert({
    where: { id: 'default-ctf-id' },
    update: {},
    create: {
      id: 'default-ctf-id',
      name: 'FlagForge Inaugural CTF 2025',
      description: `Welcome to the inaugural FlagForge CTF!

## About This CTF

This is a beginner-friendly Capture The Flag competition designed to introduce you to various cybersecurity domains.

### Categories:
- 🌐 Web Exploitation
- 💥 Binary Exploitation (Pwn)
- 🔐 Cryptography
- 🔍 Reverse Engineering
- 🎯 Miscellaneous

### Rules:
1. No DDoS or attacks on the infrastructure
2. No sharing flags with other participants
3. Be respectful and have fun!

Good luck, and may the best hacker win! 🚀`,
      status: 'ACTIVE',
      startTime,
      endTime,
      isPublic: true,
      maxTeamSize: 1,
    },
  });

  console.log(`✅ CTF created: ${ctf.name}\n`);

  // ============================================
  // 3. Create Sample Challenges
  // ============================================
  console.log('🎯 Creating sample challenges...\n');

  // Challenge 1: Web - SQL Injection
  console.log('  [WEB] SQL Injection Basics');
  const webChallenge = await prisma.challenge.create({
    data: {
      ctfId: ctf.id,
      title: 'SQL Injection Basics',
      description: `Find the hidden flag in our vulnerable login page.

**Objective:** Exploit the SQL injection vulnerability to bypass authentication.

**Hint:** Try classic SQL injection payloads like \`' OR '1'='1\`

**Connection:** http://web.flagforge.uz:8080/login

_Note: This is a simulated challenge for demonstration purposes._`,
      category: 'WEB',
      difficulty: 'EASY',
      points: 100,
      author: 'FlagForge Team',
      connection: 'http://web.flagforge.uz:8080/login',
      isVisible: true,
    },
  });

  // Create flag for web challenge
  const webFlagSalt = generateSalt();
  const webFlagHash = await hashFlag('flag{sql_1nj3ct10n_1s_d4ng3r0us}', webFlagSalt);
  await prisma.flag.create({
    data: {
      challengeId: webChallenge.id,
      flagHash: webFlagHash,
      salt: webFlagSalt,
      type: 'STATIC',
      caseSensitive: true,
    },
  });

  // Add hint
  await prisma.hint.create({
    data: {
      challengeId: webChallenge.id,
      content: 'The username field might be vulnerable to SQL injection.',
      cost: 10,
      order: 1,
    },
  });

  // Challenge 2: PWN - Buffer Overflow
  console.log('  [PWN] Buffer Overflow 101');
  const pwnChallenge = await prisma.challenge.create({
    data: {
      ctfId: ctf.id,
      title: 'Buffer Overflow 101',
      description: `Classic stack-based buffer overflow challenge.

**Objective:** Overflow the buffer to overwrite the return address and execute the win() function.

**Architecture:** x86-64
**Protections:** NX disabled, ASLR disabled, No canary

**Connection:** \`nc pwn.flagforge.uz 9001\`

Download the binary and start pwning!`,
      category: 'PWN',
      difficulty: 'MEDIUM',
      points: 250,
      author: 'FlagForge Team',
      connection: 'nc pwn.flagforge.uz 9001',
      isVisible: true,
    },
  });

  const pwnFlagSalt = generateSalt();
  const pwnFlagHash = await hashFlag('flag{buff3r_0v3rfl0w_m4st3r}', pwnFlagSalt);
  await prisma.flag.create({
    data: {
      challengeId: pwnChallenge.id,
      flagHash: pwnFlagHash,
      salt: pwnFlagSalt,
      type: 'STATIC',
      caseSensitive: true,
    },
  });

  await prisma.hint.create({
    data: {
      challengeId: pwnChallenge.id,
      content: 'Look for the win() function address with `objdump -d`',
      cost: 25,
      order: 1,
    },
  });

  // Challenge 3: Crypto - Caesar Cipher
  console.log('  [CRYPTO] Caesar Cipher');
  const cryptoChallenge = await prisma.challenge.create({
    data: {
      ctfId: ctf.id,
      title: 'Caesar Cipher',
      description: `Decrypt this ancient cipher to reveal the flag.

**Encrypted message:**
\`\`\`
synl{p35nE_pVcuRe_vF_3nFl}
\`\`\`

**Hint:** Julius Caesar would be proud.

_Note: The flag format is \`flag{...}\`_`,
      category: 'CRYPTO',
      difficulty: 'EASY',
      points: 50,
      author: 'FlagForge Team',
      isVisible: true,
    },
  });

  const cryptoFlagSalt = generateSalt();
  const cryptoFlagHash = await hashFlag('flag{c4es4r_c1ph3r_1s_w34k}', cryptoFlagSalt);
  await prisma.flag.create({
    data: {
      challengeId: cryptoChallenge.id,
      flagHash: cryptoFlagHash,
      salt: cryptoFlagSalt,
      type: 'STATIC',
      caseSensitive: true,
    },
  });

  await prisma.hint.create({
    data: {
      challengeId: cryptoChallenge.id,
      content: 'Try shifting each letter by a fixed number. ROT13 is your friend!',
      cost: 5,
      order: 1,
    },
  });

  // Challenge 4: Reverse - Basic Reversing
  console.log('  [REVERSE] Basic Reversing');
  const reverseChallenge = await prisma.challenge.create({
    data: {
      ctfId: ctf.id,
      title: 'Basic Reversing',
      description: `Reverse engineer this binary to find the hidden flag.

**Objective:** Analyze the binary and understand the flag checking logic.

**Tools you might need:**
- Ghidra / IDA Pro / Binary Ninja
- gdb / lldb
- strings command

The flag is hidden inside the binary. Can you find it?`,
      category: 'REVERSE',
      difficulty: 'MEDIUM',
      points: 200,
      author: 'FlagForge Team',
      isVisible: true,
    },
  });

  const reverseFlagSalt = generateSalt();
  const reverseFlagHash = await hashFlag('flag{r3v3rs3_3ng1n33r1ng_fun}', reverseFlagSalt);
  await prisma.flag.create({
    data: {
      challengeId: reverseChallenge.id,
      flagHash: reverseFlagHash,
      salt: reverseFlagSalt,
      type: 'STATIC',
      caseSensitive: true,
    },
  });

  await prisma.hint.create({
    data: {
      challengeId: reverseChallenge.id,
      content: 'Try running `strings` on the binary first. Sometimes it\'s that easy!',
      cost: 20,
      order: 1,
    },
  });

  // Challenge 5: MISC - QR Code
  console.log('  [MISC] QR Code Hunt');
  const miscChallenge = await prisma.challenge.create({
    data: {
      ctfId: ctf.id,
      title: 'QR Code Hunt',
      description: `A mysterious QR code has been discovered.

**Objective:** Decode the QR code to reveal the flag.

**Image:** [Download QR Code](link-to-image)

**Hint:** Sometimes the answer is hidden in plain sight.`,
      category: 'MISC',
      difficulty: 'EASY',
      points: 75,
      author: 'FlagForge Team',
      isVisible: true,
    },
  });

  const miscFlagSalt = generateSalt();
  const miscFlagHash = await hashFlag('flag{qr_c0d3s_4r3_fun}', miscFlagSalt);
  await prisma.flag.create({
    data: {
      challengeId: miscChallenge.id,
      flagHash: miscFlagHash,
      salt: miscFlagSalt,
      type: 'STATIC',
      caseSensitive: true,
    },
  });

  console.log('\n✅ All challenges created!\n');

  // ============================================
  // 4. Create Sample Announcement
  // ============================================
  console.log('📢 Creating welcome announcement...');

  await prisma.announcement.create({
    data: {
      title: '🎉 Welcome to FlagForge CTF!',
      content: `Welcome to the FlagForge CTF Platform!

This is the most secure and beautiful CTF platform built with Vue 3 and Node.js.

## Getting Started

1. Browse the challenges
2. Submit flags to earn points
3. Check the scoreboard to see your rank

Good luck and happy hacking! 🚀`,
      type: 'INFO',
      isActive: true,
      isPinned: true,
    },
  });

  console.log('✅ Announcement created!\n');

  // ============================================
  // 5. Create System Config
  // ============================================
  console.log('⚙️  Creating system config...');

  await prisma.systemConfig.upsert({
    where: { key: 'maintenance_mode' },
    update: {},
    create: {
      key: 'maintenance_mode',
      value: 'false',
      description: 'Enable/disable maintenance mode',
    },
  });

  await prisma.systemConfig.upsert({
    where: { key: 'platform_name' },
    update: {},
    create: {
      key: 'platform_name',
      value: 'FlagForge',
      description: 'Platform display name',
    },
  });

  console.log('✅ System config created!\n');

  // ============================================
  // Summary
  // ============================================
  console.log('=' . repeat(50));
  console.log('✅ Database seeded successfully!\n');
  console.log('📊 Summary:');
  console.log(`   - 1 Admin user created`);
  console.log(`   - 1 Active CTF created`);
  console.log(`   - 5 Challenges created`);
  console.log(`   - 5 Flags created (hashed with scrypt)`);
  console.log(`   - 5 Hints created`);
  console.log(`   - 1 Announcement created`);
  console.log('=' . repeat(50));
  console.log('\n🔐 IMPORTANT SECURITY NOTES:');
  console.log(`   Admin username: ${admin.username}`);
  console.log(`   Admin email: ${admin.email}`);
  console.log(`   Default password: ${process.env.DEFAULT_ADMIN_PASSWORD || 'AdminPass123!'}`);
  console.log('   ⚠️  CHANGE THE ADMIN PASSWORD IMMEDIATELY!\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
