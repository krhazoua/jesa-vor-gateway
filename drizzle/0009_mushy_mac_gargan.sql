CREATE TABLE `certificateTrustAnchorRetirements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`anchorId` int NOT NULL,
	`replacementAnchorId` int NOT NULL,
	`action` enum('REVOKED','RETIRED') NOT NULL,
	`referenceId` varchar(180) NOT NULL,
	`referenceStorageKey` varchar(512) NOT NULL,
	`referenceStorageUrl` varchar(600) NOT NULL,
	`reason` varchar(500) NOT NULL,
	`actorId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `certificateTrustAnchorRetirements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `certificateTrustAnchors` MODIFY COLUMN `status` enum('ACTIVE','REVOKED','RETIRED') NOT NULL;--> statement-breakpoint
CREATE INDEX `certificateTrustAnchorRetirements_anchor_idx` ON `certificateTrustAnchorRetirements` (`anchorId`);--> statement-breakpoint
CREATE INDEX `certificateTrustAnchorRetirements_created_idx` ON `certificateTrustAnchorRetirements` (`createdAt`);