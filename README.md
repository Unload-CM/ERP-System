# DMC ERP 시스템

Next.js, Supabase, Vercel을 활용한 기업 자원 관리(ERP) 시스템입니다.

## 주요 기능

- 사용자 인증 및 권한 관리
- 자재 관리 (재고 현황 및 추적)
- 구매 요청 프로세스
- 생산 계획 관리
- 배송 계획 관리
- 다국어 지원 (한국어, 영어, 태국어)

## 기술 스택

- **프론트엔드**: Next.js 15, React 19, Tailwind CSS
- **백엔드**: Supabase (인증, 데이터베이스, 스토리지)
- **데이터베이스**: PostgreSQL (Supabase)
- **배포**: Vercel

## 환경 설정

이 프로젝트는 Supabase를 데이터베이스로 사용합니다. 아래 단계에 따라 환경을 설정하세요:

1. `.env.local` 파일을 생성하고 다음 환경 변수를 설정하세요:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=your_database_url
```

2. Supabase 계정에서 프로젝트를 생성하고 URL과 API 키를 얻으세요.
3. 얻은 정보를 `.env.local` 파일에 입력하세요.

## 개발 서버 실행

```bash
# PowerShell에서는 각 명령어를 따로 실행하세요
cd erp-system
npm run dev
```

또는:

```bash
# 또는 리눅스/맥 환경이나 Git Bash에서는 아래 명령어로 실행 가능합니다
cd erp-system && npm run dev
```

개발 서버가 시작되면 [http://localhost:3000](http://localhost:3000)에서 애플리케이션에 접속할 수 있습니다.

## Supabase 설정

1. [Supabase](https://supabase.com/)에 가입하고 새 프로젝트를 생성합니다.
2. SQL Editor에서 `supabase/migrations/001_init.sql` 파일을 실행하여 필요한 테이블과 정책을 생성합니다.
3. 생성된 Supabase URL 및 익명 키를 `.env.local` 파일에 설정합니다.

## Vercel 배포

1. GitHub 저장소에 코드를 푸시합니다.
2. [Vercel](https://vercel.com/)에 접속하여 GitHub 저장소를 가져옵니다.
3. 환경 변수 섹션에서 Supabase 연결 정보를 설정합니다:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL`
4. '배포' 버튼을 클릭하여 애플리케이션을 배포합니다.

## 초기 관리자 계정

Supabase에서 생성된 초기 관리자 계정은 다음과 같습니다:

- 이메일: admin@example.com
- 비밀번호: admin123!

**주의**: 실제 배포 환경에서는 이 정보를 변경하여 보안을 강화하세요.

## 프로젝트 구조

```
erp-system/
├── src/
│   ├── app/                 # Next.js 앱 디렉토리
│   │   ├── dashboard/       # 대시보드 페이지
│   │   ├── login/           # 로그인 페이지
│   │   ├── register/        # 회원가입 페이지
│   │   ├── globals.css      # 글로벌 스타일
│   │   ├── layout.tsx       # 레이아웃 컴포넌트
│   │   └── page.tsx         # 메인 페이지
│   ├── components/          # 재사용 컴포넌트
│   │   └── Auth/            # 인증 관련 컴포넌트
│   └── lib/                 # 유틸리티 및 설정
│       └── supabase.ts      # Supabase 클라이언트 설정
├── supabase/
│   └── migrations/          # 데이터베이스 마이그레이션
├── public/                  # 정적 파일
├── MCP.json                 # 시스템 설정 및 메타데이터
├── tailwind.config.js       # Tailwind CSS 설정
├── postcss.config.mjs       # PostCSS 설정
├── vercel.json              # Vercel 배포 설정
└── next.config.ts           # Next.js 설정
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
