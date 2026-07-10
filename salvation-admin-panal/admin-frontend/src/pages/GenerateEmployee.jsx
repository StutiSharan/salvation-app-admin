import { useState } from "react";
import {
  UserPlus2,
  Loader2,
  RefreshCw,
  Upload,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "react-toastify";
import { createEmployee, bulkImportEmployees } from "../api/AdminApi";

export default function GenerateEmployee() {
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedId, setGeneratedId] = useState(null);
  const [excelFile, setExcelFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  /* ================= GENERATE ================= */

  const handleGenerate = async () => {
    if (!mobile.trim()) {
      toast.error("Enter login mobile");
      return;
    }

    try {
      setLoading(true);

      const res = await createEmployee({
        loginMobile: mobile,
      });

      if (!res) return;

      setGeneratedId(res.data.employeeId);
      toast.success("Employee created successfully");
      setMobile("");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to generate employee",
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= REFRESH ================= */

  const handleRefresh = () => {
    setMobile("");
    setGeneratedId(null);
    toast.info("Form reset");
  };
  const handleBulkImport = async () => {
      console.log("Clicked Import");

    if (!excelFile) {
      toast.error("Please select an Excel file");
      return;
    }

    try {
      setImportLoading(true);

      const res = await bulkImportEmployees(excelFile);

      toast.success(`${res.data.inserted} employees imported successfully`);

      if (res.data.skipped?.length) {
        toast.info(`${res.data.skipped.length} employees skipped`);
      }

      setExcelFile(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Import failed");
    } finally {
      setImportLoading(false);
    }
  };
  return (
    <div
      className="min-h-screen bg-gray-50 p-6 space-y-6"
      style={{ zoom: "0.85" }}
    >
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-800">
            Generate Employee ID
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Create new employee account with unique ID
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 bg-[#0F2747] text-white px-4 py-2 rounded-lg shadow hover:bg-[#14345F] transition w-full sm:w-auto"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* ================= FORM CARD ================= */}
      <div className="grid lg:grid-cols-2 gap-8 mt-10">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border p-8 space-y-6">
          {/* MOBILE INPUT */}
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">
              Login Mobile Number
            </label>

            <input
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="Enter employee mobile"
              className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#0F2747] outline-none"
            />
          </div>

          {/* GENERATE BUTTON */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="
       w-full bg-[#0F2747] text-white py-3 rounded-xl font-medium
       hover:bg-[#14345F] transition disabled:opacity-50
       flex items-center justify-center gap-2
      "
          >
            {loading && <Loader2 className="animate-spin" size={18} />}
            {loading ? "Generating..." : "Generate Employee ID"}
          </button>

          {/* RESULT */}
          {generatedId && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-600">
                Employee created successfully
              </p>

              <p className="text-2xl font-semibold text-green-700 mt-1">
                {generatedId}
              </p>
            </div>
          )}
        </div>
        <div className="bg-white rounded-2xl shadow-lg border p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <FileSpreadsheet className="text-green-600" size={24} />
            </div>

            <div>
              <h2 className="text-xl font-semibold">Bulk Employee Import</h2>

              <p className="text-sm text-gray-500">
                Upload employee Excel sheet
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-2">
                Excel File
              </label>

              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setExcelFile(e.target.files[0])}
                className="
      w-full
      border
      rounded-xl
      p-3
      cursor-pointer
    "
              />
            </div>

            {excelFile && (
              <div className="rounded-xl bg-gray-50 border p-4">
                <p className="font-medium text-gray-700">{excelFile.name}</p>

                <p className="text-xs text-gray-500 mt-1">
                  {(excelFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            )}

            <button
              onClick={handleBulkImport}
              disabled={importLoading}
              className="
     w-full
     bg-green-600
     hover:bg-green-700
     text-white
     py-3
     rounded-xl
     flex
     items-center
     justify-center
     gap-2
     transition
     disabled:opacity-60
   "
            >
              {importLoading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Upload size={18} />
              )}

              {importLoading ? "Importing Employees..." : "Import Employees"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
