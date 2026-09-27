import 'dotenv/config';

export const config = {
db: process.env.DATABASE_URL,
jwtSecret: process.env.JWT_SECRET,
sessionSecret: process.env.SESSION_SECRET,
port: process.env.PORT || 3000,
};