import fs from "node:fs/promises";
import path from "node:path";
import xlsx from "xlsx";

const cwd = process.cwd();
const dataDir = path.join(cwd, "data");
const workbookPath = path.join(dataDir, "lotto.xlsx");
const jsonPath = path.join(dataDir, "lotto.json");

function asInt(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : 0;
}

async function main() {
  try {
    const workbook = xlsx.readFile(workbookPath);
    const sheetName = workbook.SheetNames.includes("Lotto")
      ? "Lotto"
      : workbook.SheetNames[0];
    const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });
    const data = rows
      .map((row) => ({
        round: asInt(row["회차"]),
        numbers: [
          asInt(row["번호1"]),
          asInt(row["번호2"]),
          asInt(row["번호3"]),
          asInt(row["번호4"]),
          asInt(row["번호5"]),
          asInt(row["번호6"])
        ].sort((a, b) => a - b),
        bonus: asInt(row["보너스"]),
        source: "xlsx",
        updatedAt: new Date().toISOString()
      }))
      .filter((draw) => draw.round > 0)
      .sort((a, b) => b.round - a.round);

    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(jsonPath, JSON.stringify(data, null, 2), "utf8");
    console.log(`Converted ${data.length} rows to ${jsonPath}`);
  } catch (error) {
    console.warn("Skipping lotto.xlsx conversion:", error instanceof Error ? error.message : error);
  }
}

main();
