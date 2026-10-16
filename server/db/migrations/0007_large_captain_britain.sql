CREATE TABLE `item_summaries` (
	`edition` text NOT NULL,
	`locale` text NOT NULL,
	`item_id` text NOT NULL,
	`source_hash` text NOT NULL,
	`effects` text NOT NULL,
	`evidence` text NOT NULL,
	`model` text NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`edition`, `locale`, `item_id`)
);
