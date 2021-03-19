const { ApolloServer } = require("apollo-server");
const { db } = require("./connector");
const { getDistanceFromLatLonInKm } = require("./utils");
const nl = require("./simplemaps/nl.json");
const de = require("./simplemaps/de.json");
const ec = require("./simplemaps/ec.json");
const typeDefs = require("./src/typeDefs");

const countryToSimpleMaps = {
  Germany: de,
  Ecuador: ec,
  Netherlands: nl,
};

// Have tags for ingredient type
// Have Tree, With Ingredient -> Ingredient_type
// List where they are available, ordered by algorithm with transparency and distance

const mapProvider = (latitude, longitude) => ({ location, ...a }) => {
  const [latitude2, longitude2] = location.split(",");
  const distance = getDistanceFromLatLonInKm(
    latitude,
    longitude,
    latitude2,
    longitude2
  );
  return {
    location,
    distance: `${+distance.toFixed(2)}km`,
    ...a,
  };
};

const calculateDistance = (latitude, longitude) => (
  farmLocation,
  areaName,
  areaCountryName,
  countryName
) => {
  if (farmLocation) {
    const [latitude2, longitude2] = farmLocation.split(",");
    const distance = getDistanceFromLatLonInKm(
      latitude,
      longitude,
      latitude2,
      longitude2
    );
    return distance;
  }
  if (areaName && areaCountryName) {
    const cities = countryToSimpleMaps[areaCountryName];
    const citiesInRegion = cities.filter(
      ({ admin_name: adminName }) => areaName === adminName
    );
    const citiesInRegionByDistance = citiesInRegion
      .map(({ lat, lng, ...city }) => ({
        distance: getDistanceFromLatLonInKm(latitude, longitude, lat, lng),
        ...city,
      }))
      .sort(({ distance }, { distance: distance2 }) => distance2 - distance);
    return citiesInRegionByDistance[0].distance;
  }
  if (countryName) {
    const cities = countryToSimpleMaps[countryName];
    const citiesOrderedByDistance = cities
      .map(({ lat, lng, ...city }) => ({
        distance: getDistanceFromLatLonInKm(latitude, longitude, lat, lng),
        ...city,
      }))
      .sort(({ distance }, { distance: distance2 }) => distance2 - distance);
    const furthestCityWithAdmin = citiesOrderedByDistance.find(
      ({ admin_name: adminName }) => adminName !== ""
    );
    return furthestCityWithAdmin.distance;
  }
  return undefined;
};

