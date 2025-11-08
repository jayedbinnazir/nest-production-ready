import { MigrationInterface, QueryRunner } from 'typeorm';

export class RetailerSchema1720460400000 implements MigrationInterface {
  name = 'RetailerSchema1720460400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TABLE "role" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "name" character varying(20) NOT NULL,
        "description" character varying(100) NOT NULL,
        CONSTRAINT "PK_role_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_ROLE_NAME" UNIQUE ("name")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_ROLE_NAME" ON "role" ("name")`);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "name" character varying(30) NOT NULL,
        "email" character varying(30) NOT NULL,
        "password" character varying(100),
        "phone" character varying(20),
        "address" character varying(500),
        "google_picture" character varying(50),
        "provider" character varying(50),
        "providerId" character varying(50),
        "emailVerified" boolean DEFAULT false,
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_USERS_EMAIL" ON "users" ("email")`);

    await queryRunner.query(`
      CREATE TABLE "app_users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "user_id" uuid NOT NULL,
        "role_id" uuid,
        CONSTRAINT "PK_app_users_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_app_users_user_role" UNIQUE ("user_id","role_id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_APP_USERS_USER" ON "app_users" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_APP_USERS_ROLE" ON "app_users" ("role_id")`);

    await queryRunner.query(`
      CREATE TABLE "files" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "originalName" character varying NOT NULL,
        "fileName" character varying NOT NULL,
        "path" character varying NOT NULL,
        "mimetype" character varying NOT NULL,
        "size" bigint NOT NULL,
        "user_id" uuid,
        CONSTRAINT "PK_files_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "regions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "name" character varying(120) NOT NULL,
        CONSTRAINT "PK_regions_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_REGION_NAME" UNIQUE ("name")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_REGION_NAME" ON "regions" ("name")`);

    await queryRunner.query(`
      CREATE TABLE "areas" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "name" character varying(120) NOT NULL,
        "region_id" uuid NOT NULL,
        CONSTRAINT "PK_areas_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_AREA_REGION_NAME" UNIQUE ("name","region_id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_AREA_NAME" ON "areas" ("name")`);
    await queryRunner.query(`CREATE INDEX "IDX_AREA_REGION" ON "areas" ("region_id")`);

    await queryRunner.query(`
      CREATE TABLE "distributors" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "name" character varying(150) NOT NULL,
        CONSTRAINT "PK_distributors_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_DISTRIBUTOR_NAME" UNIQUE ("name")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_DISTRIBUTOR_NAME" ON "distributors" ("name")`);

    await queryRunner.query(`
      CREATE TABLE "territories" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "name" character varying(150) NOT NULL,
        "area_id" uuid NOT NULL,
        CONSTRAINT "PK_territories_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_TERRITORY_AREA_NAME" UNIQUE ("name","area_id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_TERRITORY_NAME" ON "territories" ("name")`);
    await queryRunner.query(`CREATE INDEX "IDX_TERRITORY_AREA" ON "territories" ("area_id")`);

    await queryRunner.query(`
      CREATE TABLE "retailers" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "uid" character varying(50) NOT NULL,
        "name" character varying(180) NOT NULL,
        "phone" character varying(20),
        "region_id" uuid,
        "area_id" uuid,
        "distributor_id" uuid,
        "territory_id" uuid,
        "points" integer NOT NULL DEFAULT 0,
        "routes" character varying(255),
        "notes" text,
        CONSTRAINT "PK_retailers_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_RETAILER_UID" UNIQUE ("uid"),
        CONSTRAINT "CHK_RETAILER_POINTS" CHECK ("points" >= 0)
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_RETAILER_UID" ON "retailers" ("uid")`);
    await queryRunner.query(`CREATE INDEX "IDX_RETAILER_NAME" ON "retailers" ("name")`);
    await queryRunner.query(`CREATE INDEX "IDX_RETAILER_PHONE" ON "retailers" ("phone")`);
    await queryRunner.query(`CREATE INDEX "IDX_RETAILER_REGION" ON "retailers" ("region_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_RETAILER_AREA" ON "retailers" ("area_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_RETAILER_DISTRIBUTOR" ON "retailers" ("distributor_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_RETAILER_TERRITORY" ON "retailers" ("territory_id")`);

    await queryRunner.query(`
      CREATE TABLE "sales_reps" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "username" character varying(60) NOT NULL,
        "name" character varying(150) NOT NULL,
        "phone" character varying(20),
        "password_hash" character varying(255) NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "last_login_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_sales_reps_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_SALES_REP_USERNAME" UNIQUE ("username")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_SALES_REP_USERNAME" ON "sales_reps" ("username")`);
    await queryRunner.query(`CREATE INDEX "IDX_SALES_REP_PHONE" ON "sales_reps" ("phone")`);

    await queryRunner.query(`
      CREATE TABLE "sales_rep_retailers" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "sales_rep_id" uuid NOT NULL,
        "retailer_id" uuid NOT NULL,
        "assigned_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "assigned_by" uuid,
        CONSTRAINT "PK_sales_rep_retailers_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_SALES_REP_RETAILER" UNIQUE ("sales_rep_id","retailer_id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_SRR_SALES_REP" ON "sales_rep_retailers" ("sales_rep_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_SRR_RETAILER" ON "sales_rep_retailers" ("retailer_id")`);

