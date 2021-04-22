const foodsQuery = `query {
  foods {
    id
    name
    variants {
        id
        name
    }
  }
}`;
export default foodsQuery;
