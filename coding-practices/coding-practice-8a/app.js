const express = require("express");
const app = express();

const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");

const { open } = require("sqLite");
const sqLite3 = require("sqlite3");

app.use(express.json());

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqLite3.Database,
    });
    app.listen(3001, () => {
      console.log("Server is running on port 3000");
    });
  } catch (error) {
    console.log(error);
  }
};

initializeDBAndServer();
//API 1 Scenario 1//
app.get("/todos/", async (request, response) => {
  const {
    id,
    todo = "",
    priority = "",
    status = "",
    search_q = "",
  } = request.query;
  let query = "";
  console.log(priority, status, search_q);
  if (
    (priority !== "" && status === "") ||
    (priority === "" && status !== "")
  ) {
    query = `select * from todo where status = '${status}' OR priority = '${priority}' `;
  } else if (search_q !== "") {
    query = `select * from todo where todo LIKE '%${search_q}%';`;
  } else {
    query = `select * from todo where status = '${status}' AND priority = '${priority}' `;
  }
  const array = await db.all(query);
  response.send(array);
});

//API 2//
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  console.log(todoId);
  const query = `select * from todo where id = ${todoId};`;
  const result = await db.get(query);
  response.send(result);
});

//APi 3//
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const query = `INSERT INTO todo (id, todo, priority, status) 
  VALUES(${id},'${todo}','${priority}','${status}');`;
  await db.run(query);
  response.send("Todo Successfully Added");
});

//API4//
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { status = "", priority = "", todo = "" } = request.body;
  let query = "";
  let message = "";
  if (status === "" && priority === "") {
    query = `UPDATE todo SET todo = '${todo}'`;
    message = "Todo Updated";
  } else if (todo === "" && priority === "") {
    query = `UPDATE todo SET status = '${status}'`;
    message = "Status Updated";
  } else if (todo === "" && status === "") {
    query = `UPDATE todo SET priority = '${priority}'`;
    message = "Priority Updated";
  }
  await db.run(query);
  response.send(message);
});

//Api 5//
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const query = `DELETE FROM todo where id = ${todoId};`;
  await db.run(query);
  response.send("Todo Deleted");
});

module.exports = app;
