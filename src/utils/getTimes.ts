import { Student } from "../models/database";

export async function getTimes(studentID: number) {
  const student = await Student.findOne({ where: { id: studentID } });
  let tempArr = [];
  let dailyMinutes: {date: string, minutes: number}[] = [];
  if (!student) return [];

  const parsedJSON = JSON.parse(student.timestamps);
  for (let i = 0; i < parsedJSON.length; i++) {
    // let timestamp = parsedJSON[0].log_in;
    let logInTime = new Date(parsedJSON[i].log_in);
    let logOutTime = new Date(parsedJSON[i].log_out);
  
    console.log("Log in:  " + new Date(logInTime.toString()));
    console.log("Log out: " + new Date(logOutTime.toString()));
    console.log("Minutes: " + (logOutTime.getTime() - logInTime.getTime()) / 60000);
  }
}