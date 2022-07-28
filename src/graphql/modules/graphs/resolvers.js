const Schedules = require("../../../models/Schedules");
const Services = require("../../../models/Service");
const User = require("../../../models/User");

module.exports = {
  Query: {
    graphServices: async () => {
      const schdulesList = await Schedules.find({});
      const servicesList = await Services.find({});
      const counter = schdulesList.reduce((acc, curr) => {
        acc[curr.service] = acc[curr.service] + 1 || 1;
        return acc;
      }, {});
      const toArray = Object.keys(counter).map((key) => {
        const name = servicesList.find((item) => item._id == key).name;
        return {
          service: name,
          count: counter[key],
        };
      });
      return toArray;
    },
  },
};
