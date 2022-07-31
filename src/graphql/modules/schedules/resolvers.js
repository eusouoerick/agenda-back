const { ApolloError } = require("apollo-server-express");
const User = require("../../../models/User");
const Service = require("../../../models/Service");
const Schedules = require("../../../models/Schedules");
const {
  isSameMonth,
  isSameYear,
  isBefore,
  isAfter,
  isToday,
  compareAsc,
  compareDesc,
  isSameDay,
} = require("date-fns");

module.exports = {
  Schedules: {
    createdBy: async (parent) => await User.findById(parent.createdBy),
    date: (parent) => new Date(parent.date).toUTCString(),
  },
  Query: {
    getSchedule: async (_, { id }) => await Schedules.findById(id),
    schedulesByUser: async (_, { id }) => await Schedules.find({ createdBy: id }),
    // ----------------------------------------------------------------------------
    schedules: async (_, { date, page, service }, { req: { user } }) => {
      let list = []; // will be replaced by the list of schedules
      let sameMonth = []; // schedules pending in the same month
      let pendingSchedules = []; // schedules in the future
      let oldSchedules = []; // schedules in the past

      if (user.adm) {
        list = await Schedules.find();
      } else {
        list = await Schedules.find({ createdBy: user.id });
      }

      if (service && service !== "all") {
        list = list.filter((item) => item.service._id.toString() === service);
      }

      // organize schedules
      list.map((i) => {
        if (date) {
          // remove os "-" e "/" do date
          const toDate = new Date(
            date.slice(0, 4),
            date.slice(5, 7) - 1,
            date.slice(8, 10)
          );
          if (isSameDay(i.date, toDate)) {
            sameMonth.push(i);
          }
        } else {
          if (isSameMonth(i.date, new Date()) && isSameYear(i.date, new Date())) {
            if (isToday(i.date)) {
              sameMonth.push(i);
            } else if (isBefore(i.date, new Date())) {
              oldSchedules.push(i);
            } else {
              sameMonth.push(i);
            }
          } else if (isAfter(i.date, new Date())) {
            pendingSchedules.push(i);
          } else {
            oldSchedules.push(i);
          }
        }
      });

      const limit = 5;
      const skip = ((page || 1) - 1) * limit;
      return [
        ...sameMonth.sort((a, b) => compareAsc(a.date, b.date)),
        ...pendingSchedules.sort((a, b) => compareAsc(a.date, b.date)),
        ...oldSchedules.sort((a, b) => compareDesc(a.date, b.date)),
      ]
        .slice(skip)
        .slice(0, limit);
    },
  },
  Mutation: {
    createSchedule: async (_, { data }, { req: { user }, checkUser }) => {
      checkUser(user.id);
      if (!data.service || !data.date) {
        throw new ApolloError("Please fill all the fields", "400");
      }
      const checkDate = await Schedules.findOne({
        date: new Date(data.date).toUTCString(),
      });
      if (checkDate) throw new ApolloError("This date is already booked", "400");

      const service = await Service.findById(data.service);
      service.description = undefined;
      const schedule = await Schedules.create({
        ...data,
        createdBy: user.id,
        service,
      });
      await User.findByIdAndUpdate(schedule.createdBy, {
        $addToSet: { schedules: schedule._id },
      });

      // Se o status estiver como pendente depois da data do agendamento
      // vai ser alterado para cancelado
      const timeToCheck = Math.abs(new Date() - new Date(schedule.date)) + 7200000;
      setTimeout(async () => {
        const scheduleToChange = await Schedules.findById(schedule._id);
        if (scheduleToChange.status === "pending") {
          await Schedules.findByIdAndUpdate(scheduleToChange._id, {
            status: "cancelled",
          });
        }
      }, timeToCheck);

      return schedule;
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
