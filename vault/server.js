const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// ==================== MIDDLEWARE ====================

app.use(cors());
app.use(express.json());

// Serve HTML/CSS/JS files from this folder
app.use(express.static(__dirname));

app.get("/upload.html", (req, res) => {
    res.sendFile(path.join(__dirname, "upload.html"));
});

// ==================== STORAGE NODES ====================

const nodes = [
    path.join(__dirname, "storage", "node1"),
    path.join(__dirname, "storage", "node2"),
    path.join(__dirname, "storage", "node3")
];


// Create storage folders if they don't exist

nodes.forEach((node) => {

    if (!fs.existsSync(node)) {
        fs.mkdirSync(node, { recursive: true });
    }

});


// ==================== TEMPORARY FOLDER ====================

const tempFolder = path.join(__dirname, "temp");

if (!fs.existsSync(tempFolder)) {
    fs.mkdirSync(tempFolder, { recursive: true });
}


// ==================== MULTER ====================

const upload = multer({
    dest: tempFolder
});


// ==================== HOME ====================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "upload.html"));
});

// ==================== UPLOAD ====================

app.post("/upload", upload.single("file"), (req, res) => {

    try {

        if (!req.file) {

            return res.status(400).json({
                error: "No file uploaded"
            });

        }

        const originalName =
            path.basename(req.file.originalname);

        const tempPath =
            req.file.path;


        // Copy file to all 3 nodes

        nodes.forEach((node) => {

            const destination =
                path.join(node, originalName);

            fs.copyFileSync(
                tempPath,
                destination
            );

        });


        // Delete temporary file

        fs.unlinkSync(tempPath);


        res.json({

            message: "File uploaded successfully!",

            file: originalName,

            storedOn: [
                "node1",
                "node2",
                "node3"
            ]

        });

    } catch (error) {

        console.error(error);


        if (
            req.file &&
            fs.existsSync(req.file.path)
        ) {

            fs.unlinkSync(req.file.path);

        }


        res.status(500).json({
            error: "Upload failed"
        });

    }

});


// ==================== DOWNLOAD ====================

app.get("/download/:filename", (req, res) => {

    try {

        const filename =
            path.basename(req.params.filename);


        // Check nodes one by one

        for (const node of nodes) {

            const filePath =
                path.join(node, filename);


            if (fs.existsSync(filePath)) {

                console.log(
                    `File served from: ${node}`
                );


                return res.download(
                    filePath,
                    filename
                );

            }

        }


        res.status(404).json({

            error:
                "File not found in any storage node"

        });

    } catch (error) {

        console.error(error);


        res.status(500).json({
            error: "Download failed"
        });

    }

});


// ==================== LIST FILES ====================

app.get("/files", (req, res) => {

    try {

        // Collect files from all nodes

        const allFiles = new Set();


        nodes.forEach((node) => {

            if (fs.existsSync(node)) {

                const files =
                    fs.readdirSync(node);


                files.forEach((file) => {
                    allFiles.add(file);
                });

            }

        });


        res.json({

            files: Array.from(allFiles)

        });

    } catch (error) {

        console.error(error);


        res.status(500).json({

            error:
                "Could not read files"

        });

    }

});


// ==================== NODE STATUS ====================

app.get("/nodes", (req, res) => {

    try {

        const nodeStatus =
            nodes.map((node, index) => {

                const exists =
                    fs.existsSync(node);

                return {

                    name:
                        `node${index + 1}`,

                    status:
                        exists
                            ? "online"
                            : "offline"

                };

            });


        res.json(nodeStatus);

    } catch (error) {

        console.error(error);


        res.status(500).json({

            error:
                "Could not check nodes"

        });

    }

});


// ==================== START SERVER ====================

const server = app.listen(PORT, () => {
    console.log(`Vault server running at http://localhost:${PORT}`);
});

server.on("error", (error) => {
    console.error("SERVER ERROR:", error);
});

setInterval(() => {
    // Keep Vault server running
}, 1000);