CREATE TABLE `redeemHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`rewardId` int NOT NULL,
	`rewardTitle` varchar(255) NOT NULL,
	`pointsSpent` int NOT NULL,
	`redeemedAt` timestamp NOT NULL DEFAULT (now()),
	`status` enum('pending','completed','cancelled') DEFAULT 'pending',
	`redeemCode` varchar(50),
	CONSTRAINT `redeemHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rewards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`icon` varchar(255) NOT NULL,
	`category` varchar(100) NOT NULL,
	`pointsCost` int NOT NULL,
	`quantity` int DEFAULT 0,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `rewards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `weeklyChallenges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`icon` varchar(255) NOT NULL,
	`targetCount` int NOT NULL,
	`bonusMultiplier` decimal(3,1) NOT NULL DEFAULT '1.5',
	`exclusiveMedalId` int,
	`weekStartDate` timestamp NOT NULL,
	`weekEndDate` timestamp NOT NULL,
	`currentProgress` int NOT NULL DEFAULT 0,
	`isCompleted` boolean DEFAULT false,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `weeklyChallenges_id` PRIMARY KEY(`id`)
);
