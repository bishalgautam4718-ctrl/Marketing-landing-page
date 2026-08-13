import { google, sheets_v4 } from "googleapis";

const HEADERS = [
  "Lead ID",
  "Received At",
  "Client Name",
  "Email Address",
  "Phone Number",
  "Business / Brand",
  "Consultation Goals",
  "Status",
  "Source",
];

export type ConsultationLead = {
  id: string;
  receivedAt: string;
  name: string;
  email: string;
  phone: string;
  business: string;
  goals: string;
};

function getSheetsClient() {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!spreadsheetId || !clientEmail || !privateKey) {
    throw new Error("Google Sheets credentials are incomplete.");
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return { spreadsheetId, sheets: google.sheets({ version: "v4", auth }) };
}

async function prepareSheet(sheets: sheets_v4.Sheets, spreadsheetId: string, title: string) {
  const metadata = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets(properties(sheetId,title),bandedRanges(bandedRangeId))",
  });
  let tab = metadata.data.sheets?.find((sheet) => sheet.properties?.title === title);

  if (!tab) {
    const created = await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: [{ addSheet: { properties: { title, gridProperties: { frozenRowCount: 1 } } } }] },
    });
    const sheetId = created.data.replies?.[0].addSheet?.properties?.sheetId;
    if (sheetId === undefined) throw new Error("Could not create the consultation sheet.");
    tab = { properties: { sheetId, title }, bandedRanges: [] };
  }

  const sheetId = tab.properties?.sheetId;
  if (sheetId === undefined) throw new Error("Could not find the consultation sheet.");

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `'${title.replace(/'/g, "''")}'!A1:I1`,
    valueInputOption: "RAW",
    requestBody: { values: [HEADERS] },
  });

  const requests: sheets_v4.Schema$Request[] = [
    {
      updateSheetProperties: {
        properties: { sheetId, gridProperties: { frozenRowCount: 1 } },
        fields: "gridProperties.frozenRowCount",
      },
    },
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 9 },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.035, green: 0.129, blue: 0.235 },
            textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true, fontSize: 11 },
            horizontalAlignment: "CENTER",
            verticalAlignment: "MIDDLE",
          },
        },
        fields: "userEnteredFormat",
      },
    },
    {
      updateDimensionProperties: {
        range: { sheetId, dimension: "ROWS", startIndex: 0, endIndex: 1 },
        properties: { pixelSize: 42 },
        fields: "pixelSize",
      },
    },
    {
      setDataValidation: {
        range: { sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 7, endColumnIndex: 8 },
        rule: {
          condition: { type: "ONE_OF_LIST", values: ["New Lead", "Contacted", "Call Booked", "Converted", "Not Interested"].map((userEnteredValue) => ({ userEnteredValue })) },
          strict: true,
          showCustomUi: true,
        },
      },
    },
    {
      setBasicFilter: { filter: { range: { sheetId, startRowIndex: 0, startColumnIndex: 0, endColumnIndex: 9 } } },
    },
  ];

  const widths = [120, 175, 170, 220, 150, 190, 390, 130, 160];
  widths.forEach((pixelSize, index) => requests.push({
    updateDimensionProperties: {
      range: { sheetId, dimension: "COLUMNS", startIndex: index, endIndex: index + 1 },
      properties: { pixelSize },
      fields: "pixelSize",
    },
  }));

  if (!tab.bandedRanges?.length) {
    requests.push({
      addBanding: {
        bandedRange: {
          range: { sheetId, startRowIndex: 0, endRowIndex: 1000, startColumnIndex: 0, endColumnIndex: 9 },
          rowProperties: {
            headerColor: { red: 0.035, green: 0.129, blue: 0.235 },
            firstBandColor: { red: 1, green: 1, blue: 1 },
            secondBandColor: { red: 0.93, green: 0.97, blue: 1 },
          },
        },
      },
    });
  }

  await sheets.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests } });
}

export async function saveConsultationLead(lead: ConsultationLead) {
  const { spreadsheetId, sheets } = getSheetsClient();
  const title = process.env.GOOGLE_SHEET_TAB_NAME?.trim() || "Consultation Leads";
  await prepareSheet(sheets, spreadsheetId, title);
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `'${title.replace(/'/g, "''")}'!A:I`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [[lead.id, lead.receivedAt, lead.name, lead.email, lead.phone, lead.business, lead.goals, "New Lead", "marketing.aiwithbishal.com"]],
    },
  });
}
