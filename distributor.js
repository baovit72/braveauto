const fs = require("fs");
const { printConsole, getFilesizeInKB, getDataFiles, parseJSON, readFile, getProfileDirectories, writeFile } = require("./utils");

const input = "DATA";
if (!fs.existsSync(input)) {
    printConsole("No data provided", "error");
    process.exit(1);
}


const rootFolder = process.argv[2];
const startIndex = +process.argv[3];



async function start(rootFolder, startIndex) {

    if (!fs.existsSync(rootFolder)) {
        printConsole("Invalid root folder - value: " + rootFolder, "error");
    }
    if (!(startIndex > 0)) {
        printConsole("Invalid start index - value " + startIndex, "error");
    }


    //Get all valid profile dir
    let profileDirs = getProfileDirectories(rootFolder);

    const dataFiles = getDataFiles(input);

    const profileIndex = profileDirs.findIndex(dir => +/\d+/.exec(dir) >= startIndex);

    if (profileIndex < 0) {
        return printConsole("Invalid start index - value " + startIndex, "error");
    }

    profileDirs = profileDirs.slice(profileIndex)

    for (var i = 0, j = 0; i < dataFiles.length && j < profileDirs.length;) {
        let data = null;
        let desData = null;
        try {
            const filePath = `${input}/${dataFiles[i]}`;
            const rawData = await readFile(filePath);
            const dataObj = parseJSON(rawData);
            data = dataObj.data || [];

        } catch (error) {
            console.log(error)
            i++;
            continue;
        }
        try {
            const filePath = `${rootFolder}/${profileDirs[j]}/ads_service/confirmations.json`;
            const rawData = await readFile(filePath);
            const dataObj = parseJSON(rawData);
            desData = dataObj;
        } catch (error) {
            j++;
            continue;
        }
        try {
            const filePath = `${rootFolder}/${profileDirs[j]}/ads_service/confirmations.json`;
            desData && desData.unblinded_tokens && desData.unblinded_tokens.push(...data);
            await writeFile(filePath, JSON.stringify(desData));
            printConsole('File written to ' + profileDirs[j], "success")
        } catch (error) {
            console.log(error)
            printConsole('Failed to write to ' + profileDirs[j], "error")
        }
        i++;
        j++;
    }

}
start(rootFolder, startIndex);