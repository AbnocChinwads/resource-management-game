import db from "../db.js";

export async function getRecipes(playerId) {
  const recipesRes = await db.query(
    `
    SELECT *
    FROM recipes
    ORDER BY id ASC
    `,
  );

  const recipeInputsRes = await db.query(
    `
    SELECT *
    FROM recipe_inputs
    ORDER BY recipe_id, resource_type_id
    `,
  );

  return {
    recipes: recipesRes.rows,
    recipeInputs: recipeInputsRes.rows,
  };
}
