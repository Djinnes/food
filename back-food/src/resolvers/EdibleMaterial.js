const { db } = require("../../connector");

const EdibleMaterialVariant = {
  EdibleMaterialVariant: {
    products: async ({ id }) => {
      const items = await db.manyOrNone(
        `SELECT * FROM product WHERE edible_material_variant_id = $1`,
        [id]
      );
      return items;
    },
  },
};

module.exports = EdibleMaterialVariant;
