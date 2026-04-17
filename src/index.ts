import "dotenv/config";
import app from "./app.js";
import {prisma} from './config/prisma.js'

const main = async () => {
  try {
   
    await prisma.$connect();
    console.log('¡DB connected!');

    const port = process.env.PORT || 5000;

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });

  } catch (error) {
    console.error("DB connection failed:", error);
    process.exit(1);
  }
};

main()