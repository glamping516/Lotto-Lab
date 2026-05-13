import { google } from "googleapis";

import { LottoDraw } from "@/lib/types";

function getSheetsClient() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!clientEmail || !privateKey) {
    return null;
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
  });

  return google.sheets({ version: "v4", auth });
}

function toReadableErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "Google Sheets 요청 중 알 수 없는 오류가 발생했습니다.";
  }

  const message = error.message;

  if (message.includes("The caller does not have permission")) {
    return "서비스 계정에 시트 편집 권한이 없습니다. 시트 공유 대상을 다시 확인해 주세요.";
  }

  if (message.includes("Requested entity was not found")) {
    return "GOOGLE_SHEET_ID 또는 시트 gid를 다시 확인해 주세요.";
  }

  if (message.includes("Google Sheets API has not been used")) {
    return "Google Sheets API가 아직 활성화되지 않았습니다.";
  }

  return message;
}

export async function insertDrawIntoSheet(draw: LottoDraw) {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  const sheetId = Number(process.env.GOOGLE_SHEET_GID ?? "0");
  const sheets = getSheetsClient();

  if (!spreadsheetId) {
    return {
      ok: false,
      skipped: true,
      message: "원본 spreadsheetId 필요"
    };
  }

  if (!sheets) {
    return {
      ok: false,
      skipped: true,
      message: "Google Sheets API 인증 정보가 없습니다."
    };
  }

  try {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            insertDimension: {
              range: {
                sheetId,
                dimension: "ROWS",
                startIndex: 1,
                endIndex: 2
              },
              inheritFromBefore: false
            }
          },
          {
            copyPaste: {
              source: {
                sheetId,
                startRowIndex: 2,
                endRowIndex: 3
              },
              destination: {
                sheetId,
                startRowIndex: 1,
                endRowIndex: 2
              },
              pasteType: "PASTE_FORMAT"
            }
          }
        ]
      }
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "A2:H2",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[draw.round, ...draw.numbers, draw.bonus]]
      }
    });

    return {
      ok: true,
      skipped: false,
      message: "Google Sheets 2행 삽입 완료"
    };
  } catch (error) {
    return {
      ok: false,
      skipped: true,
      message: toReadableErrorMessage(error),
      rawError: error instanceof Error ? error.message : String(error)
    };
  }
}
