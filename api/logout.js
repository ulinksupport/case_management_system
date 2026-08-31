export default function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            success: false
        });
    }

    res.setHeader(
        "Set-Cookie",
        [
            "ulink_session=",
            "HttpOnly",
            "Secure",
            "SameSite=Lax",
            "Path=/",
            "Max-Age=0"
        ].join("; ")
    );

    return res.status(200).json({
        success: true
    });
}