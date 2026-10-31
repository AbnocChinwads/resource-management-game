import { canStartRecipe } from "../game/recipes.js";

export function updateConstructionMenu(data) {
  const menu = document.querySelector("#construction-menu");

  const buildRecipes = data.recipes.filter(
    (recipe) => recipe.recipe_type === "build",
  );

  console.log(buildRecipes);
}
