
import jwt from 'jsonwebtoken';

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET;
export function validateAccessToken() {
    return async (req, res, next) => {
        try {
            let token = req.cookies?.accessToken;
            if (!token) {
                const authHeader = req.headers['authorization'];
                if (authHeader && authHeader.startsWith('Bearer ')) {
                    token = authHeader.split(' ')[1];
                }
            }
            if (!token) {
                return res.status(401).json({ error: 'Access token missing' });
            }
            const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
            if (!decoded || typeof decoded !== "object" || !("email" in decoded)) {
                return res.status(401).json({ error: "Invalid access token" });
            }
            
            req.user = decoded;
            
            next();
        } catch (err) {
            return res.status(401).json({ error: 'Invalid or expired access token' });
        }
    };
}


export function validateRefreshToken() {
    return async (req, res, next) => {
        try {
            let token = req.cookies?.refreshToken;
            if (!token) {
                const authHeader = req.headers['authorization'];
                if (authHeader && authHeader.startsWith('Bearer ')) {
                    token = authHeader.split(' ')[1];
                }
            }

            if (!token) {
                return res.status(401).json({ error: 'Refresh token missing' });
            }

            const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET);
            if (!decoded || typeof decoded !== "object" || !("email" in decoded)) {
                return res.status(401).json({ error: "Invalid refresh token" });
            }

            req.user = decoded;

            next();
        } catch (err) {
            return res.status(401).json({ error: 'Invalid or expired refresh token' });
        }
    };
}
