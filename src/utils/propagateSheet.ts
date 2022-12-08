import { GoogleSpreadsheetWorksheet } from "google-spreadsheet";

export async function propagateSheet(sheet: GoogleSpreadsheetWorksheet, userArray: { id: number; timestamps: number; }[]) {
  await sheet.clearRows();

  for (const user in userArray) {
    if (Object.prototype.hasOwnProperty.call(userArray, user)) {
      const element = userArray[user];
      console.log(element);
      
      await sheet.addRow({
        "ID": element.id.toString(),
        "Total Time (ms)": element.timestamps.toString()
      });
    }
  }
}