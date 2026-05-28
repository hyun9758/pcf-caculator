import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { matchEmissionFactor } from "@/lib/data/emission-factors";
import { ACTIVITY_TYPE_TO_STAGE } from "@/lib/types";
import type { ActivityType, ActivityData } from "@/lib/types";

/**
 * Excel 파일 임포트 API
 * 과제 제공 Excel "과제용 데이터" 시트를 파싱하여 ActivityData 배열 반환
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const productId = formData.get("productId") as string;

    if (!file) {
      return NextResponse.json({ error: "파일이 필요합니다" }, { status: 400 });
    }
    if (!productId) {
      return NextResponse.json({ error: "productId가 필요합니다" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });

    // "과제용 데이터" 시트 찾기
    const sheetName =
      workbook.SheetNames.find((name) => name.includes("과제용 데이터")) ||
      workbook.SheetNames[1] || // 두 번째 시트
      workbook.SheetNames[0];

    const sheet = workbook.Sheets[sheetName];
    if (!sheet) {
      return NextResponse.json(
        { error: "데이터 시트를 찾을 수 없습니다" },
        { status: 400 }
      );
    }

    const rows = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: "",
    }) as unknown[][];

    // 데이터 행 파싱 (헤더 2줄 스킵 후 데이터 시작)
    const activities: ActivityData[] = [];
    const errors: string[] = [];
    let dataStarted = false;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i] as (string | number | null)[];
      if (!row || row.length < 5) continue;

      const col0 = String(row[1] || "").trim();
      const col1 = String(row[2] || "").trim();
      const col2 = String(row[3] || "").trim();
      const col3 = row[4];
      const col4 = String(row[5] || "").trim();

      // 헤더 행 감지
      if (col0 === "일자(원본)" || col0.includes("일자")) {
        dataStarted = true;
        continue;
      }

      if (!dataStarted) continue;

      // 빈 행 스킵
      if (!col0 || !col1) continue;

      // 활동 유형 확인
      const activityType = col1 as ActivityType;
      if (!["전기", "원소재", "운송"].includes(activityType)) {
        errors.push(`행 ${i + 1}: 알 수 없는 활동 유형 "${col1}"`);
        continue;
      }

      // 수량 파싱
      const quantity = typeof col3 === "number" ? col3 : parseFloat(String(col3));
      if (isNaN(quantity) || quantity <= 0) {
        errors.push(`행 ${i + 1}: 잘못된 수량 "${col3}"`);
        continue;
      }

      // 일자 파싱
      let dateStr = col0;
      if (typeof row[1] === "number") {
        // Excel serial date
        const date = XLSX.SSF.parse_date_code(row[1] as number);
        dateStr = `${date.y}-${String(date.m).padStart(2, "0")}-${String(date.d).padStart(2, "0")}`;
      }

      // 배출계수 매칭
      const ef = matchEmissionFactor(activityType, col2);
      if (!ef) {
        errors.push(`행 ${i + 1}: 배출계수를 찾을 수 없습니다 (${activityType} - ${col2})`);
        continue;
      }

      const lifecycleStage = ACTIVITY_TYPE_TO_STAGE[activityType];

      activities.push({
        id: `ad-import-${Date.now()}-${i}`,
        productId,
        date: dateStr,
        activityType,
        lifecycleStage,
        emissionFactorId: ef.id,
        description: ef.name,
        descriptionKo: col2 || ef.nameKo,
        quantity,
        unit: col4 || ef.unit,
      });
    }

    return NextResponse.json({
      success: true,
      imported: activities.length,
      errors: errors.length > 0 ? errors : undefined,
      data: activities,
    });
  } catch (e) {
    return NextResponse.json(
      { error: `파일 처리 중 오류: ${e instanceof Error ? e.message : "알 수 없는 오류"}` },
      { status: 500 }
    );
  }
}
