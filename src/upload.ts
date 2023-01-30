import { timeStampValid, updateTimestamp } from "./utils/manageDB";
import * as constants from "./constants";
import { initializeDoc, initializeSheet } from "./utils/initializeSpreadsheet";
import * as readline from "node:readline";
import { buildAllDailyMinutesJSON } from "./utils/timestampsToDailyMinutes";
import { convertIDsToNames, getDates, mapIdToName, passAndFailArray, propagateSheet } from "./utils/exportToSheets";
import colorsSafe from "colors/safe";
import { Student } from "./models/database";
import { getTimes } from "./utils/getTimes";

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

const reader: readline.Interface = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

reader.on('line', async (input: any) => {
  console.log(colorsSafe.cyan(`Received: ${input}`));
  if (input.length !== 9) return;
  if(isNaN(input)) return;
  try {
    input = Number.parseInt(input)
  }
  catch(err) {
    return
  }
  if (!await timeStampValid(input)) return;
  await sleep(1000);
  
  console.log(colorsSafe.green(input + ' is valid!'));
  updateTimestamp(input);
});

(async () => {
  const students = await Student.findAll();

  for (let i = 0; i < students.length; i++) {
    console.log("ID: " + students[i].id);
  
    await getTimes(students[i].id);
  }
})();

// setInterval(async () => {
  async function upload() {
    try {
      const doc = await initializeDoc(constants.SHEET_ID);
      const minutesDaily = await buildAllDailyMinutesJSON();

      const passAndFailArrays = passAndFailArray(minutesDaily);
      const passDates = getDates(passAndFailArrays[0]);
      const failDates = getDates(passAndFailArrays[1]);

      const passArrayNames = await convertIDsToNames(doc, passAndFailArrays[0])
      const failArrayNames = await convertIDsToNames(doc, passAndFailArrays[1]);

      const passSheet = await initializeSheet(doc, "Meets Requirements", [ "First Name", "Last Name", "Previous Minutes","Total Time (m)", ].concat(passDates), 1, 5 + passDates.length, true, 0);
      const failSheet = await initializeSheet(doc, "Fails Requirements", [ "First Name", "Last Name", "Previous Minutes", "Total Time (m)" ].concat(failDates), 1, 5 + failDates.length, true, 1);
      await propagateSheet(passSheet, passArrayNames, minutesDaily, passDates);
      await propagateSheet(failSheet, failArrayNames, minutesDaily, failDates);
      await mapIdToName(doc);
    }
    catch(err: any) {
      console.log(colorsSafe.red(err));
    }
}
upload();