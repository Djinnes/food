const { db } = require("../../connector");

const Market = {
  Market: {
    openingTimes: async ({ id }) => {
      const items = await db.manyOrNone(
        `SELECT * FROM farmers_market_opening_times WHERE farmers_market_id = $1`,
        [id]
      );
      return items;
    },
  },
};

module.exports = Market;
