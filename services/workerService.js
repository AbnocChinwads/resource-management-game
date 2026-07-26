import db from "../db.js";

export async function reconcileWorkers(playerId, availableWorkers) {
    const buildingsRes = await db.query(
        `
        SELECT id, workers_assigned 
        FROM player_buildings 
        WHERE player_id = $1 
        ORDER BY id DESC`,
        [playerId]
    );

    let remainingWorkers = availableWorkers;

    for (const building of buildingsRes.rows) {
        const assigned = Math.min(
            building.workers_assigned,
            remainingWorkers
        );

        remainingWorkers -= assigned;

        await db.query(
            `
            UPDATE player_buildings 
            SET workers_assigned = $1 
            WHERE id = $2`,
            [assigned, building.id]);
    }
}
