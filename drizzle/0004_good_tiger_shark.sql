CREATE TABLE `vickiProfile` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL DEFAULT 'Vicki',
	`avatar` varchar(255) NOT NULL DEFAULT '👧',
	`bio` text,
	`favoriteColor` varchar(7) DEFAULT '#7c3aed',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vickiProfile_id` PRIMARY KEY(`id`)
);
