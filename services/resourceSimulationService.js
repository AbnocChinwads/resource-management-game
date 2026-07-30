import db from "../db.js";
import { SIMULATION_TICK_SECONDS } from "../config/simulation.js";

async function getRecipeInputs(recipeId) {
  const result = await db.query(
    `
    SELECT
    resource_type_id,
    amount
    FROM recipe_inputs
    WHERE recipe_id = $1
    `,
    [recipeId],
  );

  return result.rows;
}

async function buildingHasResources(playerId, inputs, workers) {
  for (const input of inputs) {
    const result = await db.query(
      `
        SELECT amount
        FROM player_resources
        WHERE player_id = $1
        AND resource_type_id = $2
        `,
      [playerId, input.resource_type_id],
    );

    const available = Number(result.rows[0]?.amount ?? 0);
    const required =
      Number(input.amount) * workers * (SIMULATION_TICK_SECONDS / 60);

    if (available < required) {
      return false;
    }
  }

  return true;
}

async function consumeInputs(playerId, inputs, workers) {
  for (const input of inputs) {
    const amount =
      Number(input.amount) * workers * (SIMULATION_TICK_SECONDS / 60);

    await db.query(
      `
        UPDATE player_resources
        SET amount = amount - $1
        WHERE player_id = $2
        AND resource_type_id = $3
        `,
      [amount, playerId, input.resource_type_id],
    );
  }
}

async function produceOutput(playerId, building) {
  if (!building.output_resource_id) {
    return;
  }

  const amount =
    Number(building.output_amount) *
    building.workers_assigned *
    (SIMULATION_TICK_SECONDS / building.craft_time_seconds);

  await db.query(
    `
    INSERT INTO player_resources
    (player_id, resource_type_id, amount)
    VALUES ($1,$2,$3)
    ON CONFLICT (player_id, resource_type_id)
    DO UPDATE
    SET amount = player_resources.amount + EXCLUDED.amount
    `,
    [playerId, building.output_resource_id, amount],
  );
}

export async function processResourceTick(playerId) {
  await db.query("BEGIN");

  try {
    const buildings = await db.query(
      `
        SELECT
        pb.id AS player_building_id,
        pb.workers_assigned,
        pb.health,
        r.id AS recipe_id,
        r.name,
        r.craft_time_seconds,
        r.output_resource_id,
        r.output_amount
        FROM player_buildings pb
        JOIN buildings b
        ON b.id = pb.building_id
        JOIN recipes r
        ON r.id = b.production_recipe_id
        WHERE pb.player_id = $1
        AND pb.workers_assigned > 0
        AND pb.health > 0
        `,
      [playerId],
    );

    for (const building of buildings.rows) {

      const inputs = await getRecipeInputs(building.recipe_id);

      const canRun = await buildingHasResources(
        playerId,
        inputs,
        building.workers_assigned,
      );

      if (!canRun) {
        continue;
      }

      await consumeInputs(playerId, inputs, building.workers_assigned);

      await produceOutput(playerId, building);
    }

    await db.query("COMMIT");
  } catch (err) {
    await db.query("ROLLBACK");
    throw err;
  }
}
