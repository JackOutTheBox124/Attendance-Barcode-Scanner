import {GoogleSpreadsheet, GoogleSpreadsheetCell, GoogleSpreadsheetWorksheet} from "google-spreadsheet";
import * as constants from "../constants";

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
    let totalMinutes = 0;
    for (let i = 0; i < user.dailyMinutes.length; i++) {
        totalMinutes += user.dailyMinutes[i].minutes;
    }
    return {
      user: user.id,
      totalMinutes: Math.trunc(totalMinutes)
    }
}

/**
 * Divides an array of users into two arrays based on whether they have passed or failed
 * @param {Array} userArray - An array of user objects
 * @param {number} userArray[].id - The ID of the user
 * @param {Array} userArray[].dailyMinutes - An array of objects with a date and number of minutes for each day
 * @param {string} userArray[].dailyMinutes[].date - The date of the attendance
 * @param {number} userArray[].dailyMinutes[].minutes - The number of minutes of attendance
 * @returns {Array} - An array containing two arrays, the first for users that have passed and the second for users that have failed
 */
export function passAndFailArray(userArray: { id: number; dailyMinutes: { date: string; minutes: number; }[]; }[]) {
  let passArray: {id: number, dailyMinutes: {date: string, minutes: number}[]}[] = [];
  let failArray: {id: number, dailyMinutes: {date: string, minutes: number}[]}[] = [];
  for (const user in userArray) {
    if (Object.prototype.hasOwnProperty.call(userArray, user)) {
    // check users total minutes of all time against the pass/fail threshold
      const element = userArray[user];
      const totalMinutes = element.dailyMinutes.reduce((a, b) => a + b.minutes, 0);
      // const previousMin = element.id
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
  // the variable sheet will have a student first name, student last name, and student ID field
  // write a loop that creates a new array that replaces the student ID with the student first name and student last name

  // the returned object will be in the form of {firstName: string, lastName: string, dailyMinutes: { date: string; minutes: number; }[];}

  let returnedObject: {id:number, firstName: string, lastName: string, previousMinutes: number, dailyMinutes: { date: string; minutes: number; }[];}[] = [];

  let variableSheet: GoogleSpreadsheetWorksheet = await doc.sheetsByIndex[2];
  let rowCount: number;
  await variableSheet.getRows().then(async (rows) => {
  rowCount = rows.length +1;
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
  dates.sort(function(a,b){
    // Turn your strings into dates, and then subtract them
    // to get a value that is either negative, positive, or zero.
    const aList: string[] = a.split("-");
    const bList: string[] = b.split("-");
    return new Date(parseInt(bList[0]), parseInt(bList[1]), parseInt(bList[2])).getTime() - 
      new Date(parseInt(aList[0]), parseInt(aList[1]), parseInt(aList[2])).getTime();
  });
  // dates.sort();
  dates = [...new Set(dates)];
  dates.forEach((date, index) => {
    const x = date.split("-");
    dates[index] = `${parseInt(x[0])}-${parseInt(x[1])}-${parseInt(x[2])}`;
    // replace(/^0+/, '');
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
        // "ID": element.id.toString(),
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