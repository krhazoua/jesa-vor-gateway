CREATE TABLE `approvals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requestId` int NOT NULL,
	`requesterId` int NOT NULL,
	`approverId` int,
	`decision` enum('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
	`comment` text,
	`decidedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `approvals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `auditEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requestId` int,
	`actorId` int NOT NULL,
	`actorRole` varchar(32) NOT NULL,
	`action` varchar(100) NOT NULL,
	`previousState` varchar(32),
	`newState` varchar(32),
	`result` varchar(32) NOT NULL,
	`reason` text,
	`module` varchar(32) NOT NULL,
	`certificateSubject` varchar(255),
	`sourceIp` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `equipment` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tag` varchar(64) NOT NULL,
	`name` varchar(160) NOT NULL,
	`processArea` varchar(120) NOT NULL,
	`sourceRef` varchar(160) NOT NULL,
	CONSTRAINT `equipment_id` PRIMARY KEY(`id`),
	CONSTRAINT `equipment_tag_unique` UNIQUE(`tag`)
);
--> statement-breakpoint
CREATE TABLE `processSnapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`equipmentId` int NOT NULL,
	`variableId` int NOT NULL,
	`pv` decimal(16,4) NOT NULL,
	`interlockActive` int NOT NULL DEFAULT 0,
	`capturedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `processSnapshots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `requestHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requestId` int NOT NULL,
	`actorId` int NOT NULL,
	`fromStatus` enum('ACCEPTED','REJECTED','PENDING_OPERATOR','DUPLICATED','EXPIRED'),
	`toStatus` enum('ACCEPTED','REJECTED','PENDING_OPERATOR','DUPLICATED','EXPIRED') NOT NULL,
	`reason` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `requestHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('operator','supervisor','engineer','admin') NOT NULL DEFAULT 'operator',
	`active` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
CREATE TABLE `validationChecks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requestId` int NOT NULL,
	`sequence` int NOT NULL,
	`checkType` enum('EQUIPMENT_CHECK','SIGNATURE_CHECK','UNIT_CHECK','DUPLICATE_CHECK','TTL_CHECK','RANGE_CHECK','SIL_CHECK','ROC_CHECK','INTERLOCK_CHECK') NOT NULL,
	`result` enum('PASS','FAIL','WARNING','NOT_EXECUTED','REQUIRES_APPROVAL') NOT NULL,
	`ruleId` varchar(80) NOT NULL,
	`actualValue` varchar(255),
	`expectedValue` varchar(255),
	`explanation` text,
	`executedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `validationChecks_id` PRIMARY KEY(`id`),
	CONSTRAINT `validationChecks_request_seq_idx` UNIQUE(`requestId`,`sequence`)
);
--> statement-breakpoint
CREATE TABLE `variables` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tag` varchar(64) NOT NULL,
	`name` varchar(160) NOT NULL,
	`variableType` enum('PV','SP','MV','CV','DV') NOT NULL,
	`unit` varchar(32) NOT NULL,
	`hardLow` decimal(16,4),
	`hardHigh` decimal(16,4),
	`warningLow` decimal(16,4),
	`warningHigh` decimal(16,4),
	`criticalLow` decimal(16,4),
	`criticalHigh` decimal(16,4),
	`silClass` enum('SIL-0','SIL-1','SIL-2','SIL-3') NOT NULL,
	`dcsMapping` varchar(180) NOT NULL,
	`sourceRef` varchar(160) NOT NULL,
	CONSTRAINT `variables_id` PRIMARY KEY(`id`),
	CONSTRAINT `variables_tag_unique` UNIQUE(`tag`)
);
--> statement-breakpoint
CREATE TABLE `vorRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requestId` varchar(64) NOT NULL,
	`sourceUc` varchar(16) NOT NULL,
	`sourceIdentity` varchar(160) NOT NULL,
	`equipmentId` int NOT NULL,
	`variableId` int NOT NULL,
	`requesterId` int NOT NULL,
	`currentPv` decimal(16,4) NOT NULL,
	`requestedSp` decimal(16,4) NOT NULL,
	`priority` enum('LOW','NORMAL','HIGH','CRITICAL') NOT NULL DEFAULT 'NORMAL',
	`ttlSeconds` int NOT NULL,
	`certificateSubject` varchar(255) NOT NULL,
	`status` enum('ACCEPTED','REJECTED','PENDING_OPERATOR','DUPLICATED','EXPIRED') NOT NULL DEFAULT 'PENDING_OPERATOR',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vorRequests_id` PRIMARY KEY(`id`),
	CONSTRAINT `vorRequests_requestId_unique` UNIQUE(`requestId`),
	CONSTRAINT `vorRequests_requestId_idx` UNIQUE(`requestId`)
);
--> statement-breakpoint
CREATE INDEX `approvals_request_idx` ON `approvals` (`requestId`);--> statement-breakpoint
CREATE INDEX `approvals_decision_idx` ON `approvals` (`decision`);--> statement-breakpoint
CREATE INDEX `auditEvents_request_idx` ON `auditEvents` (`requestId`);--> statement-breakpoint
CREATE INDEX `auditEvents_created_idx` ON `auditEvents` (`createdAt`);--> statement-breakpoint
CREATE INDEX `requestHistory_request_idx` ON `requestHistory` (`requestId`);--> statement-breakpoint
CREATE INDEX `vorRequests_requester_idx` ON `vorRequests` (`requesterId`);--> statement-breakpoint
CREATE INDEX `vorRequests_status_idx` ON `vorRequests` (`status`);