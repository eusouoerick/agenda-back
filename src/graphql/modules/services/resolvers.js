const { ApolloError } = require("apollo-server-express");
const Service = require("../../../models/Service");
const Schedules = require("../../../models/Schedules");

module.exports = {
  Query: {
    services: async () => await Service.find(),
    getService: async (_, { id }) => await Service.findById(id),
    servicesBySchedules: async () => {
      const schedules = await Schedules.find();
      const list = [];
      schedules.map(({ service: { _id, name } }) => {
        if (!list.some((item) => item.name === name)) {
          list.push({ _id, name });
        }
      });
      return list;
    },
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
