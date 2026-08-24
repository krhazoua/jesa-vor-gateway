CREATE TABLE `reconciliationRuns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`actorId` int NOT NULL,
	`recordType` enum('EQUIPMENT','VARIABLE') NOT NULL,
	`authoritySourceRef` varchar(160) NOT NULL,
	`filename` varchar(255) NOT NULL,
	`storageKey` varchar(512) NOT NULL,
	`storageUrl` varchar(600) NOT NULL,
	`rowCount` int NOT NULL,
	`matchedCount` int NOT NULL DEFAULT 0,
	`addedCount` int NOT NULL DEFAULT 0,
	`changedCount` int NOT NULL DEFAULT 0,
	`removedCount` int NOT NULL DEFAULT 0,
	`status` enum('MATCHED','MISMATCH','BLOCKED') NOT NULL,
	`fatSatGate` enum('BLOCKED','PENDING_EXTERNAL_SIGNOFF') NOT NULL,
	`diffSummary` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reconciliationRuns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `reconciliationRuns_actor_idx` ON `reconciliationRuns` (`actorId`);--> statement-breakpoint
CREATE INDEX `reconciliationRuns_created_idx` ON `reconciliationRuns` (`createdAt`);