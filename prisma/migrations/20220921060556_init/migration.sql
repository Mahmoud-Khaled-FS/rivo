-- DropForeignKey
ALTER TABLE `comment` DROP FOREIGN KEY `comment_authorId_fkey`;

-- DropForeignKey
ALTER TABLE `like` DROP FOREIGN KEY `like_userId_fkey`;

-- DropForeignKey
ALTER TABLE `user_follows` DROP FOREIGN KEY `user_follows_targetId_fkey`;

-- DropForeignKey
ALTER TABLE `user_follows` DROP FOREIGN KEY `user_follows_userId_fkey`;

-- DropForeignKey
ALTER TABLE `video` DROP FOREIGN KEY `video_createUserId_fkey`;

-- AddForeignKey
ALTER TABLE `user_follows` ADD CONSTRAINT `user_follows_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_follows` ADD CONSTRAINT `user_follows_targetId_fkey` FOREIGN KEY (`targetId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `video` ADD CONSTRAINT `video_createUserId_fkey` FOREIGN KEY (`createUserId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comment` ADD CONSTRAINT `comment_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `like` ADD CONSTRAINT `like_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
