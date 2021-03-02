-- I add a a new fruit, a banana of the Cavendish variety
-- The Brand and supplier Chiquita source it from random farms in Ecuador and Cuba
-- They are sold at the rewe just near me in Berlin, Germany
-- They took 9000km to get here

CREATE TABLE IF NOT EXISTS "ingredient_type"
(
  "id"         integer                  GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "name"       varchar UNIQUE NOT NULL,
  "created_at" timestamp with time zone DEFAULT current_timestamp,
  "updated_at" timestamp with time zone DEFAULT current_timestamp
);

CREATE TABLE IF NOT EXISTS "country"
(
  "id"           integer                  GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "iso"          char(2)        NOT NULL,
  "iso3"         char(3)                  DEFAULT NULL,
  "calling_code" integer        NOT NULL,
  "name"         varchar UNIQUE NOT NULL,
  "created_at"   timestamp with time zone DEFAULT current_timestamp,
  "updated_at"   timestamp with time zone DEFAULT current_timestamp
);

CREATE TABLE IF NOT EXISTS "ingredient"
(
  "id"         integer                           GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "name"       varchar UNIQUE           NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT current_timestamp,
  "updated_at" timestamp with time zone NOT NULL DEFAULT current_timestamp
);

CREATE TABLE IF NOT EXISTS "ingredient__ingredient_types"
(
  "ingredient_id"      integer                  NOT NULL REFERENCES ingredient (id) ON DELETE CASCADE,
  "ingredient_type_id" integer                  NOT NULL REFERENCES ingredient_type (id) ON DELETE CASCADE,
  "created_at"         timestamp with time zone NOT NULL DEFAULT current_timestamp,
  "updated_at"         timestamp with time zone NOT NULL DEFAULT current_timestamp,
  UNIQUE (ingredient_id, ingredient_type_id)
);

CREATE TABLE IF NOT EXISTS "ingredient_variant"
(
  "id"            integer                           GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "name"          varchar                  NOT NULL,
  "ingredient_id" integer                  NOT NULL REFERENCES ingredient (id) ON DELETE CASCADE,
  "created_at"    timestamp with time zone NOT NULL DEFAULT current_timestamp,
  "updated_at"    timestamp with time zone NOT NULL DEFAULT current_timestamp,
  UNIQUE (name, ingredient_id)
);

CREATE TABLE IF NOT EXISTS "brand"
(
  "id"         integer                  GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "name"       varchar UNIQUE NOT NULL,
  "created_at" timestamp with time zone DEFAULT current_timestamp,
  "updated_at" timestamp with time zone DEFAULT current_timestamp
);

CREATE TABLE IF NOT EXISTS "farm"
(
  "id"         integer                  GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "name"       varchar UNIQUE NOT NULL,
  "location"   varchar UNIQUE NOT NULL,
  "created_at" timestamp with time zone DEFAULT current_timestamp,
  "updated_at" timestamp with time zone DEFAULT current_timestamp
);

CREATE TABLE IF NOT EXISTS "product"
(
  "id"                    integer                           GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "ingredient_variant_id" integer                  NOT NULL REFERENCES ingredient_variant (id) ON DELETE CASCADE,
  "brand_id"              integer                  NOT NULL REFERENCES brand (id) ON DELETE CASCADE,
  "created_at"            timestamp with time zone NOT NULL DEFAULT current_timestamp,
  "updated_at"            timestamp with time zone NOT NULL DEFAULT current_timestamp,
  UNIQUE (ingredient_variant_id, brand_id)
);

CREATE TABLE IF NOT EXISTS "product__farms"
(
  "id"         integer                  GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "product_id" integer NOT NULL REFERENCES product (id) ON DELETE CASCADE,
  "farm_id"    integer NOT NULL REFERENCES farm (id) ON DELETE CASCADE,
  "created_at" timestamp with time zone DEFAULT current_timestamp,
  "updated_at" timestamp with time zone DEFAULT current_timestamp,
  UNIQUE (product_id, farm_id)
);

CREATE TABLE IF NOT EXISTS "product__countries"
(
  "id"         integer                  GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "product_id" integer NOT NULL REFERENCES product (id) ON DELETE CASCADE,
  "country_id" integer NOT NULL REFERENCES country (id) ON DELETE CASCADE,
  "created_at" timestamp with time zone DEFAULT current_timestamp,
  "updated_at" timestamp with time zone DEFAULT current_timestamp,
  UNIQUE (product_id, country_id)
);

CREATE TABLE IF NOT EXISTS "product__areas"
(
  "id"         integer                  GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "product_id" integer NOT NULL REFERENCES product (id) ON DELETE CASCADE,
  "area_id"    integer NOT NULL REFERENCES area (id) ON DELETE CASCADE,
  "created_at" timestamp with time zone DEFAULT current_timestamp,
  "updated_at" timestamp with time zone DEFAULT current_timestamp,
  UNIQUE (product_id, area_id)
);

CREATE TABLE IF NOT EXISTS "store"
(
  "id"         integer                  GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "name"       varchar NOT NULL,
  "country_id" integer NOT NULL REFERENCES country (id) ON DELETE CASCADE,
  "created_at" timestamp with time zone DEFAULT current_timestamp,
  "updated_at" timestamp with time zone DEFAULT current_timestamp,
  UNIQUE (name, country_id)
);

CREATE TABLE IF NOT EXISTS "store__products"
(
  "id"                    integer                  GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "product__country_id" integer REFERENCES product__countries (id) ON DELETE CASCADE,
  "product__farm_id"     integer REFERENCES product__farms (id) ON DELETE CASCADE,
  "product__area_id"     integer REFERENCES product__areas (id) ON DELETE CASCADE,
  "store_id"              integer NOT NULL REFERENCES store (id) ON DELETE CASCADE,
  "created_at"            timestamp with time zone DEFAULT current_timestamp,
  "updated_at"            timestamp with time zone DEFAULT current_timestamp,
  UNIQUE (product__countries_id, product__farms_id, store_id)
);

CREATE TABLE IF NOT EXISTS "year_segment"
(
  "id"         integer                  GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "name"       varchar UNIQUE NOT NULL,
  "created_at" timestamp with time zone DEFAULT current_timestamp,
  "updated_at" timestamp with time zone DEFAULT current_timestamp
);

CREATE TABLE IF NOT EXISTS "area"
(
  "id"         integer                  GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "name"       varchar UNIQUE NOT NULL,
  "country_id" integer        NOT NULL REFERENCES country (id) ON DELETE CASCADE,
  "created_at" timestamp with time zone DEFAULT current_timestamp,
  "updated_at" timestamp with time zone DEFAULT current_timestamp,
  UNIQUE (name, country_id)
);

CREATE TABLE IF NOT EXISTS "seasonal_rating"
(
  "id"                    integer                  GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "year_segment_id"       integer NOT NULL REFERENCES year_segment (id) ON DELETE CASCADE,
  "area_id"               integer NOT NULL REFERENCES area (id) ON DELETE CASCADE,
  "ingredient_variant_id" integer NOT NULL REFERENCES ingredient_variant (id) ON DELETE CASCADE,
  "rating"                integer NOT NULL,
  "reference"             varchar NOT NULL,
  "created_at"            timestamp with time zone DEFAULT current_timestamp,
  "updated_at"            timestamp with time zone DEFAULT current_timestamp,
  constraint max_rating
  check (rating <= 2),
  constraint min_rating
  check (rating >= 0),
  UNIQUE (year_segment_id, area_id, ingredient_variant_id)
);