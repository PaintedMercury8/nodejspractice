const express = require("express");
const app = express();
app.use(express.json());
const path = require("path");
const dbPath = path.join(__dirname, "covid19IndiaPortal.db");

const { open } = require("sqlite");
const sqLite3 = require("sqLite3");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

let db;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqLite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running Successfully on port 3000");
    });
  } catch (error) {
    console.log(error.message);
    process.exit(-1);
  }
};

initializeDBAndServer();

const authenticateToken = (request, response, next) => {
  const tokenHeader = request.headers["authorization"];
  let jwtToken;
  if (tokenHeader === undefined) {
    response.status(401);
    response.send("Invalid JWT Token");
  } else {
    jwtToken = tokenHeader.split(" ")[1];
    jwt.verify(jwtToken, "SECRET", (error, payload) => {
      if (error) {
        response.status(401);
        response.send("Invalid JWT Token");
      } else {
        next();
      }
    });
  }
};

//Api 1//

app.post("/login/", async (request, response) => {
  const { username, password } = request.body;
  const userQuery = `select * from user where username = '${username}';`;
  const userResult = await db.get(userQuery);
  if (userResult === undefined) {
    response.status(400);
    response.send("Invalid user");
  } else {
    const comparePassword = await bcrypt.compare(password, userResult.password);
    console.log(comparePassword);
    if (comparePassword === false) {
      response.status(400);
      response.send("Invalid password");
    } else {
      const payload = {
        username: username,
      };
      const jwtToken = jwt.sign(payload, "SECRET");
      response.send({ jwtToken });
    }
  }
});

//Api 2//
app.get("/states/", authenticateToken, async (request, response) => {
  const stateQuery = `select state_id as stateId,state_name as stateName,population from state`;
  const result = await db.all(stateQuery);
  response.send(result);
});

//Api 3//
app.get("/states/:stateId/", authenticateToken, async (request, response) => {
  const { stateId } = request.params;
  const getQuery = `select state_id as stateId,state_name as stateName,population from state where state_id = ${stateId};`;
  const result = await db.get(getQuery);
  response.send(result);
});

//APi 4//
app.post("/districts/", authenticateToken, async (request, response) => {
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  console.log(districtName, stateId, cases, cured, active, deaths);
  const insertQuery = `INSERT INTO district (district_name,state_id,cases,cured,active,deaths) 
  VALUES
  ('${districtName}',${stateId},${cases},${cured},${active},${deaths});`;
  const result = await db.run(insertQuery);
  console.log(result);
  response.send("District Successfully Added");
});

//Api 5//

app.get(
  "/districts/:districtId",
  authenticateToken,
  async (request, response) => {
    const { districtId } = request.params;
    const getDistrict = `select district_id as districtId,district_name as districtName,state_id as stateId,cases,cured,active,deaths from district
  where district_id = ${districtId};`;
    const result = await db.get(getDistrict);
    response.send(result);
  }
);

//Api 6//

app.delete(
  "/districts/:districtId",
  authenticateToken,
  async (request, response) => {
    const { districtId } = request.params;
    const deleteDistrict = `delete from district where district_id = ${districtId};`;
    await db.run(deleteDistrict);
    response.send("District Removed");
  }
);

//Api 7//
app.put(
  "/districts/:districtId",
  authenticateToken,
  async (request, response) => {
    const { districtId } = request.params;
    const {
      districtName,
      stateId,
      cases,
      cured,
      active,
      deaths,
    } = request.body;
    const updateQuery = `UPDATE district SET 
  district_name = '${districtName}',
  state_id = ${stateId},
  cases = ${cases},
  cured = ${cured},
  active = ${active},
  deaths = ${deaths}

  WHERE
  district_id = ${districtId};
  `;
    await db.run(updateQuery);
    response.send("District Details Updated");
  }
);

//Api 8//

app.get(
  "/states/:stateId/stats/",
  authenticateToken,
  async (request, response) => {
    const { stateId } = request.params;
    const getQuery = `select sum(cases) as totalCases,sum(cured) as totalCured,sum(active) as totalActive,sum(deaths) as totalDeaths from district
  where state_id = ${stateId};
  `;
    const result = await db.get(getQuery);
    response.send(result);
  }
);

module.exports = app;
