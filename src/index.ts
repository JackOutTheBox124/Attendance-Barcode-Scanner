import { timeStampValid, updateTimestamp } from "./utils/manageDB";
import * as readline from "node:readline";
var colors = require('colors/safe');

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

const reader: readline.Interface = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

reader.on('line', async (input: any) => {
  console.log(`Received: ${input}`);
  if (input.length !== 9) return;
  if(isNaN(input)) return;
  try {
    input = Number.parseInt(input)
  }
  catch(err) {
    return
  }
  if (!await timeStampValid(input)) return;
  await sleep(1000);
  
  console.log(colors.green(input + ' is valid!'));
  updateTimestamp(input);
});