WITH with_comparing_distance_and_berlin AS (SELECT id,
                                                   product_id,
                                                   chain_step,
                                                   location,
                                                   CASE
                                                     WHEN (
                                                       LAG(product_id, 1) OVER (ORDER BY product_id, chain_step DESC) =
                                                       product_id)
                                                             THEN LAG(location, 1) OVER (ORDER BY product_id, chain_step DESC)
                                                     ELSE POINT(13.4050, 52.5200) END "to_compare"
                                            FROM supply_chain_link
                                            ORDER BY product_id, chain_step DESC),
     comparing AS (SELECT id,
                          product_id,
                          chain_step,
                          location,
                          st_distancesphere(geometry(location), geometry(to_compare)) "test"
                   FROM with_comparing_distance_and_berlin),
     final_result AS (SELECT product_id, SUM(test) "total" FROM comparing GROUP BY product_id)
SELECT p.id, t.total / 1000, em.name, emv.name, i.name, b.name "brand"
FROM product p
       INNER JOIN final_result t ON t.product_id = p.id
       INNER JOIN edible_material_variant emv on p.edible_material_variant_id = emv.id
       INNER JOIN edible_material em on emv.edible_material_id = em.id
       INNER JOIN ingredient i on p.ingredient_id = i.id
       INNER JOIN brand b on p.brand_id = b.id;
