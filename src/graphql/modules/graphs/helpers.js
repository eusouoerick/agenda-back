const { format, compareAsc, parseISO } = require("date-fns");

// toArray ~> vai receber a lista de todos os agendamentos nos últimos 7 dias e vai organizar
// em um objeto com as datas como chaves e quantidade de agendamentos como valor. E vai retornar
// um array de objetos com:
// • datas = name;
// • quantidade = count;
const toArray = ({ list, field, type } /* createdAt ou date*/) => {
  const { year } = getDates();

  const obj = list.reduce((acc, cur) => {
    const date = format(cur[field], "dd/MM");
    const value = type === "money" ? cur.service.price : 1;
    acc[date] = acc[date] + value;
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
      const A_Date = new Date(year, a.name.slice(3, 5) - 1, a.name.slice(0, 2));
      const B_Date = new Date(year, b.name.slice(3, 5) - 1, b.name.slice(0, 2));
      return compareAsc(A_Date, B_Date);
    });
};

const datesObj = () => {
  // retorna um objetos com os últimos 7 dias
  const { day, month, year } = getDates();
  const obj = {};

  for (let i = 1; i <= 7; i++) {
    const dat = format(new Date(year, month, day - i), "dd/MM");
    obj[dat] = 0;
  }
  return obj;
};

const getDates = () => {
  const date = new Date();
  return { day: date.getDate(), month: date.getMonth(), year: date.getFullYear() };
};

const lastSevenDays = () => {
  const { day, month, year } = getDates();
  return {
    $gte: new Date(year, month, day - 7),
    $lte: new Date(year, month, day - 1),
  };
};

module.exports = {
  toArray,
  datesObj,
  getDates,
  lastSevenDays,
};
