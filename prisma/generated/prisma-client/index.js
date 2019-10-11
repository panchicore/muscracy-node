"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var prisma_lib_1 = require("prisma-client-lib");
var typeDefs = require("./prisma-schema").typeDefs;

var models = [
  {
    name: "User",
    embedded: false
  },
  {
    name: "Radio",
    embedded: false
  },
  {
    name: "RadioUser",
    embedded: false
  },
  {
    name: "MediaItem",
    embedded: false
  },
  {
    name: "MediaItemStatus",
    embedded: false
  }
];
exports.Prisma = prisma_lib_1.makePrismaClientClass({
  typeDefs,
  models,
  endpoint: `https://us1.prisma.sh/luis-pallares-6b9a78/musicracy/dev`
});
exports.prisma = new exports.Prisma();
