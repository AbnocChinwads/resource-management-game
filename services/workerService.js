import db from "../db.js";

export async function reconcileWorkers(playerId) {
    const playerRes = await db.query(
        `
        SELECT workers 
        FROM players 
        WHERE id = $1`, 
        [playerId]
    );

    const availableWorkers = playerRes.rows[0].workers;

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
