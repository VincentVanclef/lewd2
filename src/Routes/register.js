import express                                  from "express";
import db                                       from "../helpers/database";
import bcrypt                                   from "bcrypt";
import { check, validationResult }              from 'express-validator/check';
import crypto                                   from "crypto";
import { getTokenData, checkTokenDataForErrors} from "../Functions/Register/tokenData";
import checkIfUsernameExists                    from "../Functions/Register/checkIfUsernameExists";

const router = express.Router();



router.get("/", async (req, res) => {
    res.render("notoken");
});


router.get("/:token", async (req, res) => {
    // Get token data
    const tokenData      = await getTokenData(req.params.token);
    const tokenIsInvalid =  checkTokenDataForErrors(tokenData);
    
    // Report errors
    if (tokenIsInvalid) {
        req.session.err = tokenIsInvalid;
        return res.redirect("/");
    }

    // No errors, show the register page
    res.render("register", {
        token: req.params.token
    });
});

router.post("/", [
    check("token").isString().withMessage("Invalid token")
                  .isLength({min: 10}).withMessage("Token too short"),

    check("username").isLength({min: 2}).withMessage("Username needs to be at least 2 characters long")
                    .custom(checkIfUsernameExists).withMessage("Username taken"),

    check("password").exists().withMessage("Please select a username")
                     .isLength({min: 2}).withMessage("Password needs to be 2 characters long")
] , async (req, res) => {
    ////////////////////////
    // Catch token errors //
    ////////////////////////
    // Get token data
    const tokenData      = await getTokenData(req.body.token);
    const tokenIsInvalid =  checkTokenDataForErrors(tokenData);
    
    // Report errors
    if (tokenIsInvalid) {
        req.session.err = tokenIsInvalid;
        return res.redirect("/");
    }
    
    ////////////////////////
    // Catch input errors //
    ////////////////////////
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.session.err = errors.array();
        return res.redirect("/register/" + req.body.token);
    }

    //////////////
    // Add user //
    //////////////
    
    const username = req.body.username;
    const password = await bcrypt.hash(req.body.password, parseInt(process.env.BCRYPT_SALT_ROUNDS));
    const token    = crypto.createHash("sha1")
                           .update(username + Date.now().toString())
                           .digest("hex");

    const roleid     = req.body.roleid;
    const uploadSize = tokenData.uploadsize;
    const isAdmin    = tokenData.isadmin;

    const client = await db.connect();
    await client.query(`INSERT INTO "Users" (username, password, token, roleid, uploadsize, isadmin)
                        VALUES ($1, $2, $3, $4, $5, $6);`, [
                            username, 
                            password, 
                            token, 
                            roleid, 
                            uploadSize,
                            isAdmin
                        ]);

    await client.query(`UPDATE "RegisterTokens" SET used = TRUE WHERE token = $1;`, [req.body.token]);
    await client.release();

    req.flash('userAdded', 'You have now signed up');
    res.redirect("/");
});

export default router;