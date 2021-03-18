const { ApolloServer, gql } = require("apollo-server");
const { db } = require("./connector");
const { getDistanceFromLatLonInKm } = require("./utils");
const nl = require("./simplemaps/nl.json");
const de = require("./simplemaps/de.json");
const ec = require("./simplemaps/ec.json");

const countryToSimpleMaps = {
  Germany: de,
  Ecuador: ec,
  Netherlands: nl,
};

const typeDefs = gql`
  type Ingredient {
    name: String
  }
  type IngredientVariant {
    name: String
    ingredient: Ingredient!
  }
  type Brand {
    name: String
  }
  type Provider {
    name: String
    distance: String
  }
  type Supplier {
    name: String
    distance: String
  }
  type Product {
    id: ID!
    ingredientVariant: IngredientVariant!
    brand: Brand!
    providers: [Provider]
    suppliers: [Supplier]
    distance: String
  }
  type Query {
    products(latitude: String!, longitude: String!): [Product]
  }
`;

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

const resolvers = {
  Query: {
    products: async (_parent, args) => {
      const items = await db.many(`SELECT * FROM product;`);
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
        `SELECT a.*, c2.name as "country_name"
        FROM area a
               INNER JOIN product__areas pa on a.id = pa.area_id
               INNER JOIN country c2 on a.country_id = c2.id
        WHERE pa.product_id = $1;`,
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
        `SELECT *
        FROM country c
               INNER JOIN product__countries pc on c.id = pc.country_id
        WHERE pc.product_id = $1;`,
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
        `SELECT *
        FROM farm f
               INNER JOIN product__farms pf on f.id = pf.farm_id
        WHERE pf.product_id = $1;`,
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
        `SELECT *
        FROM supplier s
               INNER JOIN product__suppliers ps on s.id = ps.supplier_id
        WHERE ps.product_id = $1;`,
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
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
