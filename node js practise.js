const express = require("express");
const path = require("path");

const {
    open
} = require("sqlite");
const sqlite3 = require("sqlite3");
const dbpath = path.join(__dirname, "cricketTeam.db");

const app = express();

app.use(express.json());

let db = null;

const initilizeDBAndServer = async () => {
    try {
        db = await open({
            fileName: dbpath,
            driver: squlite3.Database,
        });
        app.listen(3000, () => {
            console.log("Server Running at http://localhost:3000/");
        });
    } catch (e) {
        console.log(`DB Error: ${e.message}`);
        process.exit(1);
    }
};

initilizeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
    return {
        playerId: dbObject.player_id,
        playerName: dbObject.player_name,
        jerseyNumber: dbObject.jersey_number,
        role: dbObject.role,
    };
};

app.get("/players/", async (request, response) => {
    const getPlayerQuery = `SELECT 
    *
    FROM 
    cricket_team;`;
    const playersArray = await db.all(getPlayerQuery);
    response.send(
        playersArray.map((eachPlayer) =>
            convertDbObjectToResponseObject(eachPlayer)
        )
    );
});

app.get("/players/:playerId/", async (request, response) => {
    const {
        playerId
    } = request.params;
    const getPlayerQuery = `
    SELECT 
    *
    FROM 
    cricket_team
    WHERE 
    player_id = ${playerId};`;
    const player = await db.get(getPlayerQuery);
    response.send(convertDbObjectToResponseObject(player));
});

app.post("/players/", async (request, response) => {
    const {
        playerName,
        jerseyNumber,
        role
    } = request.body;
    const postPlayerQuery = `
    INSERT INTO 
    cricket_team (player_name, jersey_number, role)
    VALUES 
    ("${playerName}",${jerseyNumber},"${role}");`;
    const player = await db.run(postPlayerQuery);
    response.send("Player Added to team");
});

app.put("/players/:playerId/", async (request, response) => {
    const {
        playerName,
        jerseyNumber,
        role
    } = request.body;
    const {
        playerId
    } = request.params;
    const putPlayerQuery = `
    UPDATE 
    cricket_team
    SET 
    player_name = "${playerName}",
    jersey_number = ${jerseyNumber},
    role = "${role}"
    WHERE 
    player_id = ${playerId};`;
    await db.run(putPlayerQuery);
    response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (resquest, response) => {
    const {
        playerId
    } = request.params;
    const deletePlayerQuery = `
    DELETE FROM 
    cricket_team
    WHERE
    player_id = ${playerId};`;
    await db.run(deletePlayerQuery);
    response.send("player Removed");
});

module.exports = app;