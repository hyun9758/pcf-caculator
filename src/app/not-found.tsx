import Link from "next/link";
import { Leaf } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Leaf className="h-16 w-16 mx-auto text-green-200 mb-4" />
        <h1 className="text-6xl font-bold text-gray-200 mb-2">404</h1>
        <p className="text-lg text-gray-500 mb-6">
          페이지를 찾을 수 없습니다
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-700 transition-colors"
        >
          대시보드로 이동
        </Link>
      </div>
    </div>
  );
}
