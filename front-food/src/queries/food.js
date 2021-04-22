const foodPageQuery = `query FoodPage($id: ID!) {
    edibleMaterialVariant(id: $id) {
      id
      name
      products {
        id
        supplyChainLinks {
          id
          chainStep
          location {
            x
            y
          }
        }
        brand {
          id
          name
        }
      }
    }
  }`;
export default foodPageQuery;
