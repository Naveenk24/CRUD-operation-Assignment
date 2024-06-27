const express = require("express");
const app = express();

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const dbPath = path.join(__dirname, "./cricketTeam.db");

app.use(express.json());

let db = null;

const port = 3000;

const initializeTheDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(port, () => {
      console.log(`server running at port ${port}`);
    });
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};

initializeTheDbAndServer();

// GET All Players

app.get("/players/", async (request, response) => {
  const getAllPlayers = `
        SELECT *
        FROM cricket_team;
    `;

  const playersData = await db.all(getAllPlayers);
  const convertedData = playersData.map((eachItem) => {
    return {
      playerId: eachItem.player_id,
      playerName: eachItem.player_name,
      jerseyNumber: eachItem.jersey_number,
      role: eachItem.role,
    };
  });
  response.send(convertedData);
});

// Add New Player

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { jerseyNumber, role, playerName } = playerDetails;

  const addPlayerQuery = `
    INSERT INTO cricket_team (player_name, jersey_number, role)
    VALUES ('${playerName}', ${jerseyNumber}, '${role}');
  `;

  const player = await db.run(addPlayerQuery);
  console.log(player);
  const { lastID } = player;
  console.log(lastID);
  response.send("Player Added to Team");
});

// Get a Single Player

app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const getASinglePlayerQuery = `
    SELECT *
    FROM cricket_team
    WHERE player_id = ${playerId};
  `;
  const playerDetails = await db.get(getASinglePlayerQuery);
  console.log(playerDetails);
  const convertedData = {
    playerId: playerDetails.player_id,
    playerName: playerDetails.player_name,
    jerseyNumber: playerDetails.jersey_number,
    role: playerDetails.role,
  };

  response.send(convertedData);
});

// Update a Player Details

app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const playerDetail = request.body;
  const { playerName, role, jerseyNumber } = playerDetail;
  console.log(playerDetail);
  const updatePlayerQuery = `
    UPDATE cricket_team
    SET 
        player_name = '${playerName}',
        jersey_number = ${jerseyNumber},
        role = '${role}'
    WHERE player_id = ${playerId};
  `;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

// Delete The Player Based On the Player ID

app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
    DELETE FROM cricket_team
    WHERE player_id = ${playerId};
  `;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
