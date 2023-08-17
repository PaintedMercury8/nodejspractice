const express = require("express");
const app = express();
app.use(express.json());

const path = require("path");
const dbPath = path.join(__dirname, "userData.db");

const { open } = require("sqLite");
const sqLite3 = require("sqLite3");

let db = null;

const bcrypt = require("bcrypt");

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqLite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

initializeDBAndServer();

//Api 1//
app.post("/register", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const userQuery = `select * from user where username = '${username}';`;
  const dbUser = await db.get(userQuery);
  if (dbUser === undefined) {
    if (password.length < 5) {
      response.status(400);
      response.send("Password is too short");
    } else {
      const createUser = `INSERT INTO user(username,name,password,gender,location)
        VALUES
        (
            '${username}',
            '${name}',
            '${hashedPassword}',
            '${gender}',
            '${location}'
        );`;
      await db.run(createUser);
      response.status(200);
      response.send("User created successfully");
    }
  } else {
    response.status(400);
    response.send(`User already exists`);
  }
});

//Api 2//

app.post("/login", async (request, response) => {
  const { username, password } = request.body;
  const checkQuery = `select * from user where username = '${username}';`;
  const checkUser = await db.get(checkQuery);
  if (checkUser === undefined) {
    response.status(400);
    response.send("Invalid user");
  } else {
    const checkPass = await bcrypt.compare(password, checkUser.password);
    if (checkPass === true) {
      response.status(200);
      response.send("Login success!");
    } else {
      response.status(400);
      response.send("Invalid password");
    }
  }
});

//Api3//

app.put("/change-password", async (request, response) => {
  const { username, oldPassword, newPassword } = request.body;
  const getUserQuery = `select * from user where username = '${username}';`;
  const result = await db.get(getUserQuery);
  const passwordCheck = await bcrypt.compare(oldPassword, result.password);
  if (passwordCheck === false) {
    response.status(400);
    response.send("Invalid current password");
  } else {
    if (newPassword.length < 5) {
      response.status(400);
      response.send("Password is too short");
    } else {
      const newHashedPassword = await bcrypt.hash(newPassword, 10);
      console.log(newHashedPassword);
      const updateQuery = `update user SET password = '${newHashedPassword}' 
      where username = '${username}';`;
      await db.run(updateQuery);
      response.status(200);
      response.send("Password updated");
    }
  }
});

module.exports = app;
