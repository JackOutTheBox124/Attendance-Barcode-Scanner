import {GoogleSpreadsheet, GoogleSpreadsheetCell, GoogleSpreadsheetWorksheet} from "google-spreadsheet";
import * as constants from "../constants";

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
    client_email: constants.CLIENT_EMAIL,
    private_key: constants.PRIVATE_KEY,
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

  // Get the sheet at the given index and clear its contents.
  const sheet = doc.sheetsByIndex[index];
  await sheet.clear();

  // Set the sheet's properties: the title, number of rows and columns, and number of frozen rows.
  await sheet.updateProperties({
    title: sheetName,
    gridProperties: {
      rowCount: 2,
      columnCount: columns,
      frozenRowCount: frozenRows
    }
  });
  // Set the sheet's headers based on the headers function parameter.
  await sheet.setHeaderRow(headers);
  // Return the initialized sheet as a promise.
  return sheet;
}

/**
 * Calculates the total number of minutes for a user
 * @param {Object} user - The user object
 * @param {number} user.id - The ID of the user
 * @param {Array} user.dailyMinutes - An array of objects with a date and number of minutes for each day
 * @param {string} user.dailyMinutes[].date - The date of the attendance
 * @param {number} user.dailyMinutes[].minutes - The number of minutes of attendance
 * @returns {Object} - An object containing the user ID and total number of minutes
 */
export function getTotalUserMinutes(user: {id: number; dailyMinutes: { date: string; minutes: number; }[];}) {
  // Initialize a variable to keep track of the total number of minutes.
  let totalMinutes = 0;
  // Loop through each day in the user's attendance record and add up the number of minutes.
  for (let i = 0; i < user.dailyMinutes.length; i++) {
    totalMinutes += user.dailyMinutes[i].minutes;
  }
  // Return an object containing the user's ID and the total number of minutes rounded down to the nearest whole number.
  return {
    user: user.id,
    totalMinutes: Math.trunc(totalMinutes)
  }
}

/**
 * Divides an array of users into two arrays based on whether they have passed or failed the attendance threshold
 * @param {Array} userArray - An array of user objects
 * @param {number} userArray[].id - The ID of the user
 * @param {Array} userArray[].dailyMinutes - An array of objects with a date and number of minutes for each day
 * @param {string} userArray[].dailyMinutes[].date - The date of the attendance
 * @param {number} userArray[].dailyMinutes[].minutes - The number of minutes of attendance
 * @returns {Array} - An array containing two arrays, the first for users that have passed and the second for users that have failed
 */
export async function passAndFailArray(doc: GoogleSpreadsheet, userArray: { id: number; dailyMinutes: { date: string; minutes: number; }[]; }[]) {
  let passArray: {id: number, dailyMinutes: {date: string, minutes: number}[]}[] = [];
  let failArray: {id: number, dailyMinutes: {date: string, minutes: number}[]}[] = [];
  for (const user in userArray) {
    if (Object.prototype.hasOwnProperty.call(userArray, user)) {
      const element = userArray[user];
      let variableSheet: GoogleSpreadsheetWorksheet = await doc.sheetsByIndex[2];
      let variableSheetRows = await variableSheet.getRows().then((rows) => {
        console.log(rows[0]);
        
        // rows[0].forEach((row: string | number, i: string | number) => previousMinObj[row] = rows[3][i]);
        // // let previousMinObj = Object.fromEntries(rows.map((_, i) => [rows[0][i], rows[3][i]]));
        // console.log(previousMinObj)
        // previousMin = rows[4].
      })
      const totalMinutes = element.dailyMinutes.reduce((a, b) => a + b.minutes, 0);
      if (totalMinutes >= (constants.MINIMUM_ATTENDANCE_TIME_MS / 1000 / 60)) {
        passArray.push(element);
      } else {
        failArray.push(element);
      }
    }
  }
  passArray.sort();
  failArray.sort();
  passArray = [...new Set(passArray)];
  failArray = [...new Set(failArray)];
  return [passArray, failArray];
}

