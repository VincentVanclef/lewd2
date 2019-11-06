import { db } from "../../helpers/database";

async function getUploadCount(userId) {
  if (!userId) {
    return null;
  }

  const client = await db.connect();
  const uploadCountQuery = 
    await client.query(`SELECT COUNT(id) FROM "Uploads" WHERE userid = $1`, [ userId ]);

  await client.release();

  return parseInt(uploadCountQuery.rows[0].count);
}

export { getUploadCount };