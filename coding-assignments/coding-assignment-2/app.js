const express = require("express");
const app = express();

app.use(express.json());

const { open } = require("sqlite");
const sqLite3 = require("sqlite3");

const path = require("path");
const dbPath = path.join(__dirname, "twitterClone.db");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

let db;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqLite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  } catch (error) {
    console.log(error.message);
    process.exit(-1);
  }
};

initializeDbAndServer();

const authenticateUser = (request, response, next) => {
  const jwtTokenHeader = request.headers["authorization"];
  if (jwtTokenHeader === undefined) {
    response.status(401);
    response.send("Invalid JWT Token");
  } else {
    const jwtToken = jwtTokenHeader.split(" ")[1];
    jwt.verify(jwtToken, "SECRET", (error, payload) => {
      if (error) {
        response.status(401);
        response.send("Invalid JWT Token");
      } else {
        request.payloadUserId = payload.user_id;
        next();
      }
    });
  }
};

//Api 1//
app.post("/register/", async (request, response) => {
  const { username, password, name, gender } = request.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const selectUser = `select * from user where username = '${username}';`;
  const result = await db.get(selectUser);
  console.log(result);
  if (result === undefined) {
    if (password.length < 6) {
      response.status(400);
      response.send("Password is too short");
    } else {
      const insertQuery = `insert into user (name,username,password,gender)
        VALUES(
            '${name}',
            '${username}',
            '${hashedPassword}',
            '${gender}'
        )`;
      const insertResult = await db.run(insertQuery);
      response.status(200);
      response.send("User created successfully");
    }
  } else {
    response.status(400);
    response.send("User already exists");
  }
});

//Api 2//
app.post("/login/", async (request, response) => {
  const { username, password } = request.body;
  const accCheckQuery = `select * from user where username = '${username}';`;
  const result = await db.get(accCheckQuery);
  console.log(result);
  if (result === undefined) {
    response.status(400);
    response.send("Invalid user");
  } else {
    const checkPassword = await bcrypt.compare(password, result.password);
    if (checkPassword === false) {
      response.status(400);
      response.send("Invalid password");
    } else {
      const payload = {
        user_id: result.user_id,
      };
      const jwtToken = jwt.sign(payload, "SECRET");
      console.log(jwtToken);
      response.send({ jwtToken });
    }
  }
});

//Api 3//
app.get("/user/tweets/feed/", authenticateUser, async (request, response) => {
  const userId = request.payloadUserId;
  /* user.username, tweet.tweet, tweet.date_time as dateTime */
  const getQuery = `select user.username, tweet.tweet, tweet.date_time as dateTime from (user 
  INNER JOIN follower ON user.user_id = follower.following_user_id) as T
  INNER JOIN tweet ON T.following_user_id = tweet.user_id
  WHERE follower.follower_user_id = ${userId}
  ORDER BY dateTime DESC
  LIMIT 4;`;
  const result = await db.all(getQuery);
  response.send(result);
});

//Api 4//
app.get("/user/following/", authenticateUser, async (request, response) => {
  const userId = request.payloadUserId;
  const getQuery = `select user.name from user inner join follower ON user.user_id = follower.following_user_id
    where follower.follower_user_id = ${userId};`;
  const result = await db.all(getQuery);
  response.send(result);
});

//Api 5//
app.get("/user/followers/", authenticateUser, async (request, response) => {
  const userId = request.payloadUserId;
  const getQuery = `select user.name from user inner join follower on user.user_id = follower.follower_user_id
    where follower.following_user_id = ${userId};`;
  const result = await db.all(getQuery);
  response.send(result);
});

//Api 6//
app.get("/tweets/:tweetId/", authenticateUser, async (request, response) => {
  const userId = request.payloadUserId;
  const { tweetId } = request.params;
  console.log(tweetId);
  const getQuery = `select * from (user 
  INNER JOIN follower ON user.user_id = follower.following_user_id) as T
  INNER JOIN tweet ON T.following_user_id = tweet.user_id
  WHERE follower.follower_user_id = ${userId};`;
  const result = await db.all(getQuery);
  const array = [];
  for (let each_obj of result) {
    array.push(each_obj.tweet_id);
  }
  console.log(array);
  console.log(array.includes(parseInt(tweetId)));
  if (array.includes(parseInt(tweetId)) === false) {
    response.status(401);
    response.send("Invalid Request");
  } else {
    //Below is the query to get the tweet based on tweet id //
    /* count(CASE WHEN like.like_id is NULL THEN 0 
        WHEN like.like_id is NOT NULL THEN 1 END)  */
    //Below is the query to get the tweet//
    /* select tweet.tweet, count(like.like_id)as likes,
    count(DISTINCT reply.reply_id) as replies,tweet.date_time as dateTime from tweet INNER JOIN reply ON tweet.tweet_id = reply.tweet_id
    INNER JOIN like on tweet.tweet_id = like.tweet_id where tweet.tweet_id = ${tweetId}*/
    const tweetQuery = `select tweet.tweet as tweet,count(DISTINCT like.like_id) as likes,
  count(DISTINCT reply.reply_id) as replies,tweet.date_time as dateTime from tweet
LEFT JOIN reply on tweet.tweet_id = reply.tweet_id
LEFT JOIN like on reply.tweet_id = like.tweet_id
where tweet.tweet_id = ${tweetId}
GROUP BY tweet.tweet;`;
    const tweetDetails = await db.get(tweetQuery);
    response.send(tweetDetails);
  }
});

