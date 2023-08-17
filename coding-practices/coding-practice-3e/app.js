const express = require("express");
const app = express();

app.get("/", (req, res) => {
  let date = new Date();
  let finalDate = `${date.getDate()}-${
    date.getMonth() + 1
  }-${date.getFullYear()}`;
  console.log(finalDate);
  res.send(finalDate);
});

app.listen(3000);
module.exports = app;
