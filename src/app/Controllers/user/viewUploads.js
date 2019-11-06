import moment         from "moment";
import { getUploadsByLimitAndOffset } from "../../Functions/User/getUploads";
import { convertNumberToBestByteUnit } from "../../Functions/convertNumberToBestByteUnit";

async function get(req, res) {
    const amountOfUploadsToShow = 5;

    const pageCount =
        req.params.page ? 
            parseInt(req.params.page) : 1; 

    const uploads = await getUploadsByLimitAndOffset(res.locals.user.id, amountOfUploadsToShow, pageCount);


    // If there are dates then format them
    if (uploads) {
        uploads.forEach(upload => {
            upload.uploaddate = moment(upload.uploaddate)
                               .format("YYYY-MM-DD HH:mm:ss");

            upload.size = convertNumberToBestByteUnit(upload.size);
        });
    }
    const totalUploads = uploads[0].AmountOfUploads;

    // I keep these two as null to tell the template engine to not go anywhere 
    const previousPage = pageCount - 1; 
    const nextPage = pageCount + 1;

    const amountOfPages =
        Math.ceil(totalUploads / parseInt(amountOfUploadsToShow));

    res.render("user", {
        page: pageCount,
        previousPage: previousPage,
        nextPage: nextPage,
        menuItem: "view-uploads",
        uploads: uploads,
        amountOfPages: amountOfPages,
        js: ["viewUploads"]
    });
}

export { get };
