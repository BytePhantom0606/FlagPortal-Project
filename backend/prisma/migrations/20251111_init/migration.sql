-- CreateEnum
CREATE TABLE IF NOT EXISTS `users` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    `country` VARCHAR(191) NULL,
    `bio` TEXT NULL,
    `avatar` VARCHAR(191) NULL,
    `twoFactorEnabled` BOOLEAN NOT NULL DEFAULT false,
    `twoFactorSecret` VARCHAR(191) NULL,
    `lastLogin` DATETIME(3) NULL,
    `ipAddress` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isVerified` BOOLEAN NOT NULL DEFAULT false,
    `verificationToken` VARCHAR(191) NULL,
    `resetToken` VARCHAR(191) NULL,
    `resetTokenExpiry` DATETIME(3) NULL,
    `forcePasswordChange` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_username_key`(`username`),
    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `users_email_idx`(`email`),
    INDEX `users_username_idx`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `ctfs` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `status` ENUM('DRAFT', 'UPCOMING', 'ACTIVE', 'ENDED') NOT NULL DEFAULT 'DRAFT',
    `startTime` DATETIME(3) NOT NULL,
    `endTime` DATETIME(3) NOT NULL,
    `isPublic` BOOLEAN NOT NULL DEFAULT true,
    `maxTeamSize` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ctfs_status_idx`(`status`),
    INDEX `ctfs_startTime_endTime_idx`(`startTime`, `endTime`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `challenges` (
    `id` VARCHAR(191) NOT NULL,
    `ctfId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `category` ENUM('WEB', 'PWN', 'CRYPTO', 'REVERSE', 'FORENSICS', 'MISC', 'OSINT', 'HARDWARE') NOT NULL,
    `difficulty` ENUM('EASY', 'MEDIUM', 'HARD', 'INSANE') NOT NULL,
    `points` INTEGER NOT NULL,
    `author` VARCHAR(191) NULL,
    `connection` VARCHAR(191) NULL,
    `isVisible` BOOLEAN NOT NULL DEFAULT true,
    `isSolved` BOOLEAN NOT NULL DEFAULT false,
    `solveCount` INTEGER NOT NULL DEFAULT 0,
    `isDynamic` BOOLEAN NOT NULL DEFAULT false,
    `minPoints` INTEGER NULL,
    `maxPoints` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `challenges_ctfId_idx`(`ctfId`),
    INDEX `challenges_category_idx`(`category`),
    INDEX `challenges_isVisible_idx`(`isVisible`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `flags` (
    `id` VARCHAR(191) NOT NULL,
    `challengeId` VARCHAR(191) NOT NULL,
    `flagHash` TEXT NOT NULL,
    `salt` TEXT NOT NULL,
    `type` ENUM('STATIC', 'DYNAMIC', 'REGEX') NOT NULL DEFAULT 'STATIC',
    `caseSensitive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `flags_challengeId_idx`(`challengeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `submissions` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `challengeId` VARCHAR(191) NOT NULL,
    `flagId` VARCHAR(191) NULL,
    `attemptHash` TEXT NULL,
    `status` ENUM('CORRECT', 'INCORRECT', 'INVALID', 'RATE_LIMITED') NOT NULL,
    `isFirstBlood` BOOLEAN NOT NULL DEFAULT false,
    `pointsAwarded` INTEGER NOT NULL DEFAULT 0,
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` TEXT NULL,
    `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `submissions_userId_idx`(`userId`),
    INDEX `submissions_challengeId_idx`(`challengeId`),
    INDEX `submissions_status_idx`(`status`),
    INDEX `submissions_submittedAt_idx`(`submittedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `attachments` (
    `id` VARCHAR(191) NOT NULL,
    `challengeId` VARCHAR(191) NOT NULL,
    `filename` VARCHAR(191) NOT NULL,
    `originalName` VARCHAR(191) NOT NULL,
    `filepath` VARCHAR(191) NOT NULL,
    `filesize` INTEGER NOT NULL,
    `mimetype` VARCHAR(191) NOT NULL,
    `sha256Hash` VARCHAR(191) NOT NULL,
    `isPublic` BOOLEAN NOT NULL DEFAULT true,
    `downloadCount` INTEGER NOT NULL DEFAULT 0,
    `uploadedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `attachments_challengeId_idx`(`challengeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `hints` (
    `id` VARCHAR(191) NOT NULL,
    `challengeId` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `cost` INTEGER NOT NULL DEFAULT 0,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `hints_challengeId_idx`(`challengeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `rate_limits` (
    `id` VARCHAR(191) NOT NULL,
    `identifier` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `windowStart` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `rate_limits_windowStart_idx`(`windowStart`),
    UNIQUE INDEX `rate_limits_identifier_action_key`(`identifier`, `action`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `audit_logs` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `action` ENUM('LOGIN', 'LOGOUT', 'REGISTER', 'PASSWORD_CHANGE', 'PASSWORD_RESET', 'TWO_FACTOR_ENABLE', 'TWO_FACTOR_DISABLE', 'CHALLENGE_CREATE', 'CHALLENGE_UPDATE', 'CHALLENGE_DELETE', 'CHALLENGE_VIEW', 'FLAG_SUBMIT_SUCCESS', 'FLAG_SUBMIT_FAIL', 'FIRST_BLOOD', 'USER_CREATE', 'USER_UPDATE', 'USER_DELETE', 'USER_BAN', 'USER_UNBAN', 'CTF_CREATE', 'CTF_UPDATE', 'CTF_DELETE', 'MAINTENANCE_TOGGLE', 'FILE_UPLOAD', 'FILE_DELETE') NOT NULL,
    `resource` VARCHAR(191) NULL,
    `description` TEXT NOT NULL,
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` TEXT NULL,
    `metadata` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `audit_logs_userId_idx`(`userId`),
    INDEX `audit_logs_action_idx`(`action`),
    INDEX `audit_logs_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `announcements` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `type` ENUM('INFO', 'WARNING', 'SUCCESS', 'ERROR') NOT NULL DEFAULT 'INFO',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isPinned` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `expiresAt` DATETIME(3) NULL,

    INDEX `announcements_isActive_isPinned_idx`(`isActive`, `isPinned`),
    INDEX `announcements_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `system_config` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `value` TEXT NOT NULL,
    `description` TEXT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `system_config_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `challenges` ADD CONSTRAINT `challenges_ctfId_fkey` FOREIGN KEY (`ctfId`) REFERENCES `ctfs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `flags` ADD CONSTRAINT `flags_challengeId_fkey` FOREIGN KEY (`challengeId`) REFERENCES `challenges`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `submissions` ADD CONSTRAINT `submissions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `submissions` ADD CONSTRAINT `submissions_challengeId_fkey` FOREIGN KEY (`challengeId`) REFERENCES `challenges`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `submissions` ADD CONSTRAINT `submissions_flagId_fkey` FOREIGN KEY (`flagId`) REFERENCES `flags`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attachments` ADD CONSTRAINT `attachments_challengeId_fkey` FOREIGN KEY (`challengeId`) REFERENCES `challenges`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hints` ADD CONSTRAINT `hints_challengeId_fkey` FOREIGN KEY (`challengeId`) REFERENCES `challenges`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
