import db from "../db.js";

const BUG_STATUSES = ["open", "in_progress", "resolved", "wont_fix"];
const BUG_PRIORITIES = ["low", "medium", "high", "critical"];
const SUGGESTION_STATUSES = ["new", "considering", "implemented", "declined"];

/*Create*/
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
/*Create*/

/*Read*/
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
/*Read*/

/*Update*/
export async function updateBugReport(id, status, priority) {
  if (!BUG_STATUSES.includes(status)) {
    throw new Error("Invalid bug status");
  }

  if (!BUG_PRIORITIES.includes(priority)) {
    throw new Error("Invalid bug priority");
  }

  await db.query(
    `
    UPDATE bug_reports
    SET status = $1,
        priority = $2
    WHERE id = $3
    `,
    [status, priority, id],
  );
}

export async function updateSuggestion(id, status) {
  if (!SUGGESTION_STATUSES.includes(status)) {
    throw new Error("Invalid suggestion status");
  }

  await db.query(
    `
    UPDATE gameplay_suggestions
    SET status = $1
    WHERE id = $2
    `,
    [status, id],
  );
}
/*Update*/
