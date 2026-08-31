import crypto from "crypto";

function sign(value, secret) {
    return crypto
        .createHmac("sha256", secret)
        .update(value)
        .digest("hex");
}

export default function handler(req, res) {
    const sessionSecret =
        process.env.CMS_SESSION_SECRET;

    const cookieHeader =
        req.headers.cookie || "";

    const match =
        cookieHeader.match(
            /(?:^|;\s*)ulink_session=([^;]+)/
        );

    if (!sessionSecret || !match) {
        return res.status(200).json({
            authenticated: false
        });
    }

    const [value, signature] =
        decodeURIComponent(match[1]).split(".");

    const expectedSignature =
        sign(value, sessionSecret);

    const authenticated =
        value === "ulink-authenticated" &&
        signature === expectedSignature;

    return res.status(200).json({
        authenticated
    });
}