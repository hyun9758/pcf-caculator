# CarbonTrack - PCF 대시보드

제품 탄소 발자국(Product Carbon Footprint, PCF)을 시각화하는 인터랙티브 대시보드입니다.
GHG Protocol Product Standard 기반으로 전과정(LCA) 데이터를 분석합니다.

## 작업 소요 시간

- **총 소요 시간**: 약 X시간 (기록 예정)
- **시간이 많이 소요된 부분**:
  - Mock 데이터 설계: 사실적인 배출계수와 활동 데이터를 만들기 위해 ecoinvent, IPCC 자료 참조
  - Sankey 다이어그램: Nivo Sankey 데이터 구조를 PCF 전과정에 맞게 변환
  - 경영자/실무자 뷰 분기: 동일 데이터의 다른 깊이의 시각화 설계

## 빠른 시작

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

http://localhost:3000 접속

## 기술 스택

| 영역 | 선택 | 이유 |
|------|------|------|
| Framework | Next.js 15 (App Router) | 과제 요구사항. SSR/RSC 활용, 파일 기반 라우팅 |
| Language | TypeScript | 과제 요구사항. 도메인 타입의 컴파일 타임 검증 |
| UI | Tailwind CSS + shadcn/ui | 빠른 개발 속도, 일관된 디자인 시스템 |
| Charts | Nivo (Sankey, Bar, Pie, Line) | Sankey 다이어그램 네이티브 지원, React 선언적 API |
| Icons | lucide-react | shadcn/ui 생태계 호환 |
| Data | In-memory mock data | 2-3일 타임박스에 최적. API 레이어 추상화로 DB 전환 용이 |

## 프로젝트 구조

```
src/
├── app/                    # Next.js App Router 페이지
│   ├── dashboard/          # 탄소 배출 대시보드 (메인)
│   ├── products/           # 제품 목록 + 상세 (Sankey)
│   ├── input/              # 활동 데이터 입력/관리
│   ├── compare/            # 제품간 비교 분석
│   └── api/                # REST API 엔드포인트
├── components/
│   ├── layout/             # Sidebar, Header, ViewToggle
│   ├── dashboard/          # KpiCard, 차트 컴포넌트
│   ├── pcf/                # Sankey, ScopePie, PcfSummary
│   └── ui/                 # shadcn/ui 기반 공통 컴포넌트
├── lib/
│   ├── types/              # 도메인 타입 (Product, Emission, PCF)
│   ├── calculations/       # PCF 계산 엔진
│   ├── data/               # Mock 데이터
│   └── constants.ts        # 라벨, 색상, 포맷터
└── contexts/               # ViewMode Context (경영자/실무자)
```

## PCF 도메인 모델

### GHG Protocol Scopes
- **Scope 1 (직접 배출)**: 자사 시설에서의 화석연료 연소, 공정 배출
- **Scope 2 (간접 배출)**: 구매 전력, 스팀 등 에너지 사용에 의한 배출
- **Scope 3 (기타 간접)**: 공급망(원소재 채굴), 운송, 사용 단계, 폐기 등

### 전과정 평가 (LCA) 단계
```
원소재 취득 → 제조 → 운송/유통 → 사용 → 폐기/재활용
```

### 시스템 경계
- **Cradle-to-Gate**: 원소재 ~ 운송 (제조사 관점)
- **Cradle-to-Grave**: 원소재 ~ 폐기 (전체 수명주기)

### 계산 공식
```
CO₂e = 활동 데이터(수량) × 배출계수(kgCO₂e/단위)
제품 PCF = Σ (각 활동 항목의 CO₂e)
```

## 설계 결정

### 1. In-memory Data vs Database
**선택: In-memory** — `lib/data/` 모듈에 mock 데이터 저장. API 라우트가 이 모듈을 호출하므로, Prisma/Postgres로 전환 시 data 레이어만 교체하면 됨.

**Trade-off**: 데이터 영속성은 없지만, 2-3일 타임박스에서 UI/UX와 도메인 로직에 집중 가능.

### 2. 경영자 vs 실무자 뷰
**선택: Context 기반 조건 렌더링** — 별도 페이지가 아닌 `ViewModeContext`로 동일 페이지에서 뷰 전환.

- 경영자: KPI, 추세, 고수준 차트 (핵심 지표 중심)
- 실무자: + Lifecycle 단계별 분석, Scope 상세, 드릴다운

**이유**: 두 사용자가 같은 데이터를 다른 깊이로 볼 필요가 있어, 별도 페이지보다 토글이 UX 관점에서 자연스러움.

### 3. Sankey 다이어그램
**선택: Nivo @nivo/sankey** — PCF 전과정의 에너지/물질 흐름을 직관적으로 시각화.

입력 소스(철광석, 전력 등) → 전과정 단계(원소재, 제조 등) → 총 배출량으로 흐르는 3단계 Sankey.

**Trade-off**: Sankey는 데이터 변환이 복잡하지만, 탄소 회계에서 가장 직관적인 시각화.

### 4. 배출계수 데이터
ecoinvent 3.9, IPCC 2021, 환경부 2023, DEFRA 2023 기반의 사실적인 값 사용.
재활용 크레딧(음수 값)도 포함하여 순환경제 효과 반영.

### 5. API 설계
RESTful API로 클라이언트-서버 분리. 계산 로직은 서버 사이드(`/api/pcf/calculate`)에서 실행.
확장 시 외부 시스템과의 연동 용이.

## AI 활용 투명성

- **AI 도구**: Claude (Anthropic)
- **활용 범위**:
  - 프로젝트 구조 설계 및 구현 계획 수립
  - TypeScript 타입 정의 및 컴포넌트 코드 작성
  - Mock 데이터 생성 (배출계수 값은 공개 자료 기반)
  - README 및 문서 작성
- **직접 판단한 부분**:
  - PCF 도메인 모델 설계 (어떤 타입이 필요한지, 관계 구조)
  - 경영자/실무자 뷰 분기 전략
  - Sankey 다이어그램 데이터 변환 로직
  - 배출계수 값의 현실성 검증
  - UX 흐름 결정 (어떤 정보를 어디에 배치할지)

## 주요 기능

1. **탄소 배출 대시보드**: KPI, Scope 분포, 분기별 추세, 제품 순위, 경영자/실무자 뷰
2. **제품 PCF 상세**: Sankey 전과정 흐름, 활동 데이터 테이블, Cradle-to-gate/grave 전환
3. **데이터 입력 (CRUD)**: 활동 데이터 추가/삭제, 배출계수 드롭다운, 실시간 PCF 프리뷰
4. **제품 비교**: 최대 4개 제품 비교 차트 및 상세 테이블
5. **감축 시뮬레이션**: 4가지 감축 시나리오 (재생에너지, 재생 원소재, 운송 최적화, 에너지 효율)
6. **반응형 디자인**: 모바일 Sidebar collapse, 로딩 스켈레톤, 404 페이지

## 향후 확장 가능 사항

- Prisma + PostgreSQL 데이터베이스 연동
- 사용자 인증 및 멀티테넌트
- CSV/Excel 대량 데이터 업로드
- PDF 보고서 생성
- 실제 배출계수 DB 연동 (ecoinvent API)
