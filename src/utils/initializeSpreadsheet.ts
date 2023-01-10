import { GoogleSpreadsheet } from "google-spreadsheet";
import * as config from "../constants";

/**
 * Initializes the given Google Spreadsheet document.
 * @param {string} sheetID - The ID of the Google Spreadsheet document to initialize.
 * @returns {Promise<GoogleSpreadsheet>} A promise that resolves with the initialized Google Spreadsheet document.
 */
export async function initializeDoc(sheetID: string) {
  // Create a new Google Spreadsheet instance with the given sheet ID.
  const doc = new GoogleSpreadsheet(sheetID);
  // Use the service account credentials from constants to authenticate the connection.
  await doc.useServiceAccountAuth({
    client_email: config.CLIENT_EMAIL,
    private_key: config.PRIVATE_KEY,
  });

  // Load the information for the document.
  await doc.loadInfo();
  // If the document title is not "Attendance Sheets", update it to that value.
  if (doc.title !== "Attendance Sheets") {
    await doc.updateProperties({ title: "Attendance Sheets" });
  }
  // Return the initialized document.
  return doc;
}

/**
 * Initializes the given sheet in the given Google Spreadsheet document.
 * @param {GoogleSpreadsheet} doc - The Google Spreadsheet document to add the sheet to.
 * @param {string} sheetName - The name of the sheet to initialize.
 * @param {string[]} [headers=[]] - An array of header values to include in the sheet.
 * @param {number} [frozenRows=0] - The number of rows to freeze in the sheet.
 * @param {number} [columns=1] - The number of columns in the sheet.
 * @param {boolean} [timestamp=false] - A boolean indicating whether to include a timestamp header in the sheet.
 * @param {number} [index=0] - The index of the sheet in the document.
 * @returns {Promise<GoogleSpreadsheetWorksheet>} A promise that resolves with the initialized sheet.
 */
export async function initializeSheet(doc: GoogleSpreadsheet, sheetName: string, headers: string[] = [], frozenRows = 0, columns = 1, timestamp = false, index = 0) {
  // Get the current date and time
  const now = new Date(Date.now());
  // If the timestamp flag is set to true, add the current date and time as a header
  if (timestamp) {
    headers.push(`${now.toLocaleString("en-us", {timeZone: "EST"})}`);
  }
  // If there is no sheet at the given index in the document, add a new sheet with the given name.
  if (!doc.sheetsByIndex[index]) {
    await doc.addSheet({title: sheetName});
  }

  const sheet = doc.sheetsByIndex[index];
  await sheet.clear();

  await sheet.updateProperties({
    title: sheetName,
    gridProperties: {
      rowCount: 2,
      columnCount: columns,
      frozenRowCount: frozenRows
    }
  });
  await sheet.setHeaderRow(headers);
  return sheet;
}