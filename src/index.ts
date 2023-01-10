import { timeStampValid, updateTimestamp } from "./utils/manageDB";
import * as constants from "./constants";
import { initializeDoc, initializeSheet } from "./utils/initializeSpreadsheet";
import * as readline from "node:readline";
import { buildAllDailyMinutesJSON } from "./utils/timestampsToDailyMinutes";
import { getDates, mapIdToName, passAndFailArray, propagateSheet } from "./utils/exportToSheets";
var colors = require('colors/safe');

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

const reader: readline.Interface = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

reader.on('line', async (input: any) => {
  console.log(`Received: ${input}`);
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
  
  console.log(colors.green(input + ' is valid!'));
  updateTimestamp(input);
});

setInterval(async () => {
  try {
    const doc = await initializeDoc(constants.SHEET_ID);
    const minutesDaily = await buildAllDailyMinutesJSON();

    const passAndFailArrays = passAndFailArray(minutesDaily);
    const passDates = getDates(passAndFailArrays[0]);
    const failDates = getDates(passAndFailArrays[1]);
    const passSheet = await initializeSheet(doc, "Meets Requirements", [ "ID", "Total Time (m)", ].concat(passDates), 1, 3 + passDates.length, true, 0);
    const failSheet = await initializeSheet(doc, "Fails Requirements", [ "ID", "Total Time (m)" ].concat(failDates), 1, 3 + failDates.length, true, 1);
    await propagateSheet(passSheet, passAndFailArrays[0], minutesDaily, passDates);
    await propagateSheet(failSheet, passAndFailArrays[1], minutesDaily, failDates);
    await mapIdToName(doc);
  }
  catch(err) {
    console.log(colors.red(err));
  }
}, 60000);