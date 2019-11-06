import { db } from "../../helpers/database";

/**
 * 
 * @param {*} userId 
 * @param {*} limit 
 * @param {*} offset 
 */
async function getUploadsByLimitAndOffset(userId, limit, offset) {
    if (!userId) {
        return null;
    }

    const client = await db.connect();

    const uploads = await client.query(`SELECT
        id,
            filename, 
            size, 
            originalname, 
            uploaddate, 
            duplicate, 
            virus, 
            passworded, 
            deletionkey,
            (SELECT COUNT(id) FROM "Uploads" WHERE userid = $1)::INT as "AmountOfUploads"
        FROM 
            "Uploads" 
        WHERE 
            userid = $1
        ORDER BY id DESC
        LIMIT $2 OFFSET $3;`, [ userId, limit, (offset - 1) * limit ]);
        
    await client.release();

    return uploads.rows;
}

export { getUploadsByLimitAndOffset };