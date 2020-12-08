const fs = require("fs");
const { printConsole, getFilesizeInKB, parseJSON, readFile, getProfileDirectories, writeFile } = require("./utils")


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


function start(rootFolder) {

    if (!fs.existsSync(rootFolder)) {
        return printConsole("Invalid root folder - value: " + rootFolder, "error")
    }

    //Get all valid profile dir
    const profileDirs = getProfileDirectories(rootFolder);

    const fileReaders = [];
    const validProfiles = [];


    for (let i = 0; i < profileDirs.length; i++) {
        const filePath = `${rootFolder}/${profileDirs[i]}/ads_service/confirmations.json`;
        if (fs.existsSync(filePath) && getFilesizeInKB(filePath) === 12) {
            fileReaders.push(readFile(filePath))
            validProfiles.push(profileDirs[i])
        }
    }
    Promise.all(fileReaders).then(async(results) => {

            printConsole(results.length, "INFO")
            const dataChunks = [];
            const dataChunks2 = [];
            var i, j, temparray, temparray2, chunk = 9;
            for (i = 0; i < results.length; i += chunk) {
                temparray = results.slice(i, i + chunk);
                temparray2 = validProfiles.slice(i, i + chunk);
                dataChunks.push(temparray);
                dataChunks2.push(temparray2);
            }
            for (var j = 0; j < dataChunks.length; j++) {
                const chunk = dataChunks[j];
                const chunk2 = dataChunks2[j];
                const outputObj = {};
                const aggregateData = [];

                outputObj.info = chunk2;

                chunk.forEach(data => {
                    aggregateData.push(...getTokens(parseJSON(data)))
                })
                outputObj.data = aggregateData;
                const outPath = `${output}/${j}${Date.now()}.txt`
                try {
                    await writeFile(outPath, JSON.stringify(outputObj))
                    printConsole('File written to ' + `${outPath}`, "success")
                } catch (error) {
                    printConsole('Failed to write file to ' + `${outPath}`, "error")
                }
            }
            printConsole("Done....................", "success");
        })
        .catch(err => printConsole(err, "error"))
}

const rootFolder = process.argv[2];

printConsole("Running................................................................", "info");
start(rootFolder)