const path = require("path");
const { loadFilesSync } = require("@graphql-tools/load-files");
const { mergeResolvers } = require("@graphql-tools/merge");

const resolversArray = loadFilesSync(path.join(__dirname, "./resolvers"));

module.exports = mergeResolvers(resolversArray);
