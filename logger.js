const fs = require("node:fs");
const path = require("node:path");


const args = process.argv.slice(2);

if (args.length === 0) {
    console.error("Usage: node logger.js <your note>");
    console.error('Example: node logger.js "Finished the React assignment"');
    process.exit(1);
}

const message = args.join(" ");


const timestamp = new Date().toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "medium",
});

const entry = `[${timestamp}] ${message}\n`;


const filePath = path.join(__dirname, "notes.txt");

fs.appendFile(filePath, entry, "utf8", (err) => {
    if (err) {
        console.error("Failed to save note:", err.message);
        process.exit(1);
    }
    console.log("Note saved ✓");
});