export async function convertIDsToNames(doc: GoogleSpreadsheet, usersArray: {id: number, dailyMinutes: {date: string, minutes: number}[]}[]) {
  let returnedObject: {id:number, firstName: string, lastName: string, previousMinutes: number, dailyMinutes: { date: string; minutes: number; }[];}[] = [];

  let variableSheet: GoogleSpreadsheetWorksheet = await doc.sheetsByIndex[2];
  let rowCount: number;
  await variableSheet.getRows().then(async (rows) => {
  rowCount = rows.length + 1;
  let studentIDColumn: GoogleSpreadsheetCell[] = [];
  let studentFirstNameColumn: GoogleSpreadsheetCell[] = [];
  let studentLastNameColumn: GoogleSpreadsheetCell[] = [];
  let studentPreviousMinutesColumn: GoogleSpreadsheetCell[] = [];
  
  await variableSheet.loadCells(`A1:D${rowCount}`).then(() => {

    for (let i = 1; i < rowCount; i++) {
      console.log(i);
      
      studentIDColumn.push(variableSheet.getCell(i, 0));
    }

    for (let i = 1; i < rowCount; i++) {
      studentFirstNameColumn.push(variableSheet.getCell(i, 1));
    }

    for (let i = 1; i < rowCount; i++) {
      studentLastNameColumn.push(variableSheet.getCell(i, 2));
    }

    for (let i = 1; i < rowCount; i++) {
      studentPreviousMinutesColumn.push(variableSheet.getCell(i, 3));
    }
  });

  for (let i = 0; i < usersArray.length; i++) {

    let user = usersArray[i];

    let studentID = user.id;
    let studentFirstName: string;
    let studentLastName: string;
    let studentPreviousMinutes: number;
    console.log(studentID);
    try {
      studentFirstName = studentFirstNameColumn[studentIDColumn.indexOf(studentIDColumn.filter((cell) => cell.value === studentID)[0])].value.toString();
      studentLastName = studentLastNameColumn[studentIDColumn.indexOf(studentIDColumn.filter((cell) => cell.value === studentID)[0])].value.toString();
      studentPreviousMinutes = parseInt(studentPreviousMinutesColumn[studentIDColumn.indexOf(studentIDColumn.filter((cell) => cell.value === studentID)[0])].value.toString());
    } catch (error) {
      studentFirstName = studentID.toString();
      studentLastName = studentID.toString();
      studentPreviousMinutes = 0;
    }
    let student = {id: studentID, firstName: studentFirstName, lastName: studentLastName, previousMinutes: studentPreviousMinutes, dailyMinutes: user.dailyMinutes};
    console.log("student begin");
    console.log(student);
    console.log("student end");
    
    returnedObject.push(student);
  }
});
return returnedObject;
}


/**
 * Extracts all unique dates from the dailyMinutes arrays of each user
 * @param {Array} userArray - An array of user objects
 * @param {number} userArray[].id - The ID of the user
 * @param {Array} userArray[].dailyMinutes - An array of objects with a date and number of minutes for each day
 * @param {string} userArray[].dailyMinutes[].date - The date of the attendance
 * @param {number} userArray[].dailyMinutes[].minutes - The number of minutes of attendance
 * @returns {Array} - An array of all unique dates
 */
export function getDates(userArray: { id: number; dailyMinutes: { date: string; minutes: number; }[]; }[]) {
  let dates: string[] = [];
  for (const user in userArray) {
    if (Object.prototype.hasOwnProperty.call(userArray, user)) {
      const element: any = userArray[user];
      for (const date in element.dailyMinutes) {
        if (Object.prototype.hasOwnProperty.call(element.dailyMinutes, date)) {
          const el = element.dailyMinutes[date];
          dates.push(el.date);
        }
      }
    }
  }
  dates.sort(function(a,b) {
    const aList: string[] = a.split("-");
    const bList: string[] = b.split("-");
    return new Date(parseInt(bList[0]), parseInt(bList[1]), parseInt(bList[2])).getTime() - 
      new Date(parseInt(aList[0]), parseInt(aList[1]), parseInt(aList[2])).getTime();
  });
  dates = [...new Set(dates)];
  dates.forEach((date, index) => {
    const x = date.split("-");
    dates[index] = `${parseInt(x[0])}-${parseInt(x[1])}-${parseInt(x[2])}`;
  });
  dates.reverse();
  return dates;
}

/**
 * Maps user IDs to their names from a Google Spreadsheet
 * @param {GoogleSpreadsheet} doc - The Google Spreadsheet object
 * @returns {Promise} - A promise that resolves when the mapping is complete
 */
