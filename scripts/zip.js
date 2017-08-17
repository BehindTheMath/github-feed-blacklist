const outputPath = "./dist/";
const projectName = "GithubFeedBlacklist";

const fs = require('fs');
const execFileSync = require('child_process').execFileSync;
const zipFolder = require('zip-folder');

// The root folder for this script's context is the folder containing package.json
const sourceFolderPath = "./src";

/*
// Get the last tag name from Git, then generate a filename based on that
const lastTag = String.fromCharCode.apply(null, execFileSync("git", ["describe", "--abbrev=0", "--tags"]/!*, { cwd: sourceFolderPath }*!/));
const version = lastTag.slice(1, lastTag.length - 1);
*/

// Get the version number from the manifest
const version = require("../src/manifest.json").version;

let outputFileName = `${outputPath}${projectName}-${version}.zip`;

// If that filename already exists, add the timestamp to the output filename
if (fs.existsSync(outputFileName)) {
    const date = new Date().toLocaleDateString().replace(/\//g, '-');
    const time = new Date().toLocaleTimeString().replace(/\:/g, '-');
    outputFileName =  `${outputPath}${projectName}-${version}  - ${date}${time}.zip`;
}

// Zip it up
zipFolder(sourceFolderPath, outputFileName, function(err) {
    if(err) {
        console.log('Error: ', err);
    } else {
        console.log("Zip successfully generated: " + outputFileName.slice(2));
    }
});