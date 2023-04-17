import * as constants from "./constants";
import { buildAllDailyMinutesJSON } from "./utils/uploadUtils";
import { initializeDoc, initializeSheet, convertIDsToNames, getDates, mapIdToName, passAndFailArray, propagateSheet } from "./utils/exportToSheets";
import colorsSafe from "colors/safe";

async function upload() {
  try {
    const doc = await initializeDoc(constants.SHEET_ID);
    const minutesDaily = await buildAllDailyMinutesJSON();

    const passAndFailArrays = await passAndFailArray(doc, minutesDaily);
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