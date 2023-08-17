const express = require("express");
const app = express();
const { open } = require("sqlite");
let db = null;
const sqLite3 = require("sqlite3");
const path = require("path");

const dbFile = path.join(__dirname, "goodreads.db");

const initialiseDbAndServer = async () => {
  try {
    db = await open({
      filename: dbFile,
      driver: sqLite3.Database,
    });
    app.listen(3000, () => {
      console.log("server is running");
    });
  } catch (err) {
    console.log(err.message);
  }
};

initialiseDbAndServer();

app.get("/books/", async (request, response) => {
  const query = `select * from book order by book_id`;
  const booksArray = await db.all(query);
  response.send(booksArray);
});
