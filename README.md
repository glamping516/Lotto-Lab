# Lotto Signal Lab

Next.js + TypeScript + Tailwind CSS 기반의 로또6/45 통계 분석, 이상징후 탐지, 번호 조합 추출 웹사이트입니다.

본 서비스는 통계/오락 목적이며 당첨을 보장하지 않습니다. 동행복권과 무관한 개인 프로젝트입니다.

## 설치 방법

1. Node.js 20+ 또는 22+ 환경을 준비합니다.
2. 프로젝트 루트에서 의존성을 설치합니다.

```bash
npm install
```

## `lotto.xlsx` 넣는 위치

- 기본 위치: [data/lotto.xlsx](C:/Users/ILEX/Documents/New%20project%203/data/lotto.xlsx)
- 또는 프로젝트 루트의 `lotto.xlsx`를 `data/lotto.xlsx`로 옮겨 사용해도 됩니다.
- 현재 프로젝트는 업로드한 엑셀 파일을 `data/lotto.xlsx`로 복사해 둔 상태입니다.

## 초기 데이터 변환 방법

엑셀에서 JSON으로 변환:

```bash
npm run prepare-data
```

- 변환 대상 시트는 기본적으로 `Lotto`를 우선 사용합니다.
- `Lotto` 시트가 없으면 첫 번째 시트를 사용합니다.
- 결과 파일은 [data/lotto.json](C:/Users/ILEX/Documents/New%20project%203/data/lotto.json) 입니다.

## 개발 서버 실행 방법

```bash
npm run dev
```

실행 후 기본 주소:

- [http://localhost:3000](http://localhost:3000)

## Vercel 배포 방법

1. Git 저장소를 Vercel에 연결합니다.
2. Environment Variables에 아래 값을 설정합니다.
3. 빌드 커맨드는 기본값 `next build`를 사용합니다.
4. `vercel.json`의 Cron 설정을 함께 배포합니다.

## 환경변수 설정 방법

예시는 [.env.example](C:/Users/ILEX/Documents/New%20project%203/.env.example) 를 참고합니다.

- `CRON_SECRET`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `GOOGLE_SHEET_ID`
- `GOOGLE_SHEET_GID=0`
- `NEXT_PUBLIC_ADSENSE_CLIENT_ID`
- `NEXT_PUBLIC_AD_SLOT_TOP`
- `NEXT_PUBLIC_AD_SLOT_MIDDLE`
- `NEXT_PUBLIC_AD_SLOT_BOTTOM`

## Google Sheets API 설정 방법

1. Google Cloud에서 Sheets API를 활성화합니다.
2. 서비스 계정을 생성합니다.
3. 서비스 계정 이메일을 대상 스프레드시트에 편집자로 공유합니다.
4. 서비스 계정 이메일과 private key를 환경변수로 설정합니다.
5. 원본 스프레드시트의 `spreadsheetId`를 `GOOGLE_SHEET_ID`에 넣습니다.

중요:

- 공개보기용 `pubhtml` URL만으로는 쓰기 작업이 불가능합니다.
- 신규 회차를 2행에 삽입하려면 반드시 원본 `GOOGLE_SHEET_ID`가 필요합니다.

공개보기 URL 참고:

- [Google Sheets pubhtml](https://docs.google.com/spreadsheets/d/e/2PACX-1vQqbh9B12a6_PS0TMLjnOpqXNIoQc3To5jHo5aVJqof-qzNwZH12BFWEgvQP0xTGWiC0m6SN3-CcjSU/pubhtml?gid=0&single=true)

## Cron 동작 시간 설명

Vercel Cron은 토요일 한국시간 기준 다음 시점에 최신 결과를 재확인합니다.

- 20:45 KST
- 20:55 KST
- 21:05 KST
- 21:15 KST

`vercel.json`에는 UTC 기준으로 다음 스케줄을 넣었습니다.

- `45 11 * * 6`
- `55 11 * * 6`
- `5 12 * * 6`
- `15 12 * * 6`

## API 요약

- `GET /api/latest`
- `GET /api/stats`
- `POST /api/generate`
- `POST /api/sync-lotto`

`/api/sync-lotto`는 `CRON_SECRET` 검증이 필요합니다.

지원 방식:

- `x-cron-secret` 헤더
- `Authorization: Bearer <CRON_SECRET>`
- `?secret=...` 쿼리

## 관리자 페이지

- 주소: `/admin?secret=CRON_SECRET`
- 기능:
  - 현재 최신 회차 확인
  - 수동 동기화
  - 특정 회차 직접 입력
  - `lotto.json` 다운로드
  - Google Sheets 동기화 테스트
  - 최근 동기화 로그 확인

## 구현 메모

- 정적 데이터는 [data/lotto.json](C:/Users/ILEX/Documents/New%20project%203/data/lotto.json) 을 사용합니다.
- 자동 동기화는 `dhlottery` JSON API를 우선 조회하고, 실패 시 결과 페이지를 보조 힌트로 사용합니다.
- Google Sheets 쓰기는 서버 사이드에서만 수행합니다.
- 환경변수가 비어 있어도 앱은 죽지 않고 관리자에 안내 메시지를 남깁니다.

## 면책 문구

본 서비스는 통계/오락 목적이며 당첨을 보장하지 않습니다. 동행복권과 무관한 개인 프로젝트입니다.
