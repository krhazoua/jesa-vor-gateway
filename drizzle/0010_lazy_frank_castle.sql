ALTER TABLE `notifications` MODIFY COLUMN `type` enum('STATE_CHANGED','APPROVAL_REQUIRED','CERTIFICATE_EXPIRY') NOT NULL;--> statement-breakpoint
ALTER TABLE `notifications` ADD `dedupeKey` varchar(180);--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_recipient_dedupe_idx` UNIQUE(`recipientId`,`dedupeKey`);