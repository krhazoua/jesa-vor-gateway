CREATE TABLE `authoritativeMasterGates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reconciliationRunId` int NOT NULL,
	`activatedBy` int NOT NULL,
	`authoritySourceRef` varchar(160) NOT NULL,
	`status` enum('DISABLED','ARMED_FOR_FAT_SAT') NOT NULL,
	`activatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `authoritativeMasterGates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reconciliationDiffs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reconciliationRunId` int NOT NULL,
	`sequence` int NOT NULL,
	`tag` varchar(160) NOT NULL,
	`kind` varchar(32) NOT NULL,
	`details` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reconciliationDiffs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reconciliationSignoffs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reconciliationRunId` int NOT NULL,
	`actorId` int NOT NULL,
	`actorRole` varchar(32) NOT NULL,
	`certificateSubject` varchar(255) NOT NULL,
	`certificateFingerprint` varchar(128) NOT NULL,
	`certificateStorageKey` varchar(512) NOT NULL,
	`certificateStorageUrl` varchar(600) NOT NULL,
	`referenceId` varchar(180) NOT NULL,
	`referenceStorageKey` varchar(512) NOT NULL,
	`referenceStorageUrl` varchar(600) NOT NULL,
	`decision` enum('APPROVED','REJECTED') NOT NULL,
	`comment` text,
	`signedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reconciliationSignoffs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `authoritativeMasterGates_status_idx` ON `authoritativeMasterGates` (`status`);--> statement-breakpoint
CREATE INDEX `authoritativeMasterGates_created_idx` ON `authoritativeMasterGates` (`activatedAt`);--> statement-breakpoint
CREATE INDEX `reconciliationDiffs_run_idx` ON `reconciliationDiffs` (`reconciliationRunId`,`sequence`);--> statement-breakpoint
CREATE INDEX `reconciliationSignoffs_run_idx` ON `reconciliationSignoffs` (`reconciliationRunId`);--> statement-breakpoint
CREATE INDEX `reconciliationSignoffs_actor_idx` ON `reconciliationSignoffs` (`actorId`);