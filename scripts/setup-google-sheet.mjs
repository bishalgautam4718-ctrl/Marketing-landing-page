import nextEnv from "@next/env";
import { google } from "googleapis";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const spreadsheetId = process.env.GOOGLE_SHEET_ID;
const title = process.env.GOOGLE_SHEET_TAB_NAME || "Consultation Leads";
const auth = new google.auth.JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
const sheets = google.sheets({ version: "v4", auth });
const headers = ["Lead ID", "Received At", "Client Name", "Email Address", "Phone Number", "Business / Brand", "Consultation Goals", "Status", "Source"];

const metadata = await sheets.spreadsheets.get({ spreadsheetId, fields: "sheets(properties(sheetId,title),bandedRanges(bandedRangeId))" });
let tab = metadata.data.sheets?.find((sheet) => sheet.properties?.title === title);
if (!tab) {
  const created = await sheets.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests: [{ addSheet: { properties: { title } } }] } });
  tab = { properties: created.data.replies?.[0].addSheet?.properties, bandedRanges: [] };
}
const sheetId = tab?.properties?.sheetId;
if (sheetId === undefined) throw new Error("Unable to prepare the consultation sheet.");

await sheets.spreadsheets.values.update({ spreadsheetId, range: `'${title}'!A1:I1`, valueInputOption: "RAW", requestBody: { values: [headers] } });
const requests = [
  { updateSheetProperties: { properties: { sheetId, gridProperties: { frozenRowCount: 1 } }, fields: "gridProperties.frozenRowCount" } },
  { repeatCell: { range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 9 }, cell: { userEnteredFormat: { backgroundColor: { red: .035, green: .129, blue: .235 }, textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true, fontSize: 11 }, horizontalAlignment: "CENTER", verticalAlignment: "MIDDLE" } }, fields: "userEnteredFormat" } },
  { updateDimensionProperties: { range: { sheetId, dimension: "ROWS", startIndex: 0, endIndex: 1 }, properties: { pixelSize: 42 }, fields: "pixelSize" } },
  { setDataValidation: { range: { sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 7, endColumnIndex: 8 }, rule: { condition: { type: "ONE_OF_LIST", values: ["New Lead", "Contacted", "Call Booked", "Converted", "Not Interested"].map((userEnteredValue) => ({ userEnteredValue })) }, strict: true, showCustomUi: true } } },
  { setBasicFilter: { filter: { range: { sheetId, startRowIndex: 0, startColumnIndex: 0, endColumnIndex: 9 } } } },
];
[120, 175, 170, 220, 150, 190, 390, 130, 160].forEach((pixelSize, index) => requests.push({ updateDimensionProperties: { range: { sheetId, dimension: "COLUMNS", startIndex: index, endIndex: index + 1 }, properties: { pixelSize }, fields: "pixelSize" } }));
if (!tab.bandedRanges?.length) requests.push({ addBanding: { bandedRange: { range: { sheetId, startRowIndex: 0, endRowIndex: 1000, startColumnIndex: 0, endColumnIndex: 9 }, rowProperties: { headerColor: { red: .035, green: .129, blue: .235 }, firstBandColor: { red: 1, green: 1, blue: 1 }, secondBandColor: { red: .93, green: .97, blue: 1 } } } } });
await sheets.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests } });
console.log(`Google Sheet tab ready: ${title}`);
