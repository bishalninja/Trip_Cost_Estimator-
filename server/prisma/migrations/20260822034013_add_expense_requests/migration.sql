-- CreateTable
CREATE TABLE `expense_requests` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `loadId` INTEGER NOT NULL,
    `lineItems` JSON NOT NULL,
    `totalFixedAmount` DOUBLE NOT NULL,
    `totalAlreadyPaid` DOUBLE NOT NULL,
    `totalRequestingAmount` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `expense_requests` ADD CONSTRAINT `expense_requests_loadId_fkey` FOREIGN KEY (`loadId`) REFERENCES `loads`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
