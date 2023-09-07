import { Student } from "../models/database";
import * as constants from "../constants";

/**
 * Verifies if the student's current timestamp is {@link constants.INDIVIDUAL_LOGGING_COOLDOWN_MS INDIVIDUAL_LOGGING_COOLDOWN_MS } greater than the current log in time
 * If the user does not yet have an existing instance in the MySQL database, a new instance is created
 * @param studentID 9 digit student ID
 * @returns 1 if logged in, 0 if logged out, -1 otherwise
 */
export async function timeStampValid(studentID: number) {
  const student = await Student.findOne({ where: { id: studentID } });
  const date: number = Date.now();

  if (!student) {
    await Student.create({
      id: studentID,
      lastLogin: 0,
    });
    return 1;
  }
  else if (student.lastLogin === 0) {
    return 1;
  }
  const timeSinceLastLogin = date - student.lastLogin;

  if (timeSinceLastLogin < constants.MAX_LOGIN_TIME_MS) {
    return 0; // User is already logged in but for less than MAX_LOGIN_TIME_MS
  }

  if (Math.abs(timeSinceLastLogin) > constants.INDIVIDUAL_LOGGING_COOLDOWN_MS) {
    return 1;
  }

  return -1;
}

/**
 * Takes a student ID and attempts to update the lastLogin timestamp to the current time in the MySQL database if it is currently equal to 0.
 * If the timestamp is not equal to 0, it will first update the timestamps coloumn to include the log in time and the current date as a log out time.
 * If the user has been logged in for a time exceeded what is set by the {@link constants.MAX_LOGIN_TIME_MS MAX_LOGIN_TIME_MS constant}, the log in timestamp will be updated to the current time.
 * @param studentID 9 digit student ID
 */
export function updateTimestamp(studentID: number) {
  const date: number = Date.now();
  Student.findOne({ where: { id: studentID } }).then(async (student) => {
    if (Math.abs(student!.lastLogin - date) > constants.MAX_LOGIN_TIME_MS) {
      await student!.update({ lastLogin: date });
    }
    else if(student!.lastLogin && student!.lastLogin !== 0) {
      const logIn: number = student!.lastLogin;
      const parsedJSON = JSON.parse(student!.timestamps);
      parsedJSON.push(
        {
          "log_in": logIn,
          "log_out": date
        }
      );
      const newTimestampArray: string = JSON.stringify(parsedJSON);
      await Student.update(
        { 
          id: studentID,
          timestamps: newTimestampArray,
          lastLogin: 0
        },
        { where: { 
          id: studentID
        }}
      );
    }
    else if (student!.lastLogin == 0) {
      Student.update({ lastLogin: date }, { where: { id: studentID } });
    }
  });
}