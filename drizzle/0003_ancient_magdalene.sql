CREATE TABLE `catalogImports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`actorId` int NOT NULL,
	`recordType` enum('EQUIPMENT','VARIABLE') NOT NULL,
	`filename` varchar(255) NOT NULL,
	`storageKey` varchar(512) NOT NULL,
	`storageUrl` varchar(600) NOT NULL,
	`rowCount` int NOT NULL,
	`createdCount` int NOT NULL DEFAULT 0,
	`updatedCount` int NOT NULL DEFAULT 0,
	`rejectedCount` int NOT NULL DEFAULT 0,
	`status` enum('COMPLETED','REJECTED','PARTIAL') NOT NULL,
	`errorSummary` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `catalogImports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `catalogImports_actor_idx` ON `catalogImports` (`actorId`);--> statement-breakpoint
CREATE INDEX `catalogImports_created_idx` ON `catalogImports` (`createdAt`);