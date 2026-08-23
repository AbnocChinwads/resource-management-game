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
    SELECT *
    FROM recipes
    ORDER BY id ASC
    `,
  );

  return {
    recipes: recipesRes.rows,
    recipeInputs,
  };
}
