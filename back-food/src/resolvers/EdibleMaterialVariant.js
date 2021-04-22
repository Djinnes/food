const { db } = require("../../connector");

const Product = {
  Product: {
    brand: async ({ brand_id: brandId }) => {
      if (!brandId) return null;
      const item = await db.one(`SELECT * FROM brand WHERE id = $1`, [brandId]);
      return item;
    },
    supplyChainLinks: async ({ id }) => {
      const items = await db.many(
        `SELECT id, product_id, supply_chain_type_id, chain_step, location, location_area_id
             FROM supply_chain_link WHERE product_id = $1;`,
        [id]
      );
      return items.map(({ chain_step: chainStep, ...props }) => ({
        chainStep,
        ...props,
      }));
    },
  },
};

module.exports = Product;
