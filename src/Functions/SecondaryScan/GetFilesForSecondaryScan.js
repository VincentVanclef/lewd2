import db from "../../helpers/database";

const getFilesForSecondaryScan = async () => {
    const client   = await db.connect();
    const getFiles = await client.query(`SELECT filename 
                                         FROM "Uploads" 
                                         WHERE "scannedTwice" = FALSE;`);
                     await client.release();

    return getFiles.rows
}

export default getFilesForSecondaryScan;