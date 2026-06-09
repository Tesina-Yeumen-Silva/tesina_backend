import { JwtPayload } from "./auth.js";

declare global {
    namespace Express {
        interface User extends JwtPayload {
            token?: string;
            refreshToken?: string;
        }
    }
}