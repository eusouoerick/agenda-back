const { ApolloError } = require("apollo-server-express");
const User = require("../../../models/User");
const Service = require("../../../models/Service");
const Schedules = require("../../../models/Schedules");

module.exports = {
  Schedules: {
    createdBy: async (parent) => await User.findById(parent.createdBy),
    service: async (parent) => await Service.findById(parent.service),
    date: (parent) => new Date(parent.date).toUTCString()
  },
  Query: {
    schedules: async (_, { date }) => {
      return await Schedules.find().sort({ date: -1 });
    },
    getSchedule: async (_, { id }) => await Schedules.findById(id),
    // funções de adminstrador
    schedulesByService: async (_, { id }) => await Schedules.find({ service: id }),
    schedulesByUser: async (_, { id }) => await Schedules.find({ createdBy: id }),
  },
  Mutation: {
    createSchedule: async (_, { data }, { req: { user }, checkUser }) => {
      checkUser(user.id);
      if (!data.service || !data.date) {
        throw new ApolloError("Please fill all the fields", "400");
      }
      const schedule = await Schedules.create({ ...data, createdBy: user.id });
      await User.findByIdAndUpdate(schedule.createdBy, {
        $addToSet: { schedules: schedule._id },
      });
      return schedule;
    },
    updateSchedule: async (_, { id, data }) => {
      return await Schedules.findByIdAndUpdate(id, data, { new: true });
    },
    deleteSchedule: async (_, { id }) => {
      const deleted = !!(await Schedules.findByIdAndDelete(id));
      if (deleted) {
        await User.findByIdAndUpdate(deleted.createdBy, {
          $pull: { schedules: deleted._id },
        });
      }
      return deleted;
    },
  },
};
