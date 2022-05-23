var admin = require("firebase-admin");

exports.authCheck = async (req) => {
    const token = req.headers.authorization;
    const currentUser = admin
        .auth()
        .verifyIdToken(token);

    return currentUser
}
