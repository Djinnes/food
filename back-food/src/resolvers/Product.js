const { db } = require("../../connector");

const EdibleMaterial = {
  EdibleMaterial: {
    variants: async ({ id }) => {
      const items = await db.many(
        `SELECT *
          FROM edible_material_variant
          WHERE edible_material_id = $1;`,
        [id]
      );
      return items;
    },
  },
};

module.exports = EdibleMaterial;