const express = require("express");
const app = express();
app.use(express.json());

const { open } = require("sqlite");
const sqLite3 = require("sqlite3");

let db = null;

const path = require("path");

const dbPath = path.join(__dirname, "moviesData.db");

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqLite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Has Started");
    });
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get("/movies/", async (request, response) => {
  const getQuery = `select movie_name as movieName from movie;`;
  const dataArray = await db.all(getQuery);
  response.send(dataArray);
});

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;

  const postQuery = `insert into movie (director_id,movie_name,lead_actor) VALUES (${directorId},'${movieName}','${leadActor}')`;
  const addResponse = await db.run(postQuery);
  const added = addResponse.lastID;
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const responseQuery = `select movie_id as movieId,director_id as directorId,movie_name as movieName,lead_actor as leadActor from movie where movie_id = ${movieId};`;
  const result = await db.get(responseQuery);
  response.send(result);
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const putQuery = `update movie SET director_id = ${directorId},movie_name = '${movieName}',lead_actor = '${leadActor}' where movie_id = ${movieId};`;
  await db.run(putQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const delQuery = `delete from movie where movie_id = ${movieId};`;
  await db.run(delQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const dirQuery = `select director_id as directorId, director_name as directorName from director;`;
  const dirArr = await db.all(dirQuery);
  response.send(dirArr);
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const dirQuery = `select movie_name as movieName from movie where director_id = ${directorId};`;
  const result = await db.all(dirQuery);
  response.send(result);
});

module.exports = app;
