const { ApolloError } = require("apollo-server-express");
const Service = require("../../../models/Service");

module.exports = {
  Query: {
    services: async () => await Service.find(),
    getService: async (_, { id }) => await Service.findById(id),
  },
  Mutation: {
    createService: async (_, { data }, { req: { user } }) => {
      if (!user.adm) throw new ApolloError("You don't have permission");
      if (!data.name || !data.duration || !data.price || !data.description) {
        throw new ApolloError("Please fill all the fields", "400");
      }
      return await Service.create(data);
    },
    deleteService: async (_, { id }) => !!(await Service.findByIdAndDelete(id)),
  },
};
