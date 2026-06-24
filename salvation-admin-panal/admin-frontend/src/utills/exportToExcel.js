import * as XLSX from "xlsx"
import { saveAs } from "file-saver"

export const exportToExcel = (
  data,
  fileName = "export"
) => {
  if (!data?.length) {
    alert("No data found")
    return
  }

  const cleanedData = data.map((item) => {
    const row = {}

    Object.keys(item).forEach((key) => {
      let value = item[key]

      if (
        value &&
        typeof value === "object" &&
        !(value instanceof Date)
      ) {
        value = JSON.stringify(value)
      }

      if (
        typeof value === "string" &&
        value.includes("T") &&
        value.includes("Z")
      ) {
        value = new Date(value).toLocaleDateString(
          "en-GB",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }
        )
      }

      row[key] = value
    })

    return row
  })

  const worksheet =
    XLSX.utils.json_to_sheet(cleanedData)

  const workbook =
    XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Data"
  )

  const excelBuffer = XLSX.write(
    workbook,
    {
      bookType: "xlsx",
      type: "array",
    }
  )

  const blob = new Blob(
    [excelBuffer],
    {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }
  )

  saveAs(blob, `${fileName}.xlsx`)
}