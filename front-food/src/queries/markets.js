const MARKET_QUERY = `query {
    markets {
      id
      name
      email
      location {
        x
        y
      }
      openingTimes {
        open
        close
        day
      }
    }
  }
      `;
export default MARKET_QUERY;
