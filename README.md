# 감정 일기 웹 애플리케이션

감정을 기록하고 AI가 위로해주는 캘린더 형식의 일기 웹 애플리케이션입니다.

## 주요 기능

### 📝 일기 작성
- 날짜 선택 및 감정 이모지 선택
- 자유로운 일기 내용 작성
- 로컬 스토리지에 자동 저장

### 🗓️ 캘린더 뷰
- 월별 캘린더로 일기 확인
- 이모지로 감정 상태 시각화
- 날짜 클릭으로 상세 내용 확인

### 🤖 AI 위로 메시지
- 작성한 일기 내용을 바탕으로 감정에 맞는 위로 메시지 생성
- 5가지 감정 상태별 맞춤형 메시지
- 실제 LLM API 지원 (OpenAI, Hugging Face, Cohere)
- 일기 내용의 키워드를 분석하여 개인화된 메시지 생성
- AI 메시지를 일기와 함께 캘린더에 저장
- AI 메시지를 자동으로 요약하여 캘린더에 표시
- 캘린더에서 AI 메시지 요약을 한눈에 확인 가능
- 기존 일기에 AI 메시지 재생성 기능

### 💾 데이터 관리
- 브라우저 로컬 스토리지에 데이터 저장
- 일기 삭제 기능
- 반응형 디자인

## 기술 스택

- **HTML5**: 시맨틱 마크업
- **CSS3**: Tailwind CSS 프레임워크 사용
- **JavaScript**: ES6+ 문법, 로컬 스토리지 활용
- **LLM API**: OpenAI, Hugging Face, Cohere API 지원

## 사용법

1. **일기 작성**
   - 날짜를 선택합니다
   - 5가지 감정 이모지 중 하나를 선택합니다 (😊 행복, 😢 슬픔, 😡 화남, 😴 피곤, 😐 보통)
   - 일기 내용을 작성합니다
   - "일기 저장" 버튼을 클릭합니다

2. **캘린더 확인**
   - 우측 캘린더에서 작성된 일기를 이모지로 확인할 수 있습니다
   - 🤖 아이콘과 함께 AI 위로 메시지의 요약이 표시됩니다
   - 이모지가 있는 날짜를 클릭하면 일기와 AI 위로 메시지를 함께 볼 수 있습니다
   - 일기 상세보기에서 "AI 메시지 재생성" 버튼으로 새로운 위로 메시지를 생성할 수 있습니다

3. **AI 위로 메시지**
   - 일기를 저장하면 자동으로 감정에 맞는 위로 메시지가 생성됩니다

## 파일 구조

```
emotion_WEP/
├── index.html          # 메인 HTML 파일
├── script.js           # JavaScript 기능 구현
├── config.js           # LLM API 설정 파일
└── README.md          # 프로젝트 설명서
```

## 실행 방법

1. 모든 파일을 같은 디렉토리에 저장합니다
2. `index.html` 파일을 웹 브라우저에서 엽니다
3. 바로 사용할 수 있습니다!

## 주요 특징

- **반응형 디자인**: 모바일과 데스크톱에서 모두 사용 가능
- **직관적인 UI**: 사용하기 쉬운 인터페이스
- **오프라인 지원**: 인터넷 연결 없이도 사용 가능
- **데이터 보존**: 브라우저 로컬 스토리지에 데이터 저장

## AI 위로 메시지 기능

### 🎯 개인화된 메시지
- 일기 내용에서 키워드를 자동으로 추출
- 감정 상태와 일기 내용을 결합한 맞춤형 메시지
- 다양한 템플릿으로 매번 다른 위로 메시지 생성

### 🤖 LLM API 지원
- **OpenAI GPT**: 가장 자연스러운 한국어 위로 메시지
- **Hugging Face**: 무료로 사용 가능한 오픈소스 모델
- **Cohere**: 빠르고 효율적인 텍스트 생성

### 📝 감정별 메시지 특징
- **😊 행복**: 긍정적인 에너지와 미래에 대한 희망 메시지
- **😢 슬픔**: 위로와 격려, 내일은 더 나아질 것이라는 메시지
- **😡 화남**: 감정의 자연스러움과 휴식의 중요성 강조
- **😴 피곤**: 충분한 휴식과 건강의 중요성 메시지
- **😐 보통**: 평온함의 소중함과 새로운 기회에 대한 메시지

### 🗓️ 캘린더 기능
- **이모지 표시**: 각 날짜의 감정 상태를 이모지로 표시
- **AI 메시지 요약**: 🤖 아이콘과 함께 AI 위로 메시지의 핵심 내용을 짧게 표시
- **상세보기**: 일기 내용과 AI 위로 메시지를 함께 확인
- **재생성**: 기존 일기의 AI 메시지를 새로운 내용으로 재생성
- **자동 요약**: AI 메시지를 자동으로 분석하여 가장 중요한 문장을 추출

### ⚙️ LLM API 설정 방법
1. `config.js` 파일을 열어서 원하는 API의 `enabled`를 `true`로 설정
2. 해당 API의 `apiKey`에 실제 API 키를 입력
3. `USE_REAL_LLM`을 `true`로 설정하여 실제 LLM 사용

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 프로젝트 구성

- **프론트엔드**: HTML, JS (index.html, script.js)
- **백엔드**: Node.js + Express + MariaDB (backend 폴더)

---

## 백엔드(Node.js + Express + MariaDB) 시작하기

### 1. MariaDB 테이블 생성

```sql
CREATE DATABASE emotion_diary DEFAULT CHARACTER SET utf8mb4;
USE emotion_diary;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE diaries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  date DATE NOT NULL,
  emotion VARCHAR(10),
  content TEXT,
  timestamp DATETIME,
  aiMessage TEXT,
  aiSummary TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 2. backend 폴더에서 서버 실행

```bash
cd backend
npm install
node app.js
```

### 3. 환경변수(.env) 예시

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=비밀번호
DB_DATABASE=emotion_diary
JWT_SECRET=아무거나_강력하게
```

---

## API 엔드포인트 예시

- POST   `/api/auth/register`   회원가입
- POST   `/api/auth/login`      로그인(JWT 반환)
- GET    `/api/diary`           내 일기 목록(토큰 필요)
- POST   `/api/diary`           일기 작성(토큰 필요)
- PUT    `/api/diary/:id`       일기 수정(토큰 필요)
- DELETE `/api/diary/:id`       일기 삭제(토큰 필요)

---

## 프론트엔드 연동

- 로그인/회원가입 후 JWT 토큰을 localStorage에 저장
- 일기 API 요청 시 Authorization 헤더에 `Bearer 토큰` 포함

---

## 문의
- MariaDB, Node.js, API 연동 등 궁금한 점은 언제든 문의해주세요! 