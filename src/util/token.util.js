import jwt from 'jsonwebtoken'

export function generateAccessToken(userId, email, role) {
    const payload = { userId, email, role };
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
        expiresIn: "15m"
    })
}

export function generateRefreshToken(userId, email, role) {
    const payload = { userId, email, role }
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
        expiresIn: "30d"
    })
}
