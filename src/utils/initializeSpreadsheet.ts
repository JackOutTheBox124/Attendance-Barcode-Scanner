import {GoogleSpreadsheet} from "google-spreadsheet";
import * as config from "../constants";
export async function initializeDoc(sheetID: string) {
  const doc = new GoogleSpreadsheet(sheetID);
  await doc.useServiceAccountAuth({
    client_email: config.CLIENT_EMAIL,
    private_key: config.PRIVATE_KEY,
  });

  await doc.loadInfo();
  if (doc.title !== "Attendance Sheets") {
    await doc.updateProperties({ title: "Attendance Sheets" });
  }
  return doc;
}

export async function initializeSheets(doc: GoogleSpreadsheet, sheetNames: string[], headers: string[] = [], frozenRows = 0, colomns = 1, timestamp = false) {
  let sheetID = 0;
  const now = new Date(Date.now());
  if(timestamp) {
    headers.push(`${now.toLocaleString("en-us" ,{ timeZone: "EST" })}`);
  }
  for (const sheetName in sheetNames) {
    if (Object.prototype.hasOwnProperty.call(sheetNames, sheetName)) {

      if(!doc.sheetsByIndex[sheetID]) {
        await doc.addSheet({ title: sheetNames[sheetID] });
      }

      const sheet = doc.sheetsByIndex[sheetID];

      await sheet.updateProperties({ 
        title: sheetNames[sheetID],
        gridProperties: {
          rowCount: 2,
          columnCount: colomns,
          frozenRowCount: frozenRows
        }
      });
      await sheet.setHeaderRow(headers);
      console.log(headers);
      
      sheetID++;
    }
  }
}