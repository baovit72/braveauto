const fs = require("fs");
const { printConsole, getFilesizeInKB, parseJSON, readFile, getDirectories } = require("./utils")


const output = "DATA"
if (!fs.existsSync(output)) {
    fs.mkdirSync(output);
}

/**
 *  argv[2] - path to brave profiles' folder
 *  argv[3] - X
 *  confirmation files need to be 12KB ? -> vary -> lấy đủ 9 cái 
 *  valid files length < 9 ?
 * 
 */

function getTokens(data) {
    return data && data["unblinded_tokens"] || [];
}


function start(rootFolder, startIndex) {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(rootFolder)) {
            return reject(() => printConsole("Invalid root folder - value: " + rootFolder, "error"))
        }
        if (!(startIndex > 0)) {
            return reject(() => printConsole("Invalid start index - value " + startIndex, "error"))
        }
        
        const profileIndex = profileDirs.findIndex(dir => dir === "Profile " + startIndex);

        if (!(profileIndex >= 0)) {
            return reject(() => printConsole("Invalid profile index " + profileIndex, "error"))
        }

        const fileReaders = [];
        const validProfiles = [];
        let count = 0;
        let i = profileIndex;
        for (; count < 9 && i < profileDirs.length; i++) {
            const filePath = `${rootFolder}/${profileDirs[i]}/ads_service/confirmations.json`;
            if (fs.existsSync(filePath) && getFilesizeInKB(filePath) === 12) {
                count++;
                fileReaders.push(readFile(filePath))
                validProfiles.push(profileDirs[i])
            }
        }
        printConsole(`Valid profile's confirmations.json (${validProfiles.length}): ` + validProfiles, "info")
        Promise.all(fileReaders).then(results => {
                const dataObjs = [];

                results.forEach(result => {
                    dataObjs.push(parseJSON(result));
                })

                const aggregateData = [];
                dataObjs.forEach(data => {
                    aggregateData.push(...getTokens(data));
                })

                const outputObj = {};
                outputObj.destination = "Profile " + startIndex;
                outputObj.data = aggregateData;

                fs.writeFile(`${output}/${startIndex}.txt`, JSON.stringify(outputObj), (err) => {
                    if (err) throw err;
                    return resolve(() => {
                        printConsole('File written to ' + `OUTPUT/${startIndex}${Date.now()}.txt`, "success");
                        if (validDirs && validDirs.length > 0)
                            return +/\d+/.exec(validDirs[validDirs.length - 1])[0];
                    });
                });
            })
            .catch(err => reject(() => printConsole(err, "error")))
    });
}

const rootFolder = process.argv[2];
const startIndex = +process.argv[3];

//Get all valid profile dir
const profileDirs = getDirectories(rootFolder);

let iterator = startIndex;
while(iterator < profileDirs.length)
start(rootFolder, startIndex)