const resolvers = {
  Query: {
    ingredients: async (_parent, args) => {
      const items = await db.many(`SELECT * FROM ingredient;`);
      return items.map((i) => ({ ...i, ...args }));
    },
    ingredientsByDistance: async (_parent, { latitude, longitude }) => {
      const ingredientsWithProviders = await db.manyOrNone(`
      SELECT i.id,
       i.name,
       iv.id      "ingredient_variant_id",
       f.location "farm_location",
       a.name     "area_name",
       c3.name    "area_country_name",
       c2.name    "country_name"
FROM ingredient i
       INNER JOIN ingredient_variant iv on i.id = iv.ingredient_id
       INNER JOIN product p on iv.id = p.ingredient_variant_id
       LEFT JOIN brand b on p.brand_id = b.id
       LEFT JOIN area a on p.producer_area_id = a.id
       LEFT JOIN country c3 on a.country_id = c3.id
       LEFT JOIN country c2 on p.producer_country_id = c2.id
       LEFT JOIN farm f on p.producer_farm_id = f.id;

`);
      const providers = ingredientsWithProviders.map(
        ({
          farm_location: farmLocation,
          area_name: areaName,
          area_country_name: areaCountryName,
          country_name: countryName,
          id,
          ingredient_variant_id: ingredientVariantId,
          name,
        }) => {
          const distance = calculateDistance(latitude, longitude)(
            farmLocation,
            areaName,
            areaCountryName,
            countryName
          );
          return {
            id,
            name,
            ingredientVariantId,
            distance,
          };
        }
      );
      const sortedProviders = providers.sort(
        ({ distance }, { distance: distance2 }) => distance - distance2
      );
      const sortedIngredients = [];
      sortedProviders.forEach(({ id, ingredientVariantId, name }) => {
        const foundIngredientIndex = sortedIngredients.findIndex(
          ({ id: id2 }) => id2 === id
        );
        if (foundIngredientIndex === -1) {
          sortedIngredients.push({
            name,
            id,
            variants: [ingredientVariantId],
            longitude,
            latitude,
          });
          return;
        }
        if (
          sortedIngredients[foundIngredientIndex].variants.find(
            (i) => i === ingredientVariantId
          )
        ) {
          return;
        }
        sortedIngredients[foundIngredientIndex].variants.push(
          ingredientVariantId
        );
      });
      return sortedIngredients;
    },
    products: async (_parent, args) => {
      const items = await db.many(`SELECT * FROM product;`);
      return items.map((i) => ({ ...i, ...args }));
    },
    validIngredientTypes: async (_parent, args) => {
      const items = await db.many(`SELECT DISTINCT (ingredient_type.name), ingredient_type.id
      FROM ingredient_type
             INNER JOIN ingredient__ingredient_types iit on ingredient_type.id = iit.ingredient_type_id;`);
      return items.map((i) => ({ ...i, ...args }));
    },
  },
  Product: {
    ingredientVariant: async ({
      ingredient_variant_id: ingredientVariantId,
    }) => {
      const item = await db.one(
        `SELECT * FROM ingredient_variant WHERE id = $1;`,
        [ingredientVariantId]
      );
      return item;
    },
    brand: async ({ brand_id: brandId }) => {
      const item = await db.one(`SELECT * FROM brand WHERE id = $1;`, [
        brandId,
      ]);
      return item;
    },
    providers: async ({ id, latitude, longitude }) => {
      const areas = await db.manyOrNone(
        `SELECT a.id, a.name, c2.name as "country_name"
        FROM area a
               INNER JOIN country c2 on a.country_id = c2.id
               INNER JOIN product p on a.id = p.producer_area_id
        WHERE p.id = $1;`,
        [id]
      );
      const areasWithDistance = areas.map(
        ({ location, name, country_name: countryName, ...a }) => {
          const cities = countryToSimpleMaps[countryName];
          const citiesInRegion = cities.filter(
            ({ admin_name: adminName }) => name === adminName
          );
          const citiesInRegionByDistance = citiesInRegion
            .map(({ lat, lng, ...city }) => ({
              distance: getDistanceFromLatLonInKm(
                latitude,
                longitude,
                lat,
                lng
              ),
              ...city,
            }))
            .sort(
              ({ distance }, { distance: distance2 }) => distance2 - distance
            );
          return {
            location,
            name,
            distance: `${+citiesInRegionByDistance[0].distance.toFixed(2)}km`,
            ...a,
          };
        }
      );
      const countries = await db.manyOrNone(
        `SELECT c.id, c.name, c.location
        FROM country c
               INNER JOIN product p on c.id = p.producer_country_id
        WHERE p.id = $1;`,
        [id]
      );
      const countriesWithDistance = countries.map(
        ({ location, name, ...a }) => {
          const cities = countryToSimpleMaps[name];
          const citiesOrderedByDistance = cities
            .map(({ lat, lng, ...city }) => ({
              distance: getDistanceFromLatLonInKm(
                latitude,
                longitude,
                lat,
                lng
              ),
              ...city,
            }))
            .sort(
              ({ distance }, { distance: distance2 }) => distance2 - distance
            );
          const furthestCityWithAdmin = citiesOrderedByDistance.find(
            ({ admin_name: adminName }) => adminName !== ""
          );
          return {
            location,
            name,
            distance: `${+furthestCityWithAdmin.distance.toFixed(2)}km`,
            ...a,
          };
        }
      );
      const farms = await db.manyOrNone(
        `SELECT f.id, f.name, f.location
        FROM farm f
               INNER JOIN product p on f.id = p.producer_farm_id
        WHERE p.id = $1;`,
        [id]
      );
      const farmsWithDistance = farms.map(mapProvider(latitude, longitude));
      const providers = [
        ...areasWithDistance,
        ...countriesWithDistance,
        ...farmsWithDistance,
      ];
      return providers;
    },
    suppliers: async ({ id, latitude, longitude }) => {
      const suppliers = await db.manyOrNone(
        `SELECT s.id, s.name, s.location
        FROM supplier s
               INNER JOIN product p on s.id = p.supplier_id
        WHERE p.id = $1;`,
        [id]
      );
      const suppliersithDistance = suppliers.map(
        mapProvider(latitude, longitude)
      );
      return suppliersithDistance;
    },
  },
  IngredientVariant: {
    ingredient: async ({ ingredient_id: ingredientId }) => {
      const item = await db.one(`SELECT * FROM ingredient WHERE id = $1;`, [
        ingredientId,
      ]);
      return item;
    },
    producer: async ({ id, latitude, longitude, ...ss }) => {
      const producers = await db.manyOrNone(
        `SELECT p.id       "product_id",
        p.ingredient_variant_id,
        c2.name    "country_name",
        a.name     "area_name",
        c3.name    "area_country_name",
        f.location "farm_location"
 FROM product p
        LEFT JOIN brand b on p.brand_id = b.id
        LEFT JOIN area a on p.producer_area_id = a.id
        LEFT JOIN country c3 on a.country_id = c3.id
        LEFT JOIN country c2 on p.producer_country_id = c2.id
        LEFT JOIN farm f on p.producer_farm_id = f.id
 WHERE ingredient_variant_id = $1;`,
        [id]
      );

      return producers.map(
        ({ country_name, area_name, area_country_name, farm_location }) => {
          const distance = calculateDistance(latitude, longitude)(
            farm_location,
            area_name,
            area_country_name,
            country_name
          );
          return distance;
        }
      );
    },
  },
  Ingredient: {
    types: async ({ id }) => {
      const item = await db.manyOrNone(
        `SELECT it.*
      FROM ingredient_type it
             INNER JOIN ingredient__ingredient_types iit on it.id = iit.ingredient_type_id
      WHERE iit.ingredient_id = $1;`,
        [id]
      );
      return item;
    },
    variants: async ({ id, variants = [], latitude, longitude }) => {
      if (variants.length) {
        const items = await db.manyOrNone(
          `
        SELECT * FROM ingredient_variant WHERE id IN ($1:csv);`,
          [variants]
        );
        return items.map((i) => ({ ...i, latitude, longitude }));
      }
      const items = await db.manyOrNone(
        `
      SELECT *
FROM ingredient_variant
WHERE ingredient_id = $1;`,
        [id]
      );
      return items;
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
