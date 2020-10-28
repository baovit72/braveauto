const fs = require("fs");
const { printConsole, getFilesizeInKB, parseJSON, readFile, getDirectories } = require("./utils");

const input = "DATA";
if (!fs.existsSync(input)) {
    printConsole("No data provided", "error");
    process.exit(1)
}


const rootFolder = process.argv[2];
const startIndex = +process.argv[3];



function start(rootFolder, startIndex) {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(rootFolder)) {
            reject(() => printConsole("Invalid root folder - value: " + rootFolder, "error"))
        }
        if (!(startIndex > 0)) {
            reject(() => printConsole("Invalid start index - value " + startIndex, "error"))
        }
        const filePath = `${rootFolder}/${"Profile " + startIndex}/ads_service/confirmations.json`;
        if (fs.existsSync(filePath)) {
            readFile(filePath).then(data => {
                const dataObj = parseJSON(data);
                readFile(`${input}/${startIndex}.txt`).then(data => {
                    const tokenDataObj = JSON.parse(data);
                    const tokens = tokenDataObj.data;
                    if (dataObj["unblinded_tokens"])
                        dataObj["unblinded_tokens"].push(...tokens);
                    fs.writeFile(filePath, JSON.stringify(dataObj), (err) => {
                        if (err) throw err;
                        resolve(() => { printConsole('File written to ' + filePath, "success") });
                    });
                }).catch(err => {

                    reject(() => printConsole("Failed to read input tokens", "error"))
                })

            }).catch(err => {
                reject(() =>
                    printConsole("Failed to read input tokens", "error"))
            })
        }
    })
}
start(rootFolder, startIndex).then(res => res()).catch(err => err())