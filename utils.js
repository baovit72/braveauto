const fs = require("fs");

function printConsole(message, type) {
    const _TYPES = {
        "error": "\x1b[31m%s\x1b[0m",
        "info": "\x1b[33m%s\x1b[0m",
        "success": "\x1b[32m%s\x1b[0m",
        getColor(type) {
            return this[type.toLowerCase()] || "%s";
        }
    };
    console.log(_TYPES.getColor(type), message);
}


function getFilesizeInKB(filename) {
    var stats = fs.statSync(filename)
    var fileSizeInBytes = stats["size"]
    return Math.ceil(fileSizeInBytes / 1000)
}

function readFile(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, (err, data) => {
            if (err) { return reject(err) }
            resolve(data);
        })
    })
}

function writeFile(path, data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(path, data, (err) => {
            if (err) { return reject(err) }
            resolve();
        })
    })
}



function getProfileDirectories(source) {
    return fs.readdirSync(source, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory() && /^Profile \d+$/.test(dirent.name))
        .map(dirent => dirent.name).sort((a, b) => +/\d+/.exec(a) - +/\d+/.exec(b))
}

function getDataFiles(source) {
    return fs.readdirSync(source, { withFileTypes: true })
        .filter(dirent => dirent.isFile() && /^\d+\.txt$/.test(dirent.name))
        .map(dirent => dirent.name);
}

function parseJSON(json) {
    try {
        return JSON.parse(json);
    } catch (e) {
        return {};
    }
}

module.exports = { printConsole, getFilesizeInKB, readFile, parseJSON, getProfileDirectories, writeFile , getDataFiles}