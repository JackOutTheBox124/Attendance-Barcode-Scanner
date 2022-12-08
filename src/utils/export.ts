import { Student } from "../models/database";
import * as constants from "../constants";

export async function timestampsToFinalTime(studentID: number) {
  const student = await Student.findOne({ where: { id: studentID } });
  let totalTime = 0;
  if (!student) {
    return 0;
  }
  else {
    const parsedJSON = JSON.parse(student.timestamps);
    for (let i = 0; i < parsedJSON.length; i++) {
      totalTime += parsedJSON[i].log_out - parsedJSON[i].log_in;
    }
    return totalTime;
  }
}

export async function buildAllTimestampsJSON() {
  const students = await Student.findAll();
  const allTimestamps = [];
  for (let i = 0; i < students.length; i++) {
    allTimestamps.push(
      {
        "id": students[i].id,
        "timestamps": await timestampsToFinalTime(students[i].id)
      }
    );
    // allTimestamps[students[i].id] = JSON.parse(students[i].timestamps);
  }
  return allTimestamps;
}

export async function advancedBuildAllTimestampsJSON() {
  const students = await Student.findAll();
  const allTimestamps: { id: number; timestamps: number; }[] = [];
  for (let i = 0; i < students.length; i++) {
    const timestamp: number = await timestampsToFinalTime(students[i].id);
    allTimestamps.push(
      {
        "id": students[i].id,
        "timestamps": timestamp
      }
    );
    // allTimestamps[students[i].id] = JSON.parse(students[i].timestamps);
  }
  return allTimestamps;
}

export function convertToCSV(objArray: { id: number; timestamps: number; }[]) {
  const array = typeof objArray != "object" ? JSON.parse(objArray) : objArray;
  let str = "";

  for (let i = 0; i < array.length; i++) {
    let line = "";
    for (const index in array[i]) {
      if (line != "") line += ",";

      line += array[i][index];
    }

    str += line + "\r\n";
  }

  return "id,totalTime\n" + str;
}

// checks if each timstamp is equal to or greater than the minimum attendance time
export function advancedConvertToCSV(objArray: { id: number; timestamps: number; }[]) {
  const array = typeof objArray != "object" ? JSON.parse(objArray) : objArray;
  let str = "";
  const passArray = [];
  const failArray = [];

  for (let i = 0; i < array.length; i++) {
    let line = "";
    for (const index in array[i]) {
      if (line != "") line += ",";

      line += array[i][index];
    }

    if (array[i].timestamps >= constants.MINIMUM_ATTENDANCE_TIME_MS) {
      passArray.push(array[i]);
    }
    else {
      failArray.push(array[i]);
    }
  }

  for (let i = 0; i < Math.max(passArray.length, failArray.length); i++) {
    const passID = passArray[i] ? passArray[i].id : "";
    const passTime = passArray[i] ? passArray[i].timestamps : "";
    const failID = failArray[i] ? failArray[i].id : "";
    const failTime = failArray[i] ? failArray[i].timestamps : "";
    str = str + passID + "," + passTime + ",," + failID + "," + failTime + "\r\n";
  }
  console.log(passArray);
  console.log(failArray);
  
  console.log(str);
  

  return "pass,,,fail\nid,totalTime (ms),,id,totalTime(ms)\n" + str;
}

export function passAndFailArray(objArray: { id: number; timestamps: number; }[]) {
  const array = typeof objArray != "object" ? JSON.parse(objArray) : objArray;
  const passArray = [];
  const failArray = [];

  for (let i = 0; i < array.length; i++) {
    if (array[i].timestamps >= constants.MINIMUM_ATTENDANCE_TIME_MS) {
      passArray.push(array[i]);
    }
    else {
      failArray.push(array[i]);
    }
  }

  return [passArray, failArray];
}