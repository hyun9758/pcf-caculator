"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2, RotateCcw } from "lucide-react";
import type { PcfResult } from "@/lib/types";

interface AiAnalysisProps {
  pcfResult: PcfResult;
}

export function AiAnalysis({ pcfResult }: AiAnalysisProps) {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setContent("");

    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pcfResult }),
      });

      if (!res.ok) {
        throw new Error(`API 오류: ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("스트림을 읽을 수 없습니다");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        setContent(buffer);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "알 수 없는 오류");
    } finally {
      setIsLoading(false);
    }
  }, [pcfResult]);

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          AI 탄소 분석
          <span className="text-xs font-normal text-purple-400">
            Powered by Gemini
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!content && !isLoading && !error && (
          <div className="text-center py-6">
            <Sparkles className="h-12 w-12 mx-auto text-purple-200 mb-3" />
            <p className="text-sm text-gray-500 mb-4">
              AI가 이 제품의 탄소 배출 패턴을 분석하고
              <br />
              감축 우선순위와 구체적인 방안을 제안합니다.
            </p>
            <button
              onClick={handleAnalyze}
              className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              AI 분석 시작
            </button>
          </div>
        )}

        {isLoading && !content && (
          <div className="text-center py-6">
            <Loader2 className="h-8 w-8 mx-auto text-purple-400 animate-spin mb-3" />
            <p className="text-sm text-gray-500">
              PCF 데이터를 분석하고 있습니다...
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
            분석 중 오류가 발생했습니다: {error}
            <button
              onClick={handleAnalyze}
              className="ml-2 text-red-700 underline"
            >
              재시도
            </button>
          </div>
        )}

        {content && (
          <div className="space-y-4">
            <div
              className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-headings:text-sm prose-p:text-gray-600 prose-li:text-gray-600 prose-strong:text-gray-800"
              dangerouslySetInnerHTML={{
                __html: formatMarkdown(content),
              }}
            />
            <div className="border-t pt-3 flex justify-end">
              <button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 px-3 py-1.5 text-xs font-medium text-purple-600 hover:bg-purple-50 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RotateCcw className="h-3 w-3" />
                )}
                다시 분석
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/** 간단한 마크다운 → HTML 변환 */
function formatMarkdown(text: string): string {
  return text
    .replace(/### (.+)/g, '<h3 class="font-semibold text-gray-900 mt-4 mb-2">$1</h3>')
    .replace(/## (.+)/g, '<h2 class="font-bold text-gray-900 mt-5 mb-2">$1</h2>')
    .replace(/# (.+)/g, '<h1 class="font-bold text-gray-900 mt-5 mb-2 text-lg">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/^- (.+)/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/^(\d+)\. (.+)/gm, '<li class="ml-4 list-decimal">$2</li>')
    .replace(/\n\n/g, "<br/><br/>")
    .replace(/\n/g, "<br/>");
}
