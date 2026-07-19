const express = require("express");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 3000;

/*
|--------------------------------------------------------------------------
| INTENTIONALLY HARDCODED SECRET
|--------------------------------------------------------------------------
| This is included ONLY for demonstrating secret scanning tools.
| Never hardcode secrets in production applications.
|--------------------------------------------------------------------------
*/
const API_KEY = "THIS_IS_A_DEMO_SECRET_DO_NOT_USE";

/*
|--------------------------------------------------------------------------
| SQLite In-Memory Database
|--------------------------------------------------------------------------
*/

const db = new sqlite3.Database(":memory:");

db.serialize(() => {
    db.run(`
        CREATE TABLE users (
            id INTEGER PRIMARY KEY,
            name TEXT
        )
    `);

    db.run(`INSERT INTO users(name) VALUES ('Alice')`);
    db.run(`INSERT INTO users(name) VALUES ('Bob')`);
    db.run(`INSERT INTO users(name) VALUES ('Charlie')`);
});

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
    res.send("🛡️ Secure GitHub Pipeline Demo Application");
});

app.get("/users", (req, res) => {
    db.all("SELECT * FROM users", (err, rows) => {
        if (err) {
            return res.status(500).json(err);
        }

        res.json(rows);
    });
});

/*
|--------------------------------------------------------------------------
| INTENTIONALLY VULNERABLE SQL QUERY
|--------------------------------------------------------------------------
| This endpoint intentionally uses string concatenation to demonstrate
| SQL Injection detection by Semgrep.
|--------------------------------------------------------------------------
*/

app.get("/user", (req, res) => {

    const id = req.query.id;

    db.all(
        "SELECT * FROM users WHERE id = " + id,
        (err, rows) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json(rows);

        }
    );

});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});