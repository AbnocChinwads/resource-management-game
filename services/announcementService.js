import db from "../db.js";

export async function getUnseenAnnouncements(playerId) {
  const result = await db.query(
    `
        SELECT
            a.id,
            a.title,
            a.message,
            a.version,
            a.created_at
        FROM announcements a
        JOIN player_announcements pa
            ON pa.announcement_id = a.id
        WHERE pa.player_id = $1
        AND pa.seen_at IS NULL
        ORDER BY a.created_at ASC
        `,
    [playerId],
  );

  return result.rows;
}

export async function markAnnouncementSeen(playerId, announcementId) {
  await db.query(
    `
        UPDATE player_announcements
        SET seen_at = now()
        WHERE player_id = $1
        AND announcement_id = $2
        `,
    [playerId, announcementId],
  );
}

export async function assignSettlementAnnouncement(playerId, version) {
  const announcement = await db.query(
    `
        SELECT id
        FROM announcements
        WHERE version = $1
        LIMIT 1
        `,
    [version],
  );

  if (announcement.rows.length === 0) {
    console.warn(`No announcement found for settlement version ${version}`);
    return;
  }

  await db.query(
    `
        INSERT INTO player_announcements
        (
            player_id,
            announcement_id
        )
        VALUES
        ($1, $2)
        ON CONFLICT DO NOTHING
        `,
    [playerId, announcement.rows[0].id],
  );
}
