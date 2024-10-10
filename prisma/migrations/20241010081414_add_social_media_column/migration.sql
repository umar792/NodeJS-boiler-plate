-- AlterTable
ALTER TABLE `user` ADD COLUMN `signupType` VARCHAR(191) NOT NULL DEFAULT 'credentials',
    ADD COLUMN `social_id` VARCHAR(191) NULL,
    MODIFY `password` VARCHAR(191) NULL;
