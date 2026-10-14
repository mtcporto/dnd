CREATE TABLE `image_assets` (
	`source_path` text PRIMARY KEY NOT NULL,
	`source_url` text NOT NULL,
	`object_key` text NOT NULL,
	`public_url` text NOT NULL,
	`sha256` text NOT NULL,
	`width` integer NOT NULL,
	`height` integer NOT NULL,
	`original_bytes` integer NOT NULL,
	`webp_bytes` integer NOT NULL,
	`updated_at` integer NOT NULL
);
