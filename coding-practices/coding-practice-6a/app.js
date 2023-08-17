const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqLite");
let db = null;

const path = require("path");
const dbPath = path.join(__dirname, "covid19India.db");
const sqLite3 = require("sqLite3");

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqLite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running");
    });
  } catch (error) {
    console.log(error.message);
  }
};
initializeDbAndServer();
//Api 1//
app.get("/states/", async (request, response) => {
  const getQuery = `select state_id as stateId,state_name as stateName,population from state;`;
  const arr = await db.all(getQuery);
  response.send(arr);
});
//Api 2//
app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getQuery = `select state_id as stateId,state_name as stateName,population from state where stateId = ${stateId}`;
  const result = await db.get(getQuery);
  response.send(result);
});

//Api 3//
app.post("/districts/", async (request, response) => {
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const postQuery = `INSERT INTO district (district_name,state_id,cases,cured,active,deaths) 
  VALUES('${districtName}',${stateId},${cases},${cured},${active},${deaths});`;
  const id = await db.run(postQuery);
  response.send("District Successfully Added");
});

//API 4//
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getQuery = `select district_id as districtId,district_name as districtName,state_id as stateId,cases,cured,active,deaths 
  from district where districtId = ${districtId};`;
  const result = await db.get(getQuery);
  response.send(result);
});

//API 5//
app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const delQuery = `delete from district where district_id = ${districtId}`;
  await db.run(delQuery);
  response.send("District Removed");
});

//Api 6//

app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;

  const { districtName, stateId, cases, cured, active, deaths } = request.body;

  const putQuery = `update district 
    SET 
    district_name = '${districtName}',
    state_id = ${stateId},
    cases = ${cases},
    cured = ${cured},
    active = ${active},
    deaths = ${deaths}
    where
    district_id = ${districtId};
    `;
  await db.run(putQuery);
  response.send("District Details Updated");
});

//Api 7//
app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const query = `select sum(cases) as totalCases, sum(cured) as totalCured, sum(active) as totalActive,sum(deaths) as totalDeaths 
    from district
    where state_id = ${stateId}
    GROUP BY state_id`;
  const result = await db.get(query);
  response.send(result);
});

//Api 8//
app.get("/districts/:districtId/details/", async (request, response) => {
  try {
    const { districtId } = request.params;
    const query = `select state_name as stateName from state
    INNER JOIN district ON state.state_id = district.state_id
    where district.district_id = ${districtId};`;
    const result = await db.get(query);
    response.send(result);
  } catch (error) {
    console.log(error);
  }
});

module.exports = app;
