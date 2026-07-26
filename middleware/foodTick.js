import { processFoodTick } from "../services/foodService.js";

// Nutrition & population middleware
export async function foodTick(req, res, next) {
  
  if (!req.playerId) return next();

  try {
    const result = await processFoodTick(req.playerId);

    if (result) {
      res.locals.food = result.food;
      res.locals.population = result.population;
      res.locals.workers = result.workers;
    }

    next();
  } catch (err) {
    console.error("Food tick error: ", err);
    next(err);
  }
}
