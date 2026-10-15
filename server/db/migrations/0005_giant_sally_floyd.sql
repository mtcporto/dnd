CREATE TABLE `character_inventories` (
	`character_id` text PRIMARY KEY NOT NULL,
	`state` text NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`character_id`) REFERENCES `characters`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `item_catalogues` (
	`edition` text NOT NULL,
	`locale` text NOT NULL,
	`payload` text NOT NULL,
	`source_hash` text NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`edition`, `locale`)
);
