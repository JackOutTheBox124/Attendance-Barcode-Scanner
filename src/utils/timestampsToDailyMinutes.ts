import { Student } from "../models/database";

export async function timestampsToDailyMinutes(studentID: number) {
  const student = await Student.findOne({ where: { id: studentID } });
  let tempArr = [];
  let dailyMinutes: {date: string, minutes: number}[] = [];
  if (!student) return [];

  const parsedJSON = JSON.parse(student.timestamps);
  for (let i = 0; i < parsedJSON.length; i++) {
    // let timestamp = parsedJSON[0].log_in;
    let logInTime = new Date(parsedJSON[i].log_in);
    let logOutTime = new Date(parsedJSON[i].log_out);

    tempArr.push(
      {
        date: `${logInTime.getFullYear()}-${logInTime.getMonth() + 1}-${logInTime.getDate()}`,
        minutes: (logOutTime.getTime() - logInTime.getTime()) / 60000
      }
    );
  }

  let tempArrTwo: any = [];
  for (const { date, minutes } of tempArr) {
    tempArrTwo[date] ??= { minutes: [] };
    tempArrTwo[date].minutes.push(minutes);
  }

  for (const [date] of Object.entries(tempArrTwo)) {
    tempArrTwo[date] = { minutes: tempArrTwo[date].minutes.reduce((a: any, b: any) => a + b, 0) };
  }
  for (const [date] of Object.entries(tempArrTwo)) {
    dailyMinutes.push({ date, minutes: tempArrTwo[date].minutes});
  }
  return dailyMinutes;
}

export async function buildAllDailyMinutesJSON() {
  const students = await Student.findAll();
  const allDailyMinutes = [];
  for (let i = 0; i < students.length; i++) {
    allDailyMinutes.push(
      {
        "id": students[i].id,
        "dailyMinutes": await timestampsToDailyMinutes(students[i].id)
      }
    );
  }
  return allDailyMinutes;
}
