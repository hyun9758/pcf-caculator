# CarbonTrack - PCF 대시보드

제품 탄소 발자국(Product Carbon Footprint, PCF)을 시각화하는 인터랙티브 대시보드입니다.
GHG Protocol Product Standard 기반으로 전과정(LCA) 탄소 배출량을 측정·분석·시뮬레이션합니다.

> **대상 사용자**: 탄소 배출 관리 실무자 및 경영진
> **기술 스택**: TypeScript, Next.js 15, Tailwind CSS, Nivo Charts, PostgreSQL (Optional)

---

## 주요 기능

### 1. 탄소 배출 대시보드 (`/dashboard`)
- **KPI 카드**: 총 배출량, 제품당 평균, 전분기 대비 변화율, 평가 제품 수
- **GHG Scope별 도넛 차트**: Scope 1(직접) / Scope 2(전력) / Scope 3(공급망) 비율
- **분기별 추세 라인 차트**: 8분기 시계열, Scope별 분리 가능
- **제품별 배출 순위**: 가로 바 차트
- **경영자/실무자 뷰 토글**: 같은 데이터를 다른 깊이로 제공

### 2. 제품 PCF 상세 (`/products/[id]`)
- **Sankey 다이어그램**: 원소재 → 제조 → 운송 → 총배출 흐름 시각화
- **Scope 파이 차트**: 제품별 Scope 분포
- **활동 데이터 테이블**: 항목별 배출계수, 수량, CO₂e 상세
- **시스템 경계 전환**: Cradle-to-Gate ↔ Cradle-to-Grave 토글

### 3. 데이터 입력 (`/input`)
- **CRUD**: 활동 데이터 추가/삭제 실동작
- **탭 구성**: 원소재 | 에너지 | 운송
- **배출계수 드롭다운**: 카테고리별 배출계수 선택
- **실시간 PCF 프리뷰**: 데이터 변경 즉시 반영

### 4. 제품 비교 (`/compare`)
- **최대 4개 제품 동시 비교**
- **전과정 단계별 그룹 바 차트**
- **상세 비교 테이블**: Scope별, 단계별 수치 + 최대값 강조

### 5. 감축 시뮬레이션 (`/simulation`)
- **4가지 시나리오**: 재생에너지 전환, 재생 원소재 확대, 운송 최적화, 에너지 효율 개선
- **복수 시나리오 조합**: 누적 감축 효과 계산
- **현재 vs 시뮬레이션 비교 차트**
- **항목별 변화 상세 테이블** (변화량 + 변화율)

### 6. 반응형 디자인
- 모바일 Sidebar (햄버거 메뉴 + 오버레이)
- 로딩 스켈레톤 애니메이션
- 404 페이지

---

## 빠른 시작

### A. In-memory 모드 (DB 없이 바로 실행)

```bash
npm install
npm run dev
```

http://localhost:3000 접속

### B. PostgreSQL 모드 (Docker)

```bash
# 1. Postgres 컨테이너 실행
docker compose up -d

# 2. 환경변수 설정
cp .env.example .env
# .env에 USE_DB=true 추가

# 3. 의존성 설치 + Prisma 클라이언트 생성
npm install
npx prisma generate

# 4. DB 마이그레이션 + 시드 데이터 투입
npx prisma migrate dev --name init
npm run db:seed

# 5. 개발 서버 실행
npm run dev
```

DB 관리: `npm run db:studio` (Prisma Studio GUI)

---

## 기술 스택

| 영역 | 선택 | 이유 |
|------|------|------|
| Framework | Next.js 15 (App Router) | SSR/RSC 활용, 파일 기반 라우팅 |
| Language | TypeScript | 도메인 타입의 컴파일 타임 검증 |
| UI | Tailwind CSS + shadcn/ui | 빠른 개발, 일관된 디자인 시스템 |
| Charts | Nivo (Sankey, Bar, Pie, Line) | Sankey 네이티브 지원, React 선언적 API |
| Icons | lucide-react | shadcn/ui 생태계 호환 |
| DB | PostgreSQL 16 + Prisma 7 | Repository 패턴으로 In-memory/DB 전환 가능 |

---

## 프로젝트 구조

```
src/
├── app/
│   ├── dashboard/              # 탄소 배출 대시보드
│   ├── products/               # 제품 목록 + [id] 상세
│   ├── input/                  # 활동 데이터 입력 (CRUD)
│   ├── compare/                # 제품 비교
│   ├── simulation/             # 감축 시뮬레이션
│   └── api/                    # REST API
│       ├── products/           # 제품 CRUD
│       ├── pcf/                # PCF 계산
│       ├── emission-factors/   # 배출계수 조회
│       ├── activity-data/      # 활동 데이터 CRUD
│       └── dashboard/          # 대시보드 KPI + 추세
├── components/
│   ├── layout/                 # Sidebar, Header, ViewToggle
│   ├── dashboard/              # KpiCard, EmissionsByScope, TrendChart, TopEmitters
│   ├── pcf/                    # LifecycleSankey, ScopePieChart, PcfSummaryCard
│   └── ui/                    # shadcn/ui 공통 컴포넌트
├── lib/
│   ├── types/                  # Product, EmissionFactor, ActivityData, PcfResult
│   ├── calculations/           # PCF 계산 엔진 (순수 함수)
│   ├── data/                   # Mock 데이터 + Repository 추상화
│   ├── prisma.ts               # Prisma 클라이언트
│   └── constants.ts            # 라벨, 색상, 포맷터
├── contexts/                   # ViewMode Context (경영자/실무자)
└── stores/                     # 클라이언트 상태 관리
```

