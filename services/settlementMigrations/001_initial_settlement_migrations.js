export default async function migrate(playerId, db) {
  console.log(
    `Settlement migration 001_initial_settlement_migrations applied to player ${playerId}`,
  );

  // Intentionally empty.
  // Version 0.4.0 already reset every settlement,
  // so this establishes the migration system baseline.
}