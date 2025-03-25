CREATE TABLE IF NOT EXISTS "render_workflows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"flow_data" jsonb NOT NULL,
	"author_id" uuid NOT NULL,
	"public" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "render_workflows_title_unique" UNIQUE("title")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workflow_access" (
	"workflow_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"invited_by_id" uuid,
	"invite_link_id" uuid,
	"accessed_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "workflow_access_workflow_id_user_id_pk" PRIMARY KEY("workflow_id","user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workflow_invite_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workflow_id" uuid NOT NULL,
	"creator_id" uuid NOT NULL,
	"token" varchar(64) NOT NULL,
	"expires_at" timestamp,
	"max_uses" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "workflow_invite_links_token_unique" UNIQUE("token")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "render_workflows" ADD CONSTRAINT "render_workflows_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workflow_access" ADD CONSTRAINT "workflow_access_workflow_id_render_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."render_workflows"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workflow_access" ADD CONSTRAINT "workflow_access_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workflow_access" ADD CONSTRAINT "workflow_access_invited_by_id_users_id_fk" FOREIGN KEY ("invited_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workflow_access" ADD CONSTRAINT "workflow_access_invite_link_id_workflow_invite_links_id_fk" FOREIGN KEY ("invite_link_id") REFERENCES "public"."workflow_invite_links"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workflow_invite_links" ADD CONSTRAINT "workflow_invite_links_workflow_id_render_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."render_workflows"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workflow_invite_links" ADD CONSTRAINT "workflow_invite_links_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
