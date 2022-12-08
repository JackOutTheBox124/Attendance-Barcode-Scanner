import express from "express";
import fs from "fs";
import { buildAllTimestampsJSON, convertToCSV, advancedConvertToCSV, advancedBuildAllTimestampsJSON, passAndFailArray } from "./utils/export";
import { connect } from "./models/database";
import { timeStampValid, updateTimestamp } from "./utils/manageDB";
import * as constants from "./constants";
import { initializeDoc, initializeSheets } from "./utils/initializeSpreadsheet";
import { propagateSheet } from "./utils/propagateSheet";
import { mapIdToName } from "./utils/mapIdToName";

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

const app = express();
app.use(express.json());

app.post("/", async function(req, res) {
  console.log(req.body);
  console.log(req.body["barcodeData"]);

  if(!isNaN(req.body["barcodeData"])) {
    if(req.body["barcodeData"].toString().length === 9) {
      
      if (await timeStampValid(parseInt(req.body["barcodeData"]))) {
        await sleep(1000);
        console.log("valid");
        
        updateTimestamp(parseInt(req.body["barcodeData"]));

        const csv:string = advancedConvertToCSV(await advancedBuildAllTimestampsJSON());
        
        fs.writeFile( constants.CSV_PATH, csv, function(err) {
          if (err) throw err;
          console.log("Saved!");
        });
        const obj = await buildAllTimestampsJSON();
        const passAndFailArrays = await passAndFailArray(obj);
        const doc = await initializeDoc(constants.SHEET_ID);
        await initializeSheets(doc, [ "Meets Requirements", "Fails Requirements" ], [ "ID", "Total Time (ms)" ], 1, 3, true);
        const meetsReqSheet = doc.sheetsByIndex[0];
        const failsReqSheet = doc.sheetsByIndex[1];

        await propagateSheet(meetsReqSheet, passAndFailArrays[0]);
        await propagateSheet(failsReqSheet, passAndFailArrays[1]);

        mapIdToName(doc);
      }
      else console.log("invalid");
    }
  }

  return res.json({output: "qwerty"});
});

connect().then(() => {
  app.listen(constants.SERVER_PORT, () => {
    console.log(`Server running on port ${constants.SERVER_PORT}`);
  });
});