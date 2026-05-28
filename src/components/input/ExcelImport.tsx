"use client";

import { useState, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileSpreadsheet, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import type { ActivityData } from "@/lib/types";

interface ExcelImportProps {
  productId: string;
  onImport: (data: ActivityData[]) => void;
}

export function ExcelImport({ productId, onImport }: ExcelImportProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    imported: number;
    errors?: string[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(
    async (file: File) => {
      setIsUploading(true);
      setResult(null);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("productId", productId);

        const res = await fetch("/api/import", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          setResult({ success: false, imported: 0, errors: [data.error] });
          return;
        }

        setResult({
          success: true,
          imported: data.imported,
          errors: data.errors,
        });

        if (data.data && data.data.length > 0) {
          onImport(data.data);
        }
      } catch (e) {
        setResult({
          success: false,
          imported: 0,
          errors: [e instanceof Error ? e.message : "업로드 실패"],
        });
      } finally {
        setIsUploading(false);
      }
    },
    [productId, onImport]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && (file.name.endsWith(".xlsx") || file.name.endsWith(".xls"))) {
        handleUpload(file);
      }
    },
    [handleUpload]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleUpload(file);
    },
    [handleUpload]
  );

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-blue-600" />
          Excel 임포트
          <span className="text-xs font-normal text-blue-400">
            과제용 데이터 Excel 직접 업로드
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-blue-200 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileSelect}
            className="hidden"
          />

          {isUploading ? (
            <div>
              <Loader2 className="h-8 w-8 mx-auto text-blue-400 animate-spin mb-2" />
              <p className="text-sm text-gray-500">파일 처리 중...</p>
            </div>
          ) : (
            <div>
              <Upload className="h-8 w-8 mx-auto text-blue-300 mb-2" />
              <p className="text-sm text-gray-600 font-medium">
                Excel 파일을 드래그하거나 클릭하여 업로드
              </p>
              <p className="text-xs text-gray-400 mt-1">
                과제 제공 Excel의 &quot;과제용 데이터&quot; 시트를 자동 인식합니다
              </p>
            </div>
          )}
        </div>

        {/* Result */}
        {result && (
          <div
            className={`mt-4 rounded-lg p-3 text-sm ${
              result.success
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            {result.success ? (
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-4 w-4" />
                <span>
                  <strong>{result.imported}건</strong> 임포트 완료
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-4 w-4" />
                <span>임포트 실패</span>
              </div>
            )}
            {result.errors && result.errors.length > 0 && (
              <ul className="mt-2 space-y-1 text-xs text-gray-500">
                {result.errors.map((err, i) => (
                  <li key={i}>⚠ {err}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
