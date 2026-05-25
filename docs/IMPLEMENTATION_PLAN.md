# 구현 계획서

## 과제 개요

| 항목 | 내용 |
|------|------|
| 과제 | 탄소 관리 플랫폼 — PCF 전과정 데이터 시각화 대시보드 |
| 기술 | TypeScript, Next.js, PostgreSQL (Optional) |
| 대상 사용자 | 실무자, 경영자 |
| 기간 | 2-3일 |

## 평가 기준별 구현 전략

---

### 1. 도메인 이해 (25%)

> 탄소 회계 개념(PCF, GHG Scope)을 코드·설명에 반영했는가?

#### 반영 포인트

**타입 시스템에 도메인 내장**
```
LifecycleStage = "raw_material" | "manufacturing" | "transportation" | "use" | "end_of_life"
GhgScope = "scope1" | "scope2" | "scope3"
PcfBoundary = "cradle-to-gate" | "cradle-to-grave"
```
- GHG Protocol의 Scope 1/2/3 분류를 타입으로 강제
- ISO 14067 시스템 경계(Cradle-to-Gate / Cradle-to-Grave)를 토글로 구현
- 전과정 5단계를 상수로 정의, 순서 보장

**사실적 Mock 데이터**
- 5개 제품: 각각 다른 탄소 프로필 (철강=Scope1 지배, 전자=Scope3 지배, 배터리=Scope2 지배)
- 28개 배출계수: ecoinvent 3.9, IPCC 2021, 환경부 2023 기반 현실적 수치
- 재활용 크레딧(음수 값) 포함 → 순환경제 개념 반영

**계산 공식 구현**
```
CO₂e = Activity Data(수량) × Emission Factor(배출계수)
제품 PCF = Σ (각 활동 항목의 CO₂e)
```
- `pcf-engine.ts`에서 순수 함수로 구현
- Scope별, Lifecycle Stage별 자동 집계

**감축 시뮬레이션**
- 4가지 현실적 감축 시나리오 (재생에너지, 재생원소재, 운송최적화, 에너지효율)
- 실무에서 실제로 사용하는 감축 접근법 반영

---

### 2. 시스템 설계 (30%)

> API 활용 방식, 모듈형 컴포넌트 구조, 확장성·재사용성·안정성

#### 아키텍처

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Frontend   │────▶│  API Routes  │────▶│  Repository     │
│  (React)    │     │  (Next.js)   │     │  (추상화 레이어) │
└─────────────┘     └──────────────┘     └────────┬────────┘
                                                   │
                                          ┌────────┴────────┐
                                          │                 │
                                    ┌─────▼─────┐   ┌──────▼──────┐
                                    │ In-memory  │   │  PostgreSQL │
                                    │ Mock Data  │   │  (Prisma)   │
                                    └───────────┘   └─────────────┘
```

#### Repository 패턴
- `lib/data/repository.ts`: `USE_DB` 환경변수로 데이터 소스 전환
- 계산 엔진은 DB 의존 없음 (순수 함수)
- In-memory → Postgres 전환 시 비즈니스 로직 변경 없음

#### 컴포넌트 설계 원칙
- **재사용성**: `KpiCard`, `ScopePieChart` 등 Props만으로 다른 데이터 표시 가능
- **관심사 분리**: `components/` (UI) / `lib/calculations/` (로직) / `lib/data/` (데이터)
- **Context 패턴**: `ViewModeContext`로 경영자/실무자 뷰 전역 관리

#### API 설계
- RESTful 엔드포인트 10개
- 계산 로직은 서버 사이드 (`/api/pcf/calculate`)
- 필터/정렬 쿼리 파라미터 지원

#### DB 설계 (Prisma)
- Product ↔ ActivityData: 1:N 관계 (Cascade Delete)
- EmissionFactor ↔ ActivityData: 1:N 관계
- snake_case 테이블명 (`@@map`)

---

### 3. 사용자 경험 (25%)

> 비전문가도 직관적으로 데이터를 입력하고 결과를 읽을 수 있는가?

#### UX 설계 원칙

**1. 경영자/실무자 뷰 분기**
- 경영자: KPI 4개 + 추세 + 순위 (30초 안에 현황 파악)
- 실무자: + Lifecycle 상세 + Scope 분석 + 드릴다운

**2. 시각화 계층**
```
대시보드 (전체 현황)
  → 제품 카드 (요약)
    → 제품 상세 (Sankey + 테이블)
```
- 정보 과부하 방지: 단계별 drill-down

**3. Sankey 다이어그램**
- PCF 전과정 흐름을 한 눈에: 어디서 많이 나오는지 즉시 파악
- 비전문가도 "흐름"으로 이해 가능

**4. 실시간 피드백**
- 데이터 입력 시 사이드 패널에서 즉시 PCF 변화 확인
- 감축 시뮬레이션에서 시나리오 토글 즉시 결과 반영

**5. 한국어 UI**
- 모든 라벨, 설명, 배출계수명 한국어
- `nameKo`, `descriptionKo` 필드로 이중 언어 지원 구조

**6. 반응형**
- 모바일: 햄버거 메뉴 + 오버레이
- 로딩 스켈레톤, 404 페이지

---

### 4. 논리적 설명 (20%)

> 설계 결정 이유, trade-off, AI 활용 방식을 명확하게 말할 수 있는가?

→ `DESIGN_DECISIONS.md` 참조

---

## 일별 구현 순서

### Day 1: 기반
1. 프로젝트 초기화 (Next.js, Tailwind, shadcn/ui, Nivo)
2. 도메인 타입 정의
3. Mock 데이터 생성 (5개 제품, 28개 배출계수)
4. PCF 계산 엔진
5. REST API 라우트
6. 레이아웃 (Sidebar, Header, ViewToggle)

### Day 2: 시각화
7. 대시보드 (KPI, Scope 차트, 추세, 순위)
8. 제품 목록 + 상세 (Sankey)
9. 데이터 입력 (CRUD)
10. 제품 비교

### Day 3: 확장 + 마무리
11. 감축 시뮬레이션
12. 반응형 + 폴리시
13. Prisma + PostgreSQL 연동
14. README + 문서
15. Vercel 배포
