const { ApolloError } = require("apollo-server-express");
const User = require("../../../models/User");
const Schedules = require("../../../models/Schedules");

module.exports = {
  User: {
    schedules: async (parent) => await Schedules.find({ createdBy: parent._id }),
    contact: (parent) => {
      const { email, phone, contact } = parent;
      return contact === "email" ? email : phone;
    },
  },
  Query: {
    login: async (_, { data }, { checkField }) => {
      if (!data.contact || !data.password) {
        throw new ApolloError("Please fill all the fields", "400");
      }
      const field = checkField(data.contact);
      const user = await User.findOne({ [field]: data.contact });
      if (!user) throw new ApolloError("Invalid credentials", "401");
      if (!(await user.comparePassword(data.password))) {
        throw new ApolloError("Invalid credentials", "401");
      }
      return user.createToken();
    },
    users: async () => await User.find(),
    getUser: async (_, { id }, { req }) => {
      // se não passar o id do usuário, retorna o usuário logado
      const user = req.user;
      if (id) return await User.findById(id);
      else if (user?.id) return await User.findById(user.id);
      throw new ApolloError("Id is required", "400");
    },
  },
  Mutation: {
    createUser: async (_, { data }, { checkField }) => {
      if (!data.name || !data.contact || !data.password) {
        throw new ApolloError("Please fill all the fields", "400");
      }
      const field = checkField(data.contact);
      const userForm = {
        name: data.name,
        [field]: data.contact,
        password: data.password,
        contact: field,
      };
      return (await User.create(userForm)).createToken();
    },
    updateUser: async (_, { id, data }, { checkUser }) => {
      checkUser(id);
      return await User.findByIdAndUpdate(id, data, { new: true });
    },
    deleteUser: async (_, { id }, { checkUser }) => {
      checkUser(id);
      return !!(await User.findByIdAndDelete(id));
    },
  },
};
