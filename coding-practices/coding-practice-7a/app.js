const express = require("express");
const app = express();
app.use(express.json());

let db = null;

const path = require("path");
const dbPath = path.join(__dirname, "cricketMatchDetails.db");

const { open } = require("sqLite");
const sqLite3 = require("sqLite3");

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqLite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running");
    });
  } catch (error) {
    console.log(error.message);
  }
};

initializeDBAndServer();

//Api 1//

app.get("/players/", async (request, response) => {
  const getQuery = `select player_id as playerId,player_name as playerName from player_details`;
  const result = await db.all(getQuery);
  response.send(result);
});

//Api 2//

app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const getQuery = `select player_id as playerId,player_name as playerName from player_details where playerId = ${playerId}`;
  const result = await db.get(getQuery);
  response.send(result);
});

//Api 3//
app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const getQuery = `update player_details 
    SET player_name = '${playerName}'
    where player_id = ${playerId};`;
  await db.run(getQuery);
  response.send("Player Details Updated");
});

//Api 4//
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const query = `select match_id as matchId,match,year from match_details where
    matchId = ${matchId};`;
  const result = await db.get(query);
  response.send(result);
});

//Api 5//

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const query = `select a.match_id as matchId,a.match,a.year from match_details a
    INNER JOIN player_match_score b ON b.match_id = a.match_id
    where b.player_id = ${playerId};`;
  const result = await db.all(query);
  response.send(result);
});

//Api 6//
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const query = `select a.player_id as playerId,a.player_name as playerName from player_details a
    INNER JOIN player_match_score b ON b.player_id = a.player_id
    where b.match_id = ${matchId};`;
  const result = await db.all(query);
  response.send(result);
});

//Api 7//
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const query = `select a.player_id as playerId,a.player_name as playerName,
    sum(b.score) as totalScore,sum(b.fours) as totalFours, sum(b.sixes) as totalSixes
    from player_details a
    INNER JOIN
    player_match_score b
    ON 
    b.player_id = a.player_id
    where b.player_id = ${playerId};
    group by
    b.player_id
    `;
  const result = await db.get(query);
  response.send(result);
});

module.exports = app;
