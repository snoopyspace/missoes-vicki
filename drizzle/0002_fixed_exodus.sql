CREATE TABLE `comboStreak` (
	`id` int AUTO_INCREMENT NOT NULL,
	`currentStreak` int NOT NULL DEFAULT 0,
	`maxStreak` int NOT NULL DEFAULT 0,
	`multiplier` decimal(3,1) NOT NULL DEFAULT '1.0',
	`lastTaskDate` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `comboStreak_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pushNotifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`isEnabled` boolean NOT NULL DEFAULT true,
	`reminderTime` varchar(5) NOT NULL DEFAULT '09:00',
	`lastReminderSent` timestamp,
	`subscriptionEndpoint` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pushNotifications_id` PRIMARY KEY(`id`)
);