//Api 7//
app.get(
  "/tweets/:tweetId/likes/",
  authenticateUser,
  async (request, response) => {
    const userId = request.payloadUserId;
    const { tweetId } = request.params;
    console.log(tweetId);
    const getQuery = `select * from (user 
  INNER JOIN follower ON user.user_id = follower.following_user_id) as T
  INNER JOIN tweet ON T.following_user_id = tweet.user_id
  WHERE follower.follower_user_id = ${userId};`;
    const result = await db.all(getQuery);
    const array = [];
    for (let each_obj of result) {
      array.push(each_obj.tweet_id);
    }
    console.log(array);
    console.log(array.includes(parseInt(tweetId)));
    if (array.includes(parseInt(tweetId)) === false) {
      response.status(401);
      response.send("Invalid Request");
    } else {
      const getUserNameLikes = `select user.username from user inner join like on user.user_id = like.user_id 
        where tweet_id = ${tweetId}`;
      const getUsers = await db.all(getUserNameLikes);
      let arrLikes = [];
      for (let each_obj of getUsers) {
        arrLikes.push(each_obj.username);
      }
      const likesObj = {
        likes: arrLikes,
      };
      response.send(likesObj);
    }
  }
);

//Api 8//
app.get(
  "/tweets/:tweetId/replies",
  authenticateUser,
  async (request, response) => {
    const userId = request.payloadUserId;
    const { tweetId } = request.params;
    console.log(tweetId);
    const getQuery = `select * from (user 
  INNER JOIN follower ON user.user_id = follower.following_user_id) as T
  INNER JOIN tweet ON T.following_user_id = tweet.user_id
  WHERE follower.follower_user_id = ${userId};`;
    const result = await db.all(getQuery);
    const array = [];
    for (let each_obj of result) {
      array.push(each_obj.tweet_id);
    }
    console.log(array);
    console.log(array.includes(parseInt(tweetId)));
    if (array.includes(parseInt(tweetId)) === false) {
      response.status(401);
      response.send("Invalid Request");
    } else {
      const replyTweetQuery = `select user.name as name, reply.reply as reply from user inner join reply on user.user_id = reply.user_id 
        where reply.tweet_id = ${tweetId};`;
      const tweetResult = await db.all(replyTweetQuery);
      const tweetArr = [];
      for (let each_item of tweetResult) {
        tweetArr.push(each_item);
      }
      const tweetObj = {
        replies: tweetArr,
      };
      response.send(tweetObj);
    }
  }
);

//Api 9//
app.get("/user/tweets/", authenticateUser, async (request, response) => {
  const userId = request.payloadUserId;
  //Below is the query to get the tweet//
  /* `select tweet.tweet,count(like.like_id) as likes,count(DISTINCT reply.reply_id) as replies,tweet.date_time as dateTime 
  from tweet inner join reply on tweet.tweet_id = reply.tweet_id
     join like on tweet.user_id = like.user_id where tweet.user_id = ${userId}
    GROUP BY tweet.tweet_id;` */
  const tweetQuery = `select tweet.tweet as tweet,count(DISTINCT like.like_id) as likes,
  count(DISTINCT reply.reply_id) as replies,tweet.date_time as dateTime from tweet
LEFT JOIN reply on tweet.tweet_id = reply.tweet_id
LEFT JOIN like on reply.tweet_id = like.tweet_id
where tweet.user_id = ${userId}
GROUP BY tweet.tweet,tweet.tweet_id;`;
  const result = await db.all(tweetQuery);
  response.send(result);
});

//Api 10//
app.post("/user/tweets/", authenticateUser, async (request, response) => {
  const userId = request.payloadUserId;
  const { tweet } = request.body;
  console.log(userId);
  const postQuery = ` insert into tweet(tweet,user_id) VALUES ('${tweet}',${userId});`;
  const result = await db.run(postQuery);
  console.log(result);
  response.send("Created a Tweet");
});

//Api 11//
app.delete("/tweets/:tweetId/", authenticateUser, async (request, response) => {
  const userId = request.payloadUserId;
  const { tweetId } = request.params;
  const tweet = `select tweet_id from tweet where user_id = ${userId}`;
  const result = await db.all(tweet);
  let tweetArr = [];
  for (each_obj of result) {
    tweetArr.push(each_obj.tweet_id);
  }
  console.log(result);
  console.log(tweetArr);
  console.log(tweetId);
  if (tweetArr.includes(parseInt(tweetId)) === false) {
    response.status(401);
    response.send("Invalid Request");
  } else {
    const removeQuery = `delete from tweet where tweet_id = ${tweetId}`;
    await db.run(removeQuery);
    response.send("Tweet Removed");
  }
});

module.exports = app;
