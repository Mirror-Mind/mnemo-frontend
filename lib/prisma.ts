import { PrismaClient } from "@prisma/client";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient };
// Create a new PrismaClient instance with connection pooling configuration
const createPrismaClient = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: `${process.env.DATABASE_URL}${
          process.env.DATABASE_URL?.includes("?") ? "&" : "?"
        }connection_limit=5&pool_timeout=20`,
      },
    },
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
};

// Export a singleton instance of PrismaClient
export const prisma = globalForPrisma.prisma || createPrismaClient();

// Prevent multiple instances during hot reloading in development
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
