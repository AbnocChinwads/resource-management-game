import db from "../db.js";
import {
  calculateProductionRate,
  calculateConsumptionRate,
  getProductionStatus,
} from "./productionService.js";
import { getPlayerResources } from "./resourceService.js";
import { getPlayerStorage } from "./storageService.js";

export async function getPlayerBuildings(playerId) {
  const result = await db.query(
    `
    SELECT 
    pb.*, 
    b.name, 
    b.type, 
    b.max_workers, 
    b.max_health, 
    b.population_gain,
    r.id AS recipe_id,
    r.output_resource_id,
    r.output_amount,
    r.craft_time_seconds,
    rt.name AS output_resource_name,
    ROW_NUMBER() OVER (
    PARTITION BY pb.building_id
    ORDER BY pb.id ASC
    ) AS building_number
    FROM player_buildings pb
    JOIN buildings b ON pb.building_id = b.id
    LEFT JOIN recipes r
    ON r.id = b.production_recipe_id
    LEFT JOIN resource_types rt
    ON rt.id = r.output_resource_id
    WHERE pb.player_id = $1
    ORDER BY
    b.type ASC,
    b.name ASC,
    pb.id ASC`,
    [playerId],
  );

  const buildings = result.rows;

  const recipeInputsResult = await db.query(
    `
    SELECT
    ri.recipe_id,
    ri.resource_type_id,
    ri.amount,
    rt.name
    FROM recipe_inputs ri
    JOIN resource_types rt
    ON rt.id = ri.resource_type_id`,
  );

  const recipeInputsMap = new Map();

  for (const input of recipeInputsResult.rows) {
    if (!recipeInputsMap.has(input.recipe_id)) {
      recipeInputsMap.set(input.recipe_id, []);
    }

    recipeInputsMap.get(input.recipe_id).push(input);
  }

  const resources = await getPlayerResources(playerId);
  const storage = await getPlayerStorage(playerId);

  for (const building of buildings) {
    if (!building.recipe_id) {
      building.productionRate = 0;
      building.consumptionRates = [];
      continue;
    }

    building.productionRate = calculateProductionRate(building);

    const inputs = recipeInputsMap.get(building.recipe_id) || [];

    building.consumptionRates = inputs.map((input) => ({
      resource_type_id: input.resource_type_id,
      name: input.name,
      amount: calculateConsumptionRate(
        input,
        building.workers_assigned,
        building.craft_time_seconds,
      ),
    }));

    building.productionStatus = await getProductionStatus(
      building,
      inputs,
      resources,
      storage,
    );
  }

  return buildings;
}
