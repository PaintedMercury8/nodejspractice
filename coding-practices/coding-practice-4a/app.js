const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
let db = null;

const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");

const sqLite3 = require("sqlite3");

const initiaizeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqLite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running successfully");
    });
  } catch (error) {
    console.log(error.message);
  }
};

initiaizeDbAndServer();

const convertToCamelCase = (dbObj) => {
  return {
    playerId: dbObj.player_id,
    playerName: dbObj.player_name,
    jerseyNumber: dbObj.jersey_number,
    role: dbObj.role,
  };
};

// get players
app.get("/players/", async (request, response) => {
  const getQuery = `select * from cricket_team`;
  const resultArray = await db.all(getQuery);
  const finalArray = resultArray.map((each_item) => {
    return convertToCamelCase(each_item);
  });
  response.send(finalArray);
});

//add player

app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const postQuery = `INSERT INTO cricket_team (player_name,jersey_number,role)
    VALUES(
        '${playerName}',
        ${jerseyNumber},
        '${role}'
    );`;

  const dbResponse = await db.run(postQuery);
  const playerID = dbResponse.lastID;
  response.send("Player Added to Team");
});

// get player

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getQuery = `select * from cricket_team where player_id = ${playerId}`;
  const getResponse = await db.get(getQuery);
  const finalObj = convertToCamelCase(getResponse);
  response.send(finalObj);
});

// update player

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;
  console.log(playerId);
  console.log(playerName, jerseyNumber, role);
  const putQuery = `update 
  cricket_team
  SET
  player_name='${playerName}',
  jersey_number=${jerseyNumber},
  role='${role}'
  WHERE
    player_id=${playerId}
  `;

  await db.run(putQuery);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteQuery = `delete from cricket_team where player_id = ${playerId}`;
  await db.run(deleteQuery);
  response.send("Player Removed");
});

module.exports = app;
