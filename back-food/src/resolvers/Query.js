const { db } = require("../../connector");

const Query = {
  Query: {
    edibleMaterialVariant: async (_parent, { id }) => {
      const items = await db.oneOrNone(
        `SELECT *
          FROM edible_material_variant
          WHERE id = $1;`,
        [id]
      );
      return items;
    },
    foods: async () => {
      const items = await db.many("SELECT * FROM edible_material;");
      return items;
    },
    markets: async () => {
      const items = await db.many(`SELECT * FROM farmers_market;`);
      return items;
    },
  },
};

module.exports = Query;
