CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`recipientId` int NOT NULL,
	`requestId` int,
	`type` enum('STATE_CHANGED','APPROVAL_REQUIRED') NOT NULL,
	`severity` enum('INFO','WARNING','CRITICAL') NOT NULL DEFAULT 'INFO',
	`title` varchar(180) NOT NULL,
	`message` text NOT NULL,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `notifications_recipient_idx` ON `notifications` (`recipientId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `notifications_unread_idx` ON `notifications` (`recipientId`,`readAt`);