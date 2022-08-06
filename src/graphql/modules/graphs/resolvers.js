const Schedules = require("../../../models/Schedules");
const User = require("../../../models/User");
const { toArray, lastSevenDays } = require("./helpers");

module.exports = {
  Query: {
    graphUsers: async () => {
      const dates = lastSevenDays();
      const users = await User.find({
        createdAt: {
          ...dates,
        },
      });
      return toArray({ list: users, field: "createdAt" });
    },
    graphMoney: async () => {
      const dates = lastSevenDays();
      const schedules = await Schedules.find({
        date: {
          ...dates,
        },
        status: { $eq: "completed" },
      });
      return toArray({ list: schedules, field: "date", type: "money" });
    },
    graphSchedules: async () => {
      const dates = lastSevenDays();
      const schedules = await Schedules.find({
        createdAt: {
          ...dates,
        },
      });
      return toArray({ list: schedules, field: "createdAt" });
    },
    graphServices: async () => {
      const schedules = await Schedules.find({});
      const counter = schedules.reduce((acc, curr) => {
        acc[curr.service.name] = acc[curr.service.name] + 1 || 1;
        return acc;
      }, {});

      return Object.keys(counter).map((key) => {
        return {
          name: key,
          count: counter[key],
        };
      });
    },
  },
};
