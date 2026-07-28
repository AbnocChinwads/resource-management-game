import db from "../db.js";

export async function createBugReport(
  playerId,
  title,
  description,
  page,
  metadata = {},
) {
  const result = await db.query(
    `
    INSERT INTO bug_reports (
      player_id,
      title,
      description,
      page,
      metadata
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id
    `,
    [playerId, title, description, page, metadata],
  );

  return result.rows[0].id;
}

export async function createSuggestion(
  playerId,
  title,
  description,
  page,
  metadata = {},
) {
  const result = await db.query(
    `
    INSERT INTO gameplay_suggestions (
      player_id,
      title,
      description,
      page,
      metadata
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id
    `,
    [playerId, title, description, page, metadata],
  );

  return result.rows[0].id;
}

export async function getBugReports() {
  const result = await db.query(
    `
    SELECT
      br.*,
      p.name AS player_name
    FROM bug_reports br
    LEFT JOIN players p
      ON br.player_id = p.id
    ORDER BY br.created_at DESC
    LIMIT 100
    `,
  );

  return result.rows;
}


export async function getSuggestions() {
  const result = await db.query(
    `
    SELECT
      gs.*,
      p.name AS player_name
    FROM gameplay_suggestions gs
    LEFT JOIN players p
      ON gs.player_id = p.id
    ORDER BY gs.created_at DESC
    LIMIT 100
    `,
  );

  return result.rows;
}
