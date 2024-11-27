const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');

// Middleware
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Ensure the "files" directory exists
const filesDir = path.join(__dirname, 'files');
if (!fs.existsSync(filesDir)) {
    fs.mkdirSync(filesDir);
}

// Route: Home Page
app.get('/', (req, res) => {
    fs.readdir(filesDir, (err, fileNames) => {
        if (err) {
            console.error("Error reading directory:", err);
            return res.status(500).send("Error loading tasks.");
        }

        const tasks = fileNames.map(fileName => ({
            title: path.basename(fileName, '.txt'),
            filePath: `/files/${fileName}`
        }));

        res.render("index", { files: tasks });
    });
});

// Route: Create a Task
app.post('/create', (req, res) => {
    const { title, details } = req.body;

    if (!title || !details) {
        return res.status(400).send("Title and details are required.");
    }

    const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filePath = path.join(filesDir, `${safeTitle}.txt`);

    fs.writeFile(filePath, details, err => {
        if (err) {
            console.error("Error writing file:", err);
            return res.status(500).send("Error saving the task.");
        }
        res.redirect("/");
    });
});

// Route: Serve Files for Download
app.get('/files/:filename', (req, res) => {
    const filePath = path.join(filesDir, req.params.filename);
    res.download(filePath, err => {
        if (err) {
            console.error("Error downloading file:", err);
            res.status(404).send("File not found.");
        }
    });
});

// Start the Server
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});