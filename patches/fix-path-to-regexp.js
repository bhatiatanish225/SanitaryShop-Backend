// Apply this patch to fix path-to-regexp
const fs = require("fs");
const path = require("path");

const targetFile = path.join(
  __dirname,
  "../node_modules/router/node_modules/path-to-regexp/dist/index.js"
);

if (fs.existsSync(targetFile)) {
  console.log("Patching path-to-regexp...");

  let content = fs.readFileSync(targetFile, "utf8");

  // Replace the problematic line that uses DEBUG_URL
  content = content.replace(
    /throw new TypeError\(`Missing parameter name at \${i}: \${DEBUG_URL}`\);/g,
    "throw new TypeError(`Missing parameter name at ${i}`);"
  );

  fs.writeFileSync(targetFile, content);
  console.log("Successfully patched path-to-regexp!");
} else {
  console.log("Target file not found. No patching needed.");
}
