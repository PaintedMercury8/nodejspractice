var addDays = require("date-fns/addDays");
const express = require("express");
const app = express();

app.get("/", (request, response) => {
  let days = addDays(new Date(), 100);
  response.send(
    `${days.getDate()}/${days.getMonth() + 1}/${days.getFullYear()}`
  );
});

app.listen(3000);
module.exports = app;
