import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "TaskManager",
    password: "Ankit@241105",
    port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");



//pages start from here
app.get("/add-task", (req, res) => {
    res.render("add-task.ejs");
});


app.post("/add-task", async (req, res) => {
    const { title, description, status, due_date } = req.body;
    console.log("h")
    try {
        await db.query(
            "INSERT INTO tasks (title, description, status, due_date) VALUES ($1, $2, $3, $4)",
            [title, description, status, due_date]
        );
        res.redirect("/");
    } catch (error) {
        console.error("Error inserting new task:", error);
        res.status(500).send("Error adding task");
    }
});

app.post("/update-status/:id", async (req, res) => {
    console.log(req);
    const taskId = req.params.id;
    const { status } = req.body;

    try {
        await db.query("UPDATE tasks SET status = $1 WHERE task_id = $2", [status, taskId]);
        res.redirect(`/${taskId}`);
    } catch (error) {
        console.error("Error updating task status:", error);
        res.status(500).send("Error updating task status");
    }
});

app.post("/delete-task/:id", async (req, res) => {
    console.log(req);
    const taskId = req.params.id;

    try {
        await db.query("DELETE FROM tasks WHERE task_id = $1", [taskId]);
        res.redirect("/");
    } catch (error) {
        console.error("Error deleting task:", error);
        res.status(500).send("Error deleting task");
    }
});

app.get("/:id", async (req, res) => {
    console.log(req);
    const taskId = req.params.id;
    try {
        const result = await db.query("SELECT * FROM tasks WHERE task_id = $1", [taskId]);

        if (result.rows.length > 0) {
            const task = result.rows[0];
            res.render("task-details.ejs", { task: task });
        } else {
            res.status(404).send("Task not found");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Error fetching task details");
    }
});

app.get("/", async (req, res) => {
    console.log(req);
    const sortBy = req.query.sort_by || "created_at";
    const statusFilter = req.query.status || "";
    console.log(req.query);

    try {
        let query = "SELECT * FROM tasks";
        let queryParams = [];

        if (statusFilter) {
            query += " WHERE status = $1";
            queryParams.push(statusFilter);
        }

        query += ` ORDER BY ${sortBy}`;

        const result = await db.query(query, queryParams);
        const tasks = result.rows;
        res.render("task-list.ejs", {
            tasks: tasks,
            total: tasks.length,
            sortBy: sortBy,
            status: statusFilter
        });
    } catch (error) {
        console.log("Error getting tasks:", error);
        res.status(500).send("Error getting tasks");
    }
});






app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

