import db from "../db.js";

const BUG_STATUSES = ["open", "in_progress", "resolved", "wont_fix"];
const BUG_PRIORITIES = ["low", "medium", "high", "critical"];
const SUGGESTION_STATUSES = ["new", "considering", "implemented", "declined"];

const BUG_STATUS_ORDER = {
  in_progress: 0,
  open: 1,
};

const BUG_PRIORITY_ORDER = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const BUG_COMPLETED_STATUS_ORDER = {
  resolved: 0,
  wont_fix: 1,
};

const SUGGESTION_STATUS_ORDER = {
  considering: 0,
  new: 1,
};

const SUGGESTION_COMPLETED_STATUS_ORDER = {
  implemented: 0,
  declined: 1,
};

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

export function getActiveBugs(bugs) {
  return bugs
    .filter((bug) => bug.status === "open" || bug.status === "in_progress")
    .sort((a, b) => {
      const statusDifference =
        BUG_STATUS_ORDER[a.status] - BUG_STATUS_ORDER[b.status];

      if (statusDifference !== 0) {
        return statusDifference;
      }

      const priorityDifference =
        BUG_PRIORITY_ORDER[a.priority] - BUG_PRIORITY_ORDER[b.priority];

      if (priorityDifference !== 0) {
        return priorityDifference;
      }

      return new Date(b.created_at) - new Date(a.created_at);
    });
}

export function getCompletedBugs(bugs) {
  return bugs
    .filter((bug) => bug.status === "resolved" || bug.status === "wont_fix")
    .sort((a, b) => {
      const statusDifference =
        BUG_COMPLETED_STATUS_ORDER[a.status] -
        BUG_COMPLETED_STATUS_ORDER[b.status];

      if (statusDifference !== 0) {
        return statusDifference;
      }

      const priorityDifference =
        BUG_PRIORITY_ORDER[a.priority] - BUG_PRIORITY_ORDER[b.priority];

      if (priorityDifference !== 0) {
        return priorityDifference;
      }

      return new Date(b.created_at) - new Date(a.created_at);
    });
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

export function getActiveSuggestions(suggestions) {
  return suggestions
    .filter(
      (suggestion) =>
        suggestion.status === "new" || suggestion.status === "considering",
    )
    .sort((a, b) => {
      const statusDifference =
        SUGGESTION_STATUS_ORDER[a.status] - SUGGESTION_STATUS_ORDER[b.status];

      if (statusDifference !== 0) {
        return statusDifference;
      }

      return new Date(b.created_at) - new Date(a.created_at);
    });
}

export function getCompletedSuggestions(suggestions) {
  return suggestions
    .filter(
      (suggestion) =>
        suggestion.status === "implemented" || suggestion.status === "declined",
    )
    .sort((a, b) => {
      const statusDifference =
        SUGGESTION_COMPLETED_STATUS_ORDER[a.status] -
        SUGGESTION_COMPLETED_STATUS_ORDER[b.status];

      if (statusDifference !== 0) {
        return statusDifference;
      }

      return new Date(b.created_at) - new Date(a.created_at);
    });
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
