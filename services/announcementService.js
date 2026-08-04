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
