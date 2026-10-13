CREATE TABLE `catalogue_snapshots` (
	`edition` text NOT NULL,
	`locale` text NOT NULL,
	`payload` text NOT NULL,
	`source_hash` text NOT NULL,
	`source_url` text NOT NULL,
	`translation_model` text,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`edition`, `locale`)
);
