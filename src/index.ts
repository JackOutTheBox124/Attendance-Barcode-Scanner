import express from "express";
//import Sequelize
import * as constants from "./constants";
import { connect } from "./models/database";
import { timeStampValid, updateTimestamp } from "./utils/manageDB";
// express server running on port 5000 that takes post requests in the json form of {"code": "code here"}
// and returns the output of the code in the form of {"output": "output here"}

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

const app = express();
app.use(express.json());

app.post("/", async function(req, res) {
  console.log(req.body);
  console.log(req.body["barcodeData"]);

  if(!isNaN(req.body["barcodeData"])) {
    if(req.body["barcodeData"].toString().length === 9) {
      
      if (await timeStampValid(parseInt(req.body["barcodeData"]))) {
        await sleep(1000);
        console.log("valid");
        
        updateTimestamp(parseInt(req.body["barcodeData"]));
      }
      else console.log("invalid");
    }
  }

  return res.json({output: "qwerty"});
});

connect().then(() => {
  app.listen(constants.SERVER_PORT, () => {
    console.log(`Server running on port ${constants.SERVER_PORT}`);
  });
});