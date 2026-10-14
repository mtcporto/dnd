CREATE TABLE `bestiary_entries` (
	`edition` text NOT NULL,
	`locale` text NOT NULL,
	`monster_index` text NOT NULL,
	`name` text NOT NULL,
	`canonical_name` text NOT NULL,
	`creature_type` text NOT NULL,
	`creature_size` text NOT NULL,
	`challenge_rating` real NOT NULL,
	`payload` text NOT NULL,
	`source_hash` text NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`edition`, `locale`, `monster_index`)
);
