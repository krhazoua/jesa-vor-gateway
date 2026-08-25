CREATE TABLE `certificateTrustAnchorRotations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`oldAnchorId` int,
	`oldFingerprint` varchar(128),
	`newAnchorId` int NOT NULL,
	`newFingerprint` varchar(128) NOT NULL,
	`referenceId` varchar(180) NOT NULL,
	`referenceStorageKey` varchar(512) NOT NULL,
	`referenceStorageUrl` varchar(600) NOT NULL,
	`reason` varchar(500) NOT NULL,
	`actorId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `certificateTrustAnchorRotations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `certificateTrustPolicies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`warningDays` int NOT NULL DEFAULT 30,
	`criticalDays` int NOT NULL DEFAULT 7,
	`updatedBy` int NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `certificateTrustPolicies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `certificateTrustAnchors` ADD `validFrom` timestamp;--> statement-breakpoint
ALTER TABLE `certificateTrustAnchors` ADD `expiresAt` timestamp;--> statement-breakpoint
CREATE INDEX `certificateTrustAnchorRotations_new_idx` ON `certificateTrustAnchorRotations` (`newAnchorId`);--> statement-breakpoint
CREATE INDEX `certificateTrustAnchorRotations_created_idx` ON `certificateTrustAnchorRotations` (`createdAt`);