import moment         from "moment";
import { getUploadsByLimitAndOffset } from "../../Functions/User/getUploads";
import { convertNumberToBestByteUnit } from "../../Functions/convertNumberToBestByteUnit";

async function get(req, res) {
    const pageCount =
        req.params.page ? 
            parseInt(req.params.page) :
            1; 

    const uploads = await getUploadsByLimitAndOffset(res.locals.user.id, 5, pageCount);
    let count = uploads.length;

    // If there are dates then format them
    if (uploads) {
        uploads.forEach(upload => {
            upload.uploaddate = moment(upload.uploaddate)
                               .format("YYYY-MM-DD HH:mm:ss");

            upload.size = convertNumberToBestByteUnit(upload.size);
        });
    }

    res.render("user", {
        page: pageCount,
        menuItem: "view-uploads",
        uploads: uploads,
        count: count,
        js: ["viewUploads"]
    });
}

export { get };
