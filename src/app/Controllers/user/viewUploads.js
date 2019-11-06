import moment         from "moment";
import { getUploadsByLimitAndOffset } from "../../Functions/User/getUploads";
import { getUploadCount } from "../../Functions/User/getUploadCount";
import { convertNumberToBestByteUnit } from "../../Functions/convertNumberToBestByteUnit";

async function get(req, res) {
    const userId = res.locals.user.id;
    const amountOfUploadsToShow = parseInt(process.env.AMOUNT_OF_UPLOADS_TO_SHOW_IN_TABLE);    

    const pageNumber = 
        req.params.page ? 
            parseInt(req.params.page) : 1;

    const totalUploads = await getUploadCount(userId);
    const amountOfPages = Math.ceil(totalUploads / parseInt(amountOfUploadsToShow));
    
    const lastPageHit = 
        (pageNumber * amountOfUploadsToShow) > totalUploads; 

    const pageCount =
        lastPageHit ? amountOfPages : pageNumber; 
    
    const uploads =
        await getUploadsByLimitAndOffset(userId, amountOfUploadsToShow, pageCount);

    // If there are dates then format them
    if (uploads) {
        uploads.forEach(upload => {
            upload.uploaddate = moment(upload.uploaddate)
                               .format("YYYY-MM-DD HH:mm:ss");

            upload.size = convertNumberToBestByteUnit(upload.size);
        });
    }

    // I keep these two as null to tell the template engine to not go anywhere 
    const previousPage = pageCount - 1; 
    const nextPage = pageCount + 1;

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
