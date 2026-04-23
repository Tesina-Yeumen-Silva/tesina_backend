import { JwtPayload } from "../utils/jwt.js";

declare global {
    namespace Express {
        interface User extends JwtPayload {
            token?: string;
            refreshToken?: string;
        }
    }
}