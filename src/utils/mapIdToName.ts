import { GoogleSpreadsheet } from "google-spreadsheet";

export async function mapIdToName(doc: GoogleSpreadsheet) {//, idArray: number[] = [], nameArray: string[] = []) {
  const userIdList: {id: number, name: string, previousMin: number}[] = [];
  if(!doc.sheetsByIndex[2]) {
    await doc.addSheet({ title: "Variables" });
  }
  const variableSheet = doc.sheetsByIndex[2];

  await variableSheet.updateProperties({ 
    title: "Variables",
    gridProperties: {
      rowCount: 100,
      columnCount: 3,
      frozenRowCount: 1
    }
  });
  await variableSheet.setHeaderRow(["Student ID",	"Student Name",	"Previous Min"]);

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
  console.log("userIdList:\n"+JSON.stringify(userIdList));






}