const { mergeTypeDefs } = require("@graphql-tools/merge");
const { loadFilesSync } = require("@graphql-tools/load-files");
const path = require("path");

const typeDefsArray = loadFilesSync(path.join(__dirname, "modules/**/*.gql"));
const typeDefs = mergeTypeDefs(typeDefsArray);

module.exports = typeDefs;
