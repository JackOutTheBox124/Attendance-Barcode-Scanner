import { timeStampValid, updateTimestamp } from "./utils/timestampUtils";
import * as readline from "node:readline";
import * as constants from "./constants";
import colors from "colors/safe"

// This function will return a promise that resolves after the specified amount of milliseconds.
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

// readline interface reads input from the command line
// This is used to get the input from the barcode scanner which acts as a keyboard
const reader: readline.Interface = readline.createInterface({
  input: process.stdin,
});

// The `line` event is emitted when an end-of-line input (\n ,\r , \r\n) is entered in the reader input.
// When the barcode scanner we use scans a barcode, it adds an end-of-line input to the end of the code. 
reader.on("line", async (input: string) => {
  console.log(`Received: ${input}`);
  // Exits early if the scanned barcode does not match with the given barcode regular expression.
  if(!input.match(constants.BARCODE_REGEX)) return;

  // Parses the student ID from the scanner input into a number.
  const studentID: number = Number.parseInt(input)
  // Checks if the studentID 
  const isTimestampValid = await timeStampValid(studentID)
  switch (isTimestampValid) {
    case 1:
      console.log(colors.green(input + " has logged ") + colors.blue("in"));
      break;
    case 0:
      console.log(colors.green(input + "has logged ") + colors.red("out"));
      break;
    default:
      return console.log(colors.red(input + " in invalid!"))
  }

  // If the timestamp is valid, the updateTimestamp function is ran.
  if (isTimestampValid >= 0) {
    updateTimestamp(studentID);
  }
  // Sleeps for one second before processing next input.
  await sleep(1000);
});