    await queryRunner.query(`
      ALTER TABLE "app_users"
      ADD CONSTRAINT "FK_app_users_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "app_users"
      ADD CONSTRAINT "FK_app_users_role" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "files"
      ADD CONSTRAINT "FK_files_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "areas"
      ADD CONSTRAINT "FK_areas_region" FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "territories"
      ADD CONSTRAINT "FK_territories_area" FOREIGN KEY ("area_id") REFERENCES "areas"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "retailers"
      ADD CONSTRAINT "FK_retailers_region" FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "retailers"
      ADD CONSTRAINT "FK_retailers_area" FOREIGN KEY ("area_id") REFERENCES "areas"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "retailers"
      ADD CONSTRAINT "FK_retailers_distributor" FOREIGN KEY ("distributor_id") REFERENCES "distributors"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "retailers"
      ADD CONSTRAINT "FK_retailers_territory" FOREIGN KEY ("territory_id") REFERENCES "territories"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "sales_rep_retailers"
      ADD CONSTRAINT "FK_srr_sales_rep" FOREIGN KEY ("sales_rep_id") REFERENCES "sales_reps"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "sales_rep_retailers"
      ADD CONSTRAINT "FK_srr_retailer" FOREIGN KEY ("retailer_id") REFERENCES "retailers"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "sales_rep_retailers" DROP CONSTRAINT "FK_srr_retailer"`);
    await queryRunner.query(`ALTER TABLE "sales_rep_retailers" DROP CONSTRAINT "FK_srr_sales_rep"`);
    await queryRunner.query(`ALTER TABLE "retailers" DROP CONSTRAINT "FK_retailers_territory"`);
    await queryRunner.query(`ALTER TABLE "retailers" DROP CONSTRAINT "FK_retailers_distributor"`);
    await queryRunner.query(`ALTER TABLE "retailers" DROP CONSTRAINT "FK_retailers_area"`);
    await queryRunner.query(`ALTER TABLE "retailers" DROP CONSTRAINT "FK_retailers_region"`);
    await queryRunner.query(`ALTER TABLE "territories" DROP CONSTRAINT "FK_territories_area"`);
    await queryRunner.query(`ALTER TABLE "areas" DROP CONSTRAINT "FK_areas_region"`);
    await queryRunner.query(`ALTER TABLE "files" DROP CONSTRAINT "FK_files_user"`);
    await queryRunner.query(`ALTER TABLE "app_users" DROP CONSTRAINT "FK_app_users_role"`);
    await queryRunner.query(`ALTER TABLE "app_users" DROP CONSTRAINT "FK_app_users_user"`);

    await queryRunner.query(`DROP INDEX "IDX_SRR_RETAILER"`);
    await queryRunner.query(`DROP INDEX "IDX_SRR_SALES_REP"`);
    await queryRunner.query(`DROP TABLE "sales_rep_retailers"`);

    await queryRunner.query(`DROP INDEX "IDX_SALES_REP_PHONE"`);
    await queryRunner.query(`DROP INDEX "IDX_SALES_REP_USERNAME"`);
    await queryRunner.query(`DROP TABLE "sales_reps"`);

    await queryRunner.query(`DROP INDEX "IDX_RETAILER_TERRITORY"`);
    await queryRunner.query(`DROP INDEX "IDX_RETAILER_DISTRIBUTOR"`);
    await queryRunner.query(`DROP INDEX "IDX_RETAILER_AREA"`);
    await queryRunner.query(`DROP INDEX "IDX_RETAILER_REGION"`);
    await queryRunner.query(`DROP INDEX "IDX_RETAILER_PHONE"`);
    await queryRunner.query(`DROP INDEX "IDX_RETAILER_NAME"`);
    await queryRunner.query(`DROP INDEX "IDX_RETAILER_UID"`);
    await queryRunner.query(`DROP TABLE "retailers"`);

    await queryRunner.query(`DROP INDEX "IDX_TERRITORY_AREA"`);
    await queryRunner.query(`DROP INDEX "IDX_TERRITORY_NAME"`);
    await queryRunner.query(`DROP TABLE "territories"`);

    await queryRunner.query(`DROP INDEX "IDX_DISTRIBUTOR_NAME"`);
    await queryRunner.query(`DROP TABLE "distributors"`);

    await queryRunner.query(`DROP INDEX "IDX_AREA_REGION"`);
    await queryRunner.query(`DROP INDEX "IDX_AREA_NAME"`);
    await queryRunner.query(`DROP TABLE "areas"`);

    await queryRunner.query(`DROP INDEX "IDX_REGION_NAME"`);
    await queryRunner.query(`DROP TABLE "regions"`);

    await queryRunner.query(`DROP TABLE "files"`);

    await queryRunner.query(`DROP INDEX "IDX_APP_USERS_ROLE"`);
    await queryRunner.query(`DROP INDEX "IDX_APP_USERS_USER"`);
    await queryRunner.query(`DROP TABLE "app_users"`);

    await queryRunner.query(`DROP INDEX "IDX_USERS_EMAIL"`);
    await queryRunner.query(`DROP TABLE "users"`);

    await queryRunner.query(`DROP INDEX "IDX_ROLE_NAME"`);
    await queryRunner.query(`DROP TABLE "role"`);
  }
}

