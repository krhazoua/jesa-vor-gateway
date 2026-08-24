CREATE TABLE `adapterActivationRuns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`gateId` int NOT NULL,
	`actorId` int NOT NULL,
	`fatSatReference` varchar(180) NOT NULL,
	`checklist` text NOT NULL,
	`status` enum('READY_READ_ONLY','EXECUTED_READ_ONLY','BLOCKED') NOT NULL,
	`plantWriteEnabled` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `adapterActivationRuns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `certificateTrustAnchors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`subject` varchar(255) NOT NULL,
	`fingerprint` varchar(128) NOT NULL,
	`storageKey` varchar(512) NOT NULL,
	`storageUrl` varchar(600) NOT NULL,
	`registeredBy` int NOT NULL,
	`status` enum('ACTIVE','REVOKED') NOT NULL,
	`registeredAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `certificateTrustAnchors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `reconciliationSignoffs` ADD `chainStatus` enum('VALID','INVALID','TRUST_STORE_MISSING') NOT NULL DEFAULT 'TRUST_STORE_MISSING';--> statement-breakpoint
CREATE INDEX `adapterActivationRuns_gate_idx` ON `adapterActivationRuns` (`gateId`);--> statement-breakpoint
CREATE INDEX `adapterActivationRuns_created_idx` ON `adapterActivationRuns` (`createdAt`);--> statement-breakpoint
CREATE INDEX `certificateTrustAnchors_fingerprint_idx` ON `certificateTrustAnchors` (`fingerprint`);--> statement-breakpoint
CREATE INDEX `certificateTrustAnchors_status_idx` ON `certificateTrustAnchors` (`status`);