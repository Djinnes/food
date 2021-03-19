/* Setup for Raw Product */
CREATE TABLE IF NOT EXISTS "ingredient"
(
  "id"         integer                           GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "name"       varchar UNIQUE           NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT current_timestamp,
  "updated_at" timestamp with time zone NOT NULL DEFAULT current_timestamp
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

CREATE TABLE IF NOT EXISTS "ingredient_type"
(
  "id"         integer                  GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "name"       varchar UNIQUE NOT NULL,
  "created_at" timestamp with time zone DEFAULT current_timestamp,
  "updated_at" timestamp with time zone DEFAULT current_timestamp
);

CREATE TABLE IF NOT EXISTS "ingredient__ingredient_types"
(
  "ingredient_id"      integer                  NOT NULL REFERENCES ingredient (id) ON DELETE CASCADE,
  "ingredient_type_id" integer                  NOT NULL REFERENCES ingredient_type (id) ON DELETE CASCADE,
  "created_at"         timestamp with time zone NOT NULL DEFAULT current_timestamp,
  "updated_at"         timestamp with time zone NOT NULL DEFAULT current_timestamp,
  UNIQUE (ingredient_id, ingredient_type_id)
);

/* Setup for Producer */
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

CREATE TABLE IF NOT EXISTS "farm"
(
  "id"         integer                  GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "name"       varchar UNIQUE NOT NULL,
  "location"   varchar UNIQUE NOT NULL,
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

/* Setup for Supplier */
CREATE TABLE IF NOT EXISTS "supplier"
(
  "id"         integer                  GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "name"       varchar UNIQUE NOT NULL,
  "location"   varchar UNIQUE NOT NULL,
  "created_at" timestamp with time zone DEFAULT current_timestamp,
  "updated_at" timestamp with time zone DEFAULT current_timestamp
);

/* Setup for Retailer */
CREATE TABLE IF NOT EXISTS "retailer"
(
  "id"         integer                  GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "name"       varchar UNIQUE NOT NULL,
  "country_id" integer        NOT NULL REFERENCES country (id) ON DELETE CASCADE,
  "created_at" timestamp with time zone DEFAULT current_timestamp,
  "updated_at" timestamp with time zone DEFAULT current_timestamp,
  UNIQUE (name, country_id)
);

/* Product */
CREATE TABLE IF NOT EXISTS "product"
(
  "id"                    integer                  GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "ingredient_variant_id" integer NOT NULL REFERENCES ingredient_variant (id) ON DELETE CASCADE,

  "supplier_id"           integer REFERENCES supplier (id) ON DELETE CASCADE,
  "producer_farm_id"      integer REFERENCES farm (id) ON DELETE CASCADE,
  "producer_country_id"   integer REFERENCES country (id) ON DELETE CASCADE,
  "producer_area_id"      integer REFERENCES area (id) ON DELETE CASCADE,

  "retailer_id"           integer NOT NULL REFERENCES retailer (id) ON DELETE CASCADE,
  "brand_id"              integer REFERENCES brand (id) ON DELETE CASCADE,

  "created_at"            timestamp with time zone DEFAULT current_timestamp,
  "updated_at"            timestamp with time zone DEFAULT current_timestamp,
  UNIQUE (ingredient_variant_id, producer_farm_id, producer_country_id, producer_area_id, retailer_id, brand_id)

);


CREATE TABLE IF NOT EXISTS "year_segment"
(
  "id"         integer                  GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "name"       varchar UNIQUE NOT NULL,
  "created_at" timestamp with time zone DEFAULT current_timestamp,
  "updated_at" timestamp with time zone DEFAULT current_timestamp
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

CREATE TABLE IF NOT EXISTS "farmers_market"
(
  "id"           integer                  GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "name"         varchar NOT NULL UNIQUE,
  "location"     varchar NOT NULL UNIQUE,
  "phone_number" varchar UNIQUE,
  "email"        varchar UNIQUE,
  "website"      varchar UNIQUE,
  "created_at"   timestamp with time zone DEFAULT current_timestamp,
  "updated_at"   timestamp with time zone DEFAULT current_timestamp
);

CREATE TABLE IF NOT EXISTS "farmers_market_opening_times"
(
  "id"                integer GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "farmers_market_id" integer NOT NULL REFERENCES farmers_market (id) ON DELETE CASCADE,
  "open"              varchar NOT NULL,
  "close"             varchar NOT NULL,
  "day"               integer NOT NULL
);