---

## PCF 도메인 모델

### GHG Protocol Scopes
| Scope | 설명 | 예시 |
|-------|------|------|
| Scope 1 | 직접 배출 | 자사 공장 연소, 공정 배출 |
| Scope 2 | 간접 배출 | 구매 전력, 스팀 |
| Scope 3 | 기타 간접 | 원소재 채굴, 운송, 사용, 폐기 |

### 전과정 평가 (LCA) 단계
```
원소재 취득 → 제조 → 운송/유통 → 사용 → 폐기/재활용
```

### 시스템 경계
- **Cradle-to-Gate**: 원소재 ~ 공장 출하 (제조사 관점)
- **Cradle-to-Grave**: 원소재 ~ 폐기 (전체 수명주기)

### 계산 공식
```
CO₂e = 활동 데이터(수량) × 배출계수(kgCO₂e/단위)
제품 PCF = Σ (각 활동 항목의 CO₂e)
```

### Mock 데이터 (5개 제품)
| 제품 | 기능단위 | 총 CO₂e | 지배적 단계 | 지배적 Scope |
|------|----------|---------|-------------|--------------|
| 열연강판 | 1 ton | ~1,855 kg | 제조 (고로) | Scope 1 |
| 노트북 | 1 unit | ~350 kg | 원소재 (반도체) | Scope 3 |
| 골판지 박스 | 1,000개 | ~480 kg | 원소재 (펄프) | Scope 3 |
| 리튬이온 배터리셀 | 1 kWh | ~50 kg | 제조 (전극) | Scope 2 |
| PET 병 | 1,000개 | ~85 kg | 원소재 (석유) | Scope 3 |

배출계수 출처: ecoinvent 3.9, IPCC 2021, 환경부 2023, DEFRA 2023

---

## 설계 결정

### 1. Repository 패턴 (In-memory ↔ Postgres)
`lib/data/repository.ts`에서 `USE_DB` 환경변수로 데이터 소스 전환. 계산 엔진(`pcf-engine.ts`)은 DB 의존 없이 순수 함수로 유지.

### 2. 경영자 vs 실무자 뷰
`ViewModeContext` 기반 조건 렌더링. 경영자는 KPI + 추세, 실무자는 + Lifecycle 상세 + Scope 분석. 별도 페이지 대신 토글 방식이 같은 데이터의 다른 깊이를 자연스럽게 제공.

### 3. Sankey 다이어그램
PCF 전과정 흐름을 3단계로 시각화: 입력 소스 → 전과정 단계 → 총 배출량. 탄소 회계에서 가장 직관적인 시각화 방식.

### 4. 감축 시뮬레이션
배출계수에 감축 비율을 곱하는 방식. 복수 시나리오 조합 시 비율을 누적 곱하여 현실적 감축 효과 반영.

### 5. API 설계
RESTful API로 클라이언트-서버 분리. 계산 로직은 서버 사이드에서 실행하여 일관성 보장.

---

## API 엔드포인트

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/products` | 제품 목록 (카테고리 필터, CO₂e 정렬) |
| GET | `/api/products/[id]` | 제품 상세 + PCF 결과 |
| POST | `/api/pcf/calculate` | PCF 계산 실행 |
| GET | `/api/pcf/results/[id]` | 계산 결과 조회 |
| GET | `/api/emission-factors` | 배출계수 목록 |
| GET/POST/DELETE | `/api/activity-data` | 활동 데이터 CRUD |
| GET | `/api/dashboard/summary` | 대시보드 KPI |
| GET | `/api/dashboard/trends` | 분기별 시계열 |

---

## AI 활용 투명성

- **AI 도구**: Claude (Anthropic)
- **활용 범위**:
  - 프로젝트 구조 설계 및 구현 계획 수립
  - TypeScript 타입 정의 및 컴포넌트 코드 작성
  - Mock 데이터 생성 (배출계수 값은 공개 자료 참조)
  - README 및 문서 작성
- **직접 판단한 부분**:
  - PCF 도메인 모델 설계 (타입 구조, 관계)
  - 경영자/실무자 뷰 분기 전략
  - Sankey 다이어그램 데이터 변환 로직
  - 배출계수 값의 현실성 검증
  - UX 흐름 (정보 배치, 인터랙션 설계)
  - 감축 시뮬레이션 시나리오 설계

---

## 향후 확장 가능 사항

- 사용자 인증 및 멀티테넌트
- CSV/Excel 대량 데이터 업로드
- PDF 보고서 생성 (ISO 14067 형식)
- 실제 배출계수 DB 연동 (ecoinvent API)
- 감축 목표 설정 및 진척 추적
- 공급업체별 Scope 3 분석
