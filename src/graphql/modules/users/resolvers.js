const { ApolloError } = require("apollo-server-express");
const User = require("../../../models/User");
const Schedules = require("../../../models/Schedules");

module.exports = {
  User: {
    schedules: async (parent) => await Schedules.find({ createdBy: parent._id }),
  },
  Query: {
    login: async (_, data) => {
      let field = +data.contact ? "phone" : "email";
      const user = await User.findOne({ [field]: data[field] });
      if (!user) throw new ApolloError("Invalid credentials", "401");
      if (!user.comparePassword(data.password)) {
        throw new ApolloError("Invalid credentials", "401");
      }
      return user.createToken();
    },
    users: async () => await User.find(),
    getUser: async (_, { id }) => await User.findById(id),
  },
  Mutation: {
    createUser: async (_, { data }) => {
      if (!data.name || !(data.email || data.phone) || !data.password) {
        throw new ApolloError("Please fill all the fields", "400");
      }
      return (await User.create(data)).createToken();
    },
    updateUser: async (_, { id, data }) => {
      return await User.findByIdAndUpdate(id, data, { new: true });
    },
    deleteUser: async (_, { id }) => !!(await User.findByIdAndDelete(id)),
  },
};