import { useMemo, useState } from "react";
import { message } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import ReButton from "./Button";

const escapeCsv = (value) => {
  if (value === null || value === undefined) return "";
  const str = String(value);
  // Quote if it contains comma, quote, or newline
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const getByPath = (obj, path) => {
  if (!obj || !path) return undefined;
  return String(path)
    .split(".")
    .reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
};

/**
 * Reusable CSV Export button
 *
 * Pass `columns` same as antd table columns.
 * - Uses `dataIndex` as export field (supports dot paths)
 * - Uses `title` as header label
 *
 * Example:
 * <ExportButton filename="wallets" columns={columns} data={tableData} />
 */
const ExportButton = ({
  filename = "export",
  columns = [],
  data = [],
  getExportData,
  disabled = false,
  buttonText = "Export",
}) => {
  const [downloading, setDownloading] = useState(false);

  const exportableColumns = useMemo(() => {
    return (columns || [])
      .filter((c) => c && c.dataIndex && c.title && c.key !== "actions")
      .map((c) => ({
        header: typeof c.title === "string" ? c.title : String(c.title),
        dataIndex: c.dataIndex,
      }));
  }, [columns]);

  const handleExport = async () => {
    try {
      if (disabled) return;
      setDownloading(true);

      const exportData =
        typeof getExportData === "function" ? await getExportData() : data;

      if (!Array.isArray(exportData) || exportData.length === 0) {
        message.warning("No data to export");
        return;
      }
      if (!exportableColumns.length) {
        message.warning("No exportable columns found");
        return;
      }
      const headers = exportableColumns.map((c) => escapeCsv(c.header)).join(",");
      const rows = exportData.map((row) => {
        return exportableColumns
          .map((c) => {
            const idx = c.dataIndex;
            const value = Array.isArray(idx)
              ? idx.map((k) => row?.[k]).join(" ")
              : typeof idx === "string"
                ? getByPath(row, idx)
                : row?.[idx];
            return escapeCsv(value);
          })
          .join(",");
      });

      const csv = [headers, ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      message.error("Export failed");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <ReButton
      name={buttonText}
      type="primary"
      onClick={handleExport}
      icon={<DownloadOutlined />}
      loading={downloading}
      disabled={disabled}
    />
  );
};

export default ExportButton;
