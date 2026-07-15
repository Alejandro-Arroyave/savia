import SchemaBuilder from "@pothos/core";
import PrismaPlugin from "@pothos/plugin-prisma";
import type PrismaTypes from "@pothos/plugin-prisma/generated";
import { DateResolver, DateTimeResolver } from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { prisma } from "./prisma.js";
import type { Context } from "./context.js";

export const builder = new SchemaBuilder<{
  Context: Context;
  PrismaTypes: PrismaTypes;
  Scalars: {
    Date: { Input: Date; Output: Date };
    DateTime: { Input: Date; Output: Date };
  };
}>({
  plugins: [PrismaPlugin],
  prisma: { client: prisma, dmmf: Prisma.dmmf },
});

builder.addScalarType("Date", DateResolver);
builder.addScalarType("DateTime", DateTimeResolver);

builder.queryType({});
builder.mutationType({});