export async function mapIdToName(doc: GoogleSpreadsheet) {
  const userIdList: {id: number, name: string, previousMin: number}[] = [];
  if(!doc.sheetsByIndex[2]) {
    await doc.addSheet({ title: "Variables" });
  }
  const variableSheet = doc.sheetsByIndex[2];

  await variableSheet.updateProperties({ 
    title: "Variables",
    gridProperties: {
      rowCount: 100,
      columnCount: 4,
      frozenRowCount: 1
    }
  });
  await variableSheet.setHeaderRow([
    "Student ID",
    "First Name",
    "Last Name",
    "Previous Min"
  ]);

  const rows = await variableSheet.getRows();
  if(rows.length > 0) {
    for (const row in rows) {
      if (Object.prototype.hasOwnProperty.call(rows, row)) {
        const element = rows[row];
        userIdList.push({
          id: Number(element["Student ID"]),
          name: element["Student Name"],
          previousMin: Number(element["Previous Min"])
        });
      }
    }
  }
}

/**
 * Propagates user attendance data to a Google Spreadsheet
 * @param {GoogleSpreadsheetWorksheet} sheet - The worksheet object to propagate the data to
 * @param {Array} userArray - An array of user objects
 * @param {number} userArray[].id - The ID of the user
 * @param {Array} userArray[].dailyMinutes - An array of objects with a date and number of minutes for each day
 * @param {string} userArray[].dailyMinutes[].date - The date of the attendance
 * @param {number} userArray[].dailyMinutes[].minutes - The number of minutes of attendance
 * @param {Array} dailyMinutes - An array of user objects with a total number of minutes
 * @param {number} dailyMinutes[].id - The ID of the user
 * @param {Array} dailyMinutes[].dailyMinutes - An array of objects with a date and number of minutes for each day
 * @param {string} dailyMinutes[].dailyMinutes[].date - The date of the attendance
 * @param {number} dailyMinutes[].dailyMinutes[].minutes - The number of minutes of attendance
 * @param {Array} dates - An array of dates
 * @returns {Promise} - A promise that resolves when the data propagation is complete
 */
export async function propagateSheet(sheet: GoogleSpreadsheetWorksheet, userArray: { id:number, firstName: string; lastName: string; previousMinutes: number; dailyMinutes: { date: string; minutes: number; }[]; }[], dailyMinutes: {id: number, dailyMinutes: {date: string, minutes: number}[]}[], dates: string[]) {
  await sheet.clearRows();

  let userDates: string[] = [];

  const lengths = userArray.map(a=>a.dailyMinutes.length);
  lengths.indexOf(Math.max(...lengths));

  for (const user in userArray) {
    if (Object.prototype.hasOwnProperty.call(userArray, user)) {
      const element = userArray[user];

      for (const date in element.dailyMinutes) {
        if (Object.prototype.hasOwnProperty.call(element.dailyMinutes, date)) {
          // for loop to truncate all minutes in dailyMinutes to whole numbers
          console.log(element.dailyMinutes[date]);

          for(const minute in element.dailyMinutes[date]) {
            if (Object.prototype.hasOwnProperty.call(element.dailyMinutes[date], minute)) {
              element.dailyMinutes[date].minutes = Math.trunc(element.dailyMinutes[date].minutes);
            }
          }
          const el = element.dailyMinutes[date];
          userDates.push(el.date);
        }
      }
      userDates.sort();
      userDates = [...new Set(userDates)];
      console.log(userDates);
      const totalTime = getTotalUserMinutes(dailyMinutes.find(a => a.id === element.id)!).totalMinutes

      let row: any = {
        "First Name": element.firstName,
        "Last Name": element.lastName,
        "Previous Minutes": element.previousMinutes.toString(),
        "Total Time (m)": (totalTime + element.previousMinutes).toString()
      }
        for (const date in userDates) {
          if (Object.prototype.hasOwnProperty.call(userDates, date)) {
            const el = userDates[date];
            row[el] = element.dailyMinutes.find(a => a.date === el)?.minutes;
            if (row[el] == 0) {
              row[el] = "";
            }
          }
        }
      await sheet.addRow(
        row
      ).then(async (row) => {
        console.log(row);
      });
    }
  }
}