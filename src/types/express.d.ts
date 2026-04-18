import { JwtPayload } from "../utils/jwt.js";

import { JwtPayload } from "../utils/jwt.js";

declare global {
  namespace Express {
    interface User extends JwtPayload {}
  }
}