CREATE TABLE `medalHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`medalId` int NOT NULL,
	`medalName` varchar(255) NOT NULL,
	`unlockedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `medalHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `medals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`icon` varchar(255) NOT NULL,
	`condition` varchar(255) NOT NULL,
	`unlockedAt` timestamp,
	`isUnlocked` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `medals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `parentSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`parentPassword` varchar(255) NOT NULL,
	`isAuthenticated` boolean DEFAULT false,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `parentSettings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pointsSystem` (
	`id` int AUTO_INCREMENT NOT NULL,
	`totalPoints` int NOT NULL DEFAULT 0,
	`dailyPoints` int NOT NULL DEFAULT 0,
	`weeklyPoints` int NOT NULL DEFAULT 0,
	`monthlyPoints` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pointsSystem_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `taskHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`taskId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`pointsEarned` int NOT NULL,
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	`category` enum('daily','weekly','monthly') NOT NULL,
	CONSTRAINT `taskHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`category` enum('daily','weekly','monthly') NOT NULL,
	`points` int NOT NULL DEFAULT 10,
	`priority` enum('low','medium','high') DEFAULT 'medium',
	`dueDate` timestamp,
	`completed` boolean DEFAULT false,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `treasureProgress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`currentStep` int NOT NULL DEFAULT 0,
	`totalSteps` int NOT NULL DEFAULT 100,
	`percentage` decimal(5,2) NOT NULL DEFAULT '0',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `treasureProgress_id` PRIMARY KEY(`id`)
);
