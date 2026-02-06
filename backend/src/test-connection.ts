import { prisma } from "./lib/prisma";

async function main() {
  try {
    console.log("Connecting to database...");
    // Attempt a simple query
    const userCount = await prisma.user.count();
    console.log(`Successfully connected! User count: ${userCount}`);
    process.exit(0);
  } catch (e) {
    console.error("Connection failed:", JSON.stringify(e, null, 2));
    process.exit(1);
  }
}

main();
