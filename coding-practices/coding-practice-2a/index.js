var addDays = require("date-fns/addDays");
function retday(days) {
  const date = addDays(new Date(2020, 7, 22), days);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const dd = date.getDate();
  const finalDate = dd + "-" + month + "-" + year;
  return finalDate;
}
module.exports = retday;
