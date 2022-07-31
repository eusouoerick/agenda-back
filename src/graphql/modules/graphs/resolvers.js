const Schedules = require("../../../models/Schedules");
const User = require("../../../models/User");
const { format, compareAsc } = require("date-fns");

// toArray ~> vai receber a lista de todos os agendamentos nos últimos 7 dias e vai organizar
// em um objeto com as datas como chaves e quantidade de agendamentos como valor. E vai retornar
// um array de objetos com: 
// • datas = name; 
// • quantidade = count;
const toArray = (list, field /* createdAt ou date*/) => {
  const year = new Date().getFullYear();

  const obj = list.reduce((acc, cur) => {
    const date = format(cur[field], "dd/MM");
    acc[date] = acc[date] + 1;
    return acc;
  }, datesObj());

  return Object.keys(obj)
    .map((key) => {
      return {
        name: key,
        count: obj[key],
      };
    })
    .sort((a, b) => {
      const A_Date = new Date(a.name.slice(0, 2), a.name.slice(3, 5) - 1, year);
      const B_Date = new Date(b.name.slice(0, 2), b.name.slice(3, 5) - 1, year);
      return compareAsc(A_Date, B_Date);
    });
};

const datesObj = () => {
  // retorna um objetos com os últimos 7 dias
  const obj = {};
  for (let i = 1; i <= 7; i++) {
    const dat = format(
      new Date(new Date().setDate(new Date().getDate() - i)),
      "dd/MM"
    );
    obj[dat] = 0;
  }
  return obj;
};

module.exports = {
  Query: {
    graphUsers: async () => {
      const users = await User.find({
        createdAt: {
          $gte: new Date(new Date().setDate(new Date().getDate() - 7)),
          $lte: new Date(new Date().setDate(new Date().getDate())),
        },
      });
      return toArray(users, "createdAt");
    },
    graphMoney: async () => {
      const schedules = await Schedules.find({
        date: {
          $gte: new Date(new Date().setDate(new Date().getDate() - 7)),
          $lte: new Date(new Date().setDate(new Date().getDate()) - 1),
        },
        status: { $eq: "completed" },
      });
      return toArray(schedules, "date");
    },
    graphSchedules: async () => {
      const schedules = await Schedules.find({
        createdAt: {
          $gte: new Date(new Date().setDate(new Date().getDate() - 7)),
          $lte: new Date(new Date().setDate(new Date().getDate())),
        },
      });
      return toArray(schedules, "createdAt");
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
