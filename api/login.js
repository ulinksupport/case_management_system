import crypto from "crypto";

function sign(value, secret) {
    return crypto
        .createHmac("sha256", secret)
        .update(value)
        .digest("hex");
}

export default function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            success: false
        });
    }

    const password =
        String(req.body?.password || "");

    const expectedPassword =
        process.env.CMS_LOGIN_PASSWORD;

    const sessionSecret =
        process.env.CMS_SESSION_SECRET;

    if (
        !expectedPassword ||
        !sessionSecret ||
        password !== expectedPassword
    ) {
        return res.status(401).json({
            success: false,
            message: "Incorrect password."
        });
    }

    const sessionValue =
        "ulink-authenticated";

    const signature =
        sign(sessionValue, sessionSecret);

    const cookieValue =
        `${sessionValue}.${signature}`;

    res.setHeader(
        "Set-Cookie",
        [
            `ulink_session=${cookieValue}`,
            "HttpOnly",
            "Secure",
            "SameSite=Lax",
            "Path=/",
            "Max-Age=28800"
        ].join("; ")
    );

    return res.status(200).json({
        success: true
    });
}