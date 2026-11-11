const fs = require("node:fs");

const readable = fs.createReadStream("input.txt", {
    encoding: "utf8",
    highWaterMark: 15
});

readable.on("data", (chunk) => {
    console.log("Received chunk:");
    console.log(chunk);
});

readable.on("end", () => {
    console.log("Finished reading file.");
});

readable.on("error", (err) => {
    console.error("Error:", err.message);
});