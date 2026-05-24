"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Header } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { products } from "@/lib/data";
import { calculatePcf } from "@/lib/calculations";
import { CATEGORY_LABELS, CATEGORY_COLORS, formatCo2eFull, SCOPE_COLORS } from "@/lib/constants";
import type { ProductCategory, GhgScope } from "@/lib/types";
import { ArrowUpDown, Search } from "lucide-react";

type SortKey = "name" | "co2e_asc" | "co2e_desc";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [sort, setSort] = useState<SortKey>("co2e_desc");

  const productsWithPcf = useMemo(() => {
    return products.map((product) => {
      const pcf = calculatePcf(product, "cradle-to-gate");
      return { product, pcf };
    });
  }, []);

  const filtered = useMemo(() => {
    let result = [...productsWithPcf];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        ({ product }) =>
          product.name.toLowerCase().includes(q) ||
          product.description.toLowerCase().includes(q)
      );
    }

    if (categoryFilter) {
      result = result.filter(
        ({ product }) => product.category === categoryFilter
      );
    }

    if (sort === "co2e_desc") {
      result.sort((a, b) => b.pcf.totalCo2e - a.pcf.totalCo2e);
    } else if (sort === "co2e_asc") {
      result.sort((a, b) => a.pcf.totalCo2e - b.pcf.totalCo2e);
    } else {
      result.sort((a, b) => a.product.name.localeCompare(b.product.name));
    }

    return result;
  }, [productsWithPcf, search, categoryFilter, sort]);

  const categories = Object.entries(CATEGORY_LABELS);

  return (
    <div>
      <Header
        title="제품 관리"
        description="등록된 제품의 탄소 발자국(PCF) 현황"
      />

      <div className="p-8 space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="제품 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border bg-white py-2 pl-10 pr-4 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setCategoryFilter("")}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                !categoryFilter
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              전체
            </button>
            {categories.map(([key, label]) => (
              <button
                key={key}
                onClick={() => setCategoryFilter(key)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  categoryFilter === key
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {label.ko}
              </button>
            ))}
          </div>

          <button
            onClick={() =>
              setSort((prev) =>
                prev === "co2e_desc"
                  ? "co2e_asc"
                  : prev === "co2e_asc"
                    ? "name"
                    : "co2e_desc"
              )
            }
            className="flex items-center gap-1 rounded-lg border bg-white px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50"
          >
            <ArrowUpDown className="h-3 w-3" />
            {sort === "co2e_desc"
              ? "CO₂e ↓"
              : sort === "co2e_asc"
                ? "CO₂e ↑"
                : "이름순"}
          </button>
        </div>

        {/* Product Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map(({ product, pcf }) => {
            const total = pcf.totalCo2e;
            const scopes: GhgScope[] = ["scope1", "scope2", "scope3"];

            return (
              <Link key={product.id} href={`/products/${product.id}`}>
                <Card className="cursor-pointer transition-shadow hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {product.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {product.description}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        style={{
                          backgroundColor:
                            CATEGORY_COLORS[product.category as ProductCategory] +
                            "20",
                          color:
                            CATEGORY_COLORS[product.category as ProductCategory],
                        }}
                        className="ml-2 shrink-0"
                      >
                        {
                          CATEGORY_LABELS[product.category as ProductCategory]
                            ?.ko
                        }
                      </Badge>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-bold text-gray-900">
                          {formatCo2eFull(total)}
                        </span>
                        <span className="text-xs text-gray-400">
                          / {product.functionalUnit}
                        </span>
                      </div>

                      {/* Scope mini bar */}
                      <div className="mt-3 flex h-2 rounded-full overflow-hidden bg-gray-100">
                        {scopes.map((scope) => {
                          const pct =
                            total > 0
                              ? (pcf.byScope[scope] / total) * 100
                              : 0;
                          return (
                            <div
                              key={scope}
                              className="h-full"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: SCOPE_COLORS[scope],
                              }}
                            />
                          );
                        })}
                      </div>
                      <div className="mt-2 flex justify-between text-[10px] text-gray-400">
                        <span>Scope 1</span>
                        <span>Scope 2</span>
                        <span>Scope 3</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
