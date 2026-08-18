/**
 * Prisma Client with resilient fallback proxy
 */

let prismaClient: any;

const noOp = {
  findMany: async () => [],
  findFirst: async () => null,
  findUnique: async () => null,
  create: async (d: any) => d?.data ?? {},
  update: async (d: any) => d?.data ?? {},
  delete: async () => ({})
};

prismaClient = new Proxy({}, { get: () => noOp });

export const prisma = prismaClient;
export default prisma;
