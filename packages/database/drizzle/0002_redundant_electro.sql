DO $$ BEGIN
 CREATE TYPE "public"."script_type" AS ENUM('text', 'json');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TYPE "file_type" ADD VALUE 'script';--> statement-breakpoint
ALTER TABLE "attachments" ALTER COLUMN "file_url" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "attachments" ADD COLUMN "script" text NOT NULL;--> statement-breakpoint
ALTER TABLE "attachments" ADD COLUMN "script_type" "script_type" DEFAULT 'text';