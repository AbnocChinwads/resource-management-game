import db from "../db.js";

export async function getRecipeInputs() {
  const recipeInputsRes = await db.query(
    `
    SELECT
      ri.recipe_id,
      ri.resource_type_id,
      ri.amount,
      rt.name
    FROM recipe_inputs ri
    JOIN resource_types rt
      ON rt.id = ri.resource_type_id
    ORDER BY ri.recipe_id, ri.resource_type_id
    `,
  );

  return recipeInputsRes.rows;
}

export async function getRecipes(recipeInputs) {
  const recipesRes = await db.query(
    `
    SELECT
      r.*,
      b.type AS building_type,
      b.population_gain
    FROM recipes r
    LEFT JOIN buildings b
      ON b.id = r.output_building_id
    ORDER BY r.id ASC
    `,
  );

  return {
    recipes: recipesRes.rows,
    recipeInputs,
  };
}
