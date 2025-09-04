// 전역 변수
let currentDate = new Date();
let selectedEmotion = '';
let diaries = JSON.parse(localStorage.getItem('diaries')) || {};
let currentDiaryDateString = ''; // 현재 표시된 일기의 날짜 문자열

// Firebase 초기화 및 인증/DB 객체 생성
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// 인증 관련 DOM
const authSection = document.getElementById('authSection');
const mainContainer = document.getElementById('mainContainer');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const googleLoginBtn = document.getElementById('googleLoginBtn');
const authEmail = document.getElementById('authEmail');
const authPassword = document.getElementById('authPassword');

// DOM 요소들 중 인증 관련 부분 수정
const loginSection = document.getElementById('loginSection');
const signupSection = document.getElementById('signupSection');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const signupEmail = document.getElementById('signupEmail');
const signupPassword = document.getElementById('signupPassword');
const goToSignup = document.getElementById('goToSignup');
const goToLogin = document.getElementById('goToLogin');

// 로그아웃 버튼 동적 추가
let logoutBtn = null;

// Firestore에서 사용자별 일기 불러오기
async function loadUserDiaries(userId) {
    try {
        console.log('loadUserDiaries 시작:', userId);
        diaries = {}; // 불러오기 전 diaries 초기화
        
        const snapshot = await db.collection('users').doc(userId).collection('diaries').get();
        console.log('Firestore 스냅샷:', snapshot.size, '개 문서');
        
        const userDiaries = {};
        snapshot.forEach(doc => {
            userDiaries[doc.id] = doc.data();
            console.log('일기 데이터:', doc.id, doc.data());
        });
        
        diaries = userDiaries;
        console.log('diaries 객체 업데이트됨:', Object.keys(diaries));
        
        if (typeof renderCalendar === 'function') {
            renderCalendar();
            console.log('캘린더 렌더링 완료');
        } else {
            console.error('renderCalendar 함수를 찾을 수 없음');
        }
        
        showNotification('일기 데이터를 불러왔습니다.');
    } catch (error) {
        console.error('일기 불러오기 실패:', error);
        showNotification('일기 불러오기 실패', 'error');
    }
}

// Firestore에 사용자별 일기 저장
async function saveDiaryToFirestore(diary, userId) {
    try {
        await db.collection('users').doc(userId).collection('diaries').doc(diary.date).set(diary);
        return true;
    } catch (error) {
        console.error('일기 저장 실패:', error);
        return false;
    }
}

// Firestore에서 일기 삭제
async function deleteDiaryFromFirestore(date, userId) {
    try {
        await db.collection('users').doc(userId).collection('diaries').doc(date).delete();
        return true;
    } catch (error) {
        console.error('일기 삭제 실패:', error);
        return false;
    }
}

// 로그인 상태 감지 및 UI 전환
function updateAuthUI(user) {
    if (!loginSection || !signupSection) {
        console.log('updateAuthUI null', loginSection, signupSection);
        return;
    }
    if (user) {
        loginSection.classList.add('hidden');
        signupSection.classList.add('hidden');
        mainContainer.classList.remove('hidden');
        // 로그아웃 버튼이 없으면 추가
        if (!logoutBtn) {
            logoutBtn = document.createElement('button');
            logoutBtn.textContent = '로그아웃';
            logoutBtn.className = 'absolute top-4 right-4 bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 z-50';
            logoutBtn.onclick = () => auth.signOut();
            document.body.appendChild(logoutBtn);
        }
        // diaryDetail, loginSection, signupSection 모두 null 체크 후 classList 접근
        if (diaryDetail) diaryDetail.classList.add('hidden'); // 로그인 시 상세보기 숨김
        if (loginSection) loginSection.classList.add('hidden'); // 로그인 시 로그인 폼 숨기기
        if (signupSection) signupSection.classList.add('hidden'); // 로그인 시 회원가입 폼 숨기기
        
        // 사용자 로그인 시 일기 데이터 불러오기
        loadUserDiaries(user.uid);
    } else {
        
        mainContainer.classList.add('hidden');
        if (logoutBtn) {
            logoutBtn.remove();
            logoutBtn = null;
        }
        // 로그아웃 시 일기 데이터 초기화 + 로컬스토리지 삭제
        diaries = {};
        localStorage.removeItem('diaries'); // 로그아웃 시 로컬스토리지도 비움
        diaryDetail.classList.add('hidden'); // 로그아웃 시 상세보기 숨김
        loginSection.classList.remove('hidden'); // 로그아웃 시 로그인 폼 보이기
        signupSection.classList.add('hidden'); // 로그아웃 시 회원가입 폼 숨기기
        renderCalendar();
    }
}

// 자동 로그인 비활성화
// auth.onAuthStateChanged(user => {
//     updateAuthUI(user);
// });

// 폼 전환 이벤트
if (goToSignup) {
    goToSignup.addEventListener('click', () => {
        loginSection.classList.add('hidden');
        signupSection.classList.remove('hidden');
    });
}
if (goToLogin) {
    goToLogin.addEventListener('click', () => {
        signupSection.classList.add('hidden');
        loginSection.classList.remove('hidden');
    });
}

// 이메일/비밀번호 로그인
if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
        const email = loginEmail.value.trim();
        const password = loginPassword.value;
        if (!email || !password) {
            showNotification('이메일과 비밀번호를 입력하세요.', 'error');
            return;
        }
        try {
            await auth.signInWithEmailAndPassword(email, password);
            showNotification('로그인 성공!');
        } catch (error) {
            showNotification(error.message, 'error');
        }
    });
}

// 이메일/비밀번호 회원가입
if (signupBtn) {
    signupBtn.addEventListener('click', async () => {
        const email = signupEmail.value.trim();
        const password = signupPassword.value;
        if (!email || !password) {
            showNotification('이메일과 비밀번호를 입력하세요.', 'error');
            return;
        }
        try {
            await auth.createUserWithEmailAndPassword(email, password);
            showNotification('회원가입 성공!');
        } catch (error) {
            showNotification(error.message, 'error');
        }
    });
}

// Google 로그인
if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', async () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        try {
            await auth.signInWithPopup(provider);
            showNotification('Google 로그인 성공!');
        } catch (error) {
            showNotification(error.message, 'error');
        }
    });
}

// DOM 요소들
const diaryDateInput = document.getElementById('diaryDate');
const diaryContent = document.getElementById('diaryContent');
const saveDiaryBtn = document.getElementById('saveDiary');
const selectedEmotionSpan = document.getElementById('selectedEmotion');
const selectedEmotionText = document.getElementById('selectedEmotionText');
const emotionBtns = document.querySelectorAll('.emotion-btn');
const calendarGrid = document.getElementById('calendarGrid');
const currentMonthSpan = document.getElementById('currentMonth');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const aiMessage = document.getElementById('aiMessage');
const aiMessageContent = document.getElementById('aiMessageContent');
const diaryDetail = document.getElementById('diaryDetail');
const diaryDetailContent = document.getElementById('diaryDetailContent');
const notification = document.getElementById('notification');
const notificationText = document.getElementById('notificationText');

// 초기화 - 자동 로그인 비활성화로 인해 수동으로 호출해야 함
// document.addEventListener('DOMContentLoaded', function() {
//     initializeApp();
//     setupEventListeners();
//     renderCalendar();
// });

// 앱 초기화
function initializeApp() {
    // 오늘 날짜로 설정
    const today = new Date().toISOString().split('T')[0];
    diaryDateInput.value = today;
    
    // 현재 월 표시
    updateCurrentMonthDisplay();
    
    // 기존 데이터 마이그레이션 (AI 메시지 필드 추가)
    migrateExistingData();
}

// 기존 데이터 마이그레이션
function migrateExistingData() {
    let hasChanges = false;
    
    for (const date in diaries) {
        const diary = diaries[date];
        if (diary) {
            // AI 메시지 필드 추가
            if (!diary.hasOwnProperty('aiMessage')) {
                diary.aiMessage = null;
                hasChanges = true;
            }
            
            // AI 요약 필드 추가
            if (!diary.hasOwnProperty('aiSummary')) {
                diary.aiSummary = null;
                hasChanges = true;
            }
            
            // 기존 AI 메시지가 있지만 요약이 없는 경우 요약 생성
            if (diary.aiMessage && !diary.aiSummary) {
                diary.aiSummary = summarizeAIMessage(diary.aiMessage);
                hasChanges = true;
            }
        }
    }
    
    if (hasChanges) {
        localStorage.setItem('diaries', JSON.stringify(diaries));
        console.log('기존 데이터가 새로운 형식으로 마이그레이션되었습니다.');
    }
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 감정 버튼 클릭
    emotionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            selectedEmotion = this.dataset.emotion;
            const emotionColor = this.dataset.color;
            
            // 선택된 감정 표시
            selectedEmotionSpan.textContent = selectedEmotion;
            selectedEmotionText.textContent = getEmotionText(selectedEmotion);
            
            // 버튼 스타일 업데이트
            emotionBtns.forEach(b => b.classList.remove('ring-2', 'ring-primary'));
            this.classList.add('ring-2', 'ring-primary');
        });
    });

    // 일기 저장
    saveDiaryBtn.addEventListener('click', saveDiary);

    // 캘린더 네비게이션
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
        updateCurrentMonthDisplay();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
        updateCurrentMonthDisplay();
    });

    // ESC 키로 모달 닫기
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            if (!diaryDetail.classList.contains('hidden')) {
                closeDiaryDetail();
            }
            if (!aiMessage.classList.contains('hidden')) {
                closeAiMessage();
            }
        }
    });
}

// 감정 텍스트 반환
function getEmotionText(emotion) {
    const emotionTexts = {
        '😊': '행복',
        '😢': '슬픔',
        '😡': '화남',
        '😴': '피곤',
        '😐': '보통'
    };
    return emotionTexts[emotion] || '';
}

// 일기 저장
async function saveDiary() {
    const date = diaryDateInput.value;
    const content = diaryContent.value.trim();
    
    if (!date) {
        showNotification('날짜를 선택해주세요.', 'error');
        return;
    }
    
    if (!selectedEmotion) {
        showNotification('감정을 선택해주세요.', 'error');
        return;
    }
    
    if (!content) {
        showNotification('일기 내용을 작성해주세요.', 'error');
        return;
    }

    // 일기 저장 (AI 메시지는 나중에 추가)
    const diary = {
        date: date,
        emotion: selectedEmotion,
        content: content,
        timestamp: new Date().toISOString(),
        aiMessage: null, // AI 메시지는 나중에 추가
        aiSummary: null // AI 메시지 요약은 나중에 추가
    };

    // 기존 일기가 있는 경우 AI 메시지 유지
    const existingDiary = diaries[date];
    if (existingDiary && existingDiary.aiMessage) {
        diary.aiMessage = existingDiary.aiMessage;
        diary.aiSummary = existingDiary.aiSummary;
    }

    const userId = auth.currentUser ? auth.currentUser.uid : null; // 현재 사용자 ID 가져오기
    if (userId) {
        const success = await saveDiaryToFirestore(diary, userId);
        if (success) {
            // Firestore 저장 성공 시 로컬 diaries 객체에도 추가
            diaries[date] = diary;
        }
    } else {
        // 로그인되지 않은 경우에도 로컬에 저장 (Firebase 연동 전까지 임시)
        diaries[date] = diary;
        localStorage.setItem('diaries', JSON.stringify(diaries));
    }

    // AI 위로 메시지 생성 및 저장
    if (!existingDiary || !existingDiary.aiMessage) {
        // 새로운 일기인 경우에만 AI 메시지 생성
        generateAIMessage(diary);
    }

    // 폼 초기화
    if (!existingDiary) {
        // 새로운 일기인 경우에만 폼 초기화
        diaryContent.value = '';
        selectedEmotion = '';
        selectedEmotionSpan.textContent = '';
        selectedEmotionText.textContent = '';
        emotionBtns.forEach(btn => btn.classList.remove('ring-2', 'ring-primary'));
    }

    // 캘린더 업데이트
    renderCalendar();

    if (existingDiary) {
        showNotification('일기가 수정되었습니다!');
    } else {
        showNotification('일기가 저장되었습니다!');
    }
}

// AI 위로 메시지 생성
async function generateAIMessage(diary) {
    const emotionText = getEmotionText(diary.emotion);
    aiMessageContent.innerHTML = '<div class="flex items-center justify-center"><div class="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div><span class="ml-2">AI가 위로 메시지를 생성하고 있어요...</span></div>';
    aiMessage.classList.remove('hidden');

    let message = '';
    const prompt = `아래는 사용자가 작성한 일기입니다.\n\n"${diary.content}"\n\n이 사용자는 "${emotionText}"(이)라는 감정을 느꼈습니다.\n이 사용자의 감정에 진심으로 공감하며, 따뜻하고 위로가 되는 메시지를 한국어로 4~5문장으로 작성해 주세요.\n너무 기계적이지 않고, 진짜 친구처럼 공감해 주세요.`;

    try {
        message = await callRealLLM(prompt);
    } catch (e) {
        message = '';
    }
    if (!message || message.length < 10) {
        message = generateSimpleTemplate(diary, emotionText);
    }
    aiMessageContent.textContent = message;
    // AI 메시지와 요약을 일기에 저장
    diary.aiMessage = message;
    diary.aiSummary = summarizeAIMessage(message);
    const userId = auth.currentUser ? auth.currentUser.uid : null; // 현재 사용자 ID 가져오기
    if (userId) {
        const success = await saveDiaryToFirestore(diary, userId);
        if (success) {
            // Firestore 저장 성공 시 로컬 diaries 객체에도 업데이트
            diaries[diary.date] = diary;
        }
    } else {
        // 로그인되지 않은 경우에도 로컬에 저장 (Firebase 연동 전까지 임시)
        diaries[diary.date] = diary;
        localStorage.setItem('diaries', JSON.stringify(diaries));
    }
    // 캘린더 업데이트
    renderCalendar();
}

// 동적 메시지 생성 (LLM 시뮬레이션)
function generateDynamicMessage(diary, emotionText) {
    const content = diary.content.toLowerCase();
    const words = content.split(' ');
    
    // 일기 내용에서 키워드 추출
    const keywords = extractKeywords(content);
    
    // 감정별 동적 메시지 템플릿
    const templates = {
        '😊': [
            `오늘 ${emotionText}한 하루를 보내셨군요! ${keywords.length > 0 ? `특히 "${keywords[0]}"에 대한 이야기가 인상적이에요. ` : ''}긍정적인 에너지가 가득한 당신의 모습이 정말 아름답습니다. 이런 좋은 기분을 오래 간직하시길 바라요. 내일도 좋은 일들이 가득할 거예요! 🌟`,
            `와! 오늘 정말 ${emotionText}한 하루였군요! ${keywords.length > 0 ? `"${keywords[0]}"에 대한 당신의 이야기가 정말 흥미로워요. ` : ''}이런 순간들이 모여서 아름다운 추억이 될 거예요. 내일도 이런 좋은 에너지가 계속되길 바라요! ✨`,
            `오늘 ${emotionText}한 하루를 보내셨군요! ${keywords.length > 0 ? `"${keywords[0]}"에 대한 당신의 경험이 정말 특별해 보여요. ` : ''}이런 순간들이 당신을 더욱 빛나게 만들어요. 내일도 좋은 일들이 기다리고 있을 거예요! 🌈`
        ],
        '😢': [
            `오늘 ${emotionText}한 마음으로 하루를 보내셨군요. ${keywords.length > 0 ? `"${keywords[0]}"에 대한 이야기를 들으니 마음이 아파요. ` : ''}힘든 시간을 견뎌내신 당신이 정말 대단합니다. 모든 감정은 자연스러운 것이에요. 내일은 조금 더 나아질 거예요. 당신을 응원해요! 💙`,
            `오늘 ${emotionText}한 마음이었군요. ${keywords.length > 0 ? `"${keywords[0]}"에 대한 당신의 감정을 이해해요. ` : ''}슬픔도 인생의 일부예요. 내일은 새로운 희망이 찾아올 거예요. 당신은 혼자가 아니에요. 🤗`,
            `오늘 ${emotionText}한 하루였군요. ${keywords.length > 0 ? `"${keywords[0]}"에 대한 이야기를 들으니 마음이 무거워져요. ` : ''}하지만 이런 시간도 지나가고, 더 나은 날들이 올 거예요. 당신의 감정을 인정하고, 스스로를 다독여주세요. 💕`
        ],
        '😡': [
            `오늘 ${emotionText}한 일이 있었군요. ${keywords.length > 0 ? `"${keywords[0]}"에 대한 상황이 정말 답답했겠어요. ` : ''}화가 나는 것은 당연한 일이에요. 깊은 숨을 쉬고 잠시 휴식을 취해보세요. 내일은 더 차분한 마음으로 시작할 수 있을 거예요. 당신의 감정을 이해해요. 🤗`,
            `오늘 ${emotionText}한 일이 있었군요. ${keywords.length > 0 ? `"${keywords[0]}"에 대한 상황이 정말 화가 났겠어요. ` : ''}화는 자연스러운 감정이에요. 잠시 심호흡을 하고, 좋아하는 것을 해보세요. 내일은 더 나은 하루가 될 거예요. 🌸`,
            `오늘 ${emotionText}한 일이 있었군요. ${keywords.length > 0 ? `"${keywords[0]}"에 대한 이야기를 들으니 정말 답답했겠어요. ` : ''}화가 나는 것은 당연해요. 잠시 휴식을 취하고, 내일은 새로운 마음으로 시작해보세요. 당신의 감정을 인정해요. 💪`
        ],
        '😴': [
            `오늘 ${emotionText}하신 것 같아요. ${keywords.length > 0 ? `"${keywords[0]}"에 대한 이야기를 들으니 정말 피곤하셨겠어요. ` : ''}충분한 휴식이 필요할 때예요. 따뜻한 차 한 잔과 함께 잠시 쉬어가세요. 내일은 더 활기찬 하루가 될 거예요. 당신의 건강이 가장 중요해요! ☕`,
            `오늘 ${emotionText}하신 것 같아요. ${keywords.length > 0 ? `"${keywords[0]}"에 대한 이야기를 들으니 정말 지치셨겠어요. ` : ''}충분한 휴식을 취하세요. 따뜻한 목욕이나 좋아하는 음악을 들으며 휴식을 취해보세요. 내일은 더 에너지 넘치는 하루가 될 거예요! 🛁`,
            `오늘 ${emotionText}하신 것 같아요. ${keywords.length > 0 ? `"${keywords[0]}"에 대한 이야기를 들으니 정말 피곤하셨겠어요. ` : ''}충분한 휴식이 필요해요. 편안한 잠과 함께 내일은 더 활기찬 하루가 될 거예요. 당신의 건강이 가장 소중해요! 😴`
        ],
        '😐': [
            `오늘 ${emotionText}한 하루를 보내셨군요. ${keywords.length > 0 ? `"${keywords[0]}"에 대한 이야기가 인상적이에요. ` : ''}평온한 하루도 소중한 시간이에요. 내일은 새로운 기회가 찾아올 거예요. 당신의 일상이 아름답습니다. 🌸`,
            `오늘 ${emotionText}한 하루였군요. ${keywords.length > 0 ? `"${keywords[0]}"에 대한 이야기를 들으니 흥미로워요. ` : ''}평온함도 소중한 감정이에요. 내일은 새로운 경험이 기다리고 있을 거예요. 당신의 하루가 특별해요. 🌿`,
            `오늘 ${emotionText}한 하루를 보내셨군요. ${keywords.length > 0 ? `"${keywords[0]}"에 대한 이야기가 좋네요. ` : ''}평온한 시간도 소중해요. 내일은 더 특별한 순간들이 찾아올 거예요. 당신의 일상이 아름답습니다. 🍃`
        ]
    };
    
    const emotionTemplates = templates[diary.emotion] || templates['😐'];
    const randomIndex = Math.floor(Math.random() * emotionTemplates.length);
    return emotionTemplates[randomIndex];
}

// 키워드 추출 함수
function extractKeywords(content) {
    const keywords = [];
    const words = content.toLowerCase().split(/\s+/);
    
    // 감정 관련 키워드
    const emotionKeywords = ['좋아', '싫어', '행복', '슬픔', '화남', '피곤', '즐거워', '힘들어', '답답해', '기뻐', '우울해'];
    
    // 일기 내용에서 감정 키워드 찾기
    for (const word of words) {
        if (emotionKeywords.some(keyword => word.includes(keyword))) {
            keywords.push(word);
        }
    }
    
    // 주요 명사 추출 (간단한 방식)
    const nouns = ['친구', '가족', '학교', '직장', '일', '공부', '운동', '음식', '영화', '음악', '책', '여행', '취미'];
    for (const word of words) {
        if (nouns.some(noun => word.includes(noun))) {
            keywords.push(word);
        }
    }
    
    return keywords.slice(0, 2); // 최대 2개 키워드만 반환
}

// AI 메시지 요약 함수
function summarizeAIMessage(message) {
    if (!message) return '';
    
    // 메시지에서 핵심 문장 추출
    const sentences = message.split(/[.!?]/).filter(s => s.trim().length > 0);
    
    // 감정별 핵심 키워드
    const emotionKeywords = {
        '😊': ['긍정', '행복', '희망', '에너지', '아름다움', '특별', '빛나'],
        '😢': ['위로', '힘들', '견뎌', '자연스럽', '나아질', '응원', '희망'],
        '😡': ['화', '자연스럽', '휴식', '차분', '이해', '인정'],
        '😴': ['휴식', '피곤', '건강', '쉬어', '에너지', '소중'],
        '😐': ['평온', '소중', '기회', '특별', '아름다움', '일상']
    };
    
    // 가장 핵심적인 문장 찾기
    let bestSentence = '';
    let maxScore = 0;
    
    for (const sentence of sentences) {
        let score = 0;
        const lowerSentence = sentence.toLowerCase();
        
        // 감정 키워드 점수
        const currentEmotion = getCurrentEmotionFromMessage(message);
        if (currentEmotion && emotionKeywords[currentEmotion]) {
            for (const keyword of emotionKeywords[currentEmotion]) {
                if (lowerSentence.includes(keyword)) {
                    score += 2;
                }
            }
        }
        
        // 이모지 포함 여부
        if (sentence.match(/[🌟✨🌈💙🤗💕🌸🌿🍃☕🛁😴💪]/)) {
            score += 1;
        }
        
        // 문장 길이 (적당한 길이 선호)
        if (sentence.length >= 20 && sentence.length <= 80) {
            score += 1;
        }
        
        if (score > maxScore) {
            maxScore = score;
            bestSentence = sentence.trim();
        }
    }
    
    // 핵심 문장이 없으면 첫 번째 문장 사용
    if (!bestSentence && sentences.length > 0) {
        bestSentence = sentences[0].trim();
    }
    
    // 문장이 너무 길면 자르기
    if (bestSentence.length > 50) {
        bestSentence = bestSentence.substring(0, 47) + '...';
    }
    
    return bestSentence;
}

// 메시지에서 현재 감정 추출
function getCurrentEmotionFromMessage(message) {
    const emotionPatterns = {
        '😊': /행복|긍정|좋은|아름다운|특별|빛나/,
        '😢': /슬픔|힘들|위로|견뎌|나아질|응원/,
        '😡': /화|답답|자연스럽|휴식|차분|이해/,
        '😴': /피곤|휴식|건강|쉬어|소중/,
        '😐': /평온|소중|기회|일상|특별/
    };
    
    for (const [emotion, pattern] of Object.entries(emotionPatterns)) {
        if (pattern.test(message)) {
            return emotion;
        }
    }
    
    return '😐'; // 기본값
}

// API 호출 실패 시 사용할 기본 메시지 생성
function generateFallbackMessage(diary, emotionText) {
    const messages = {
        '😊': `긍정적인 에너지가 가득한 당신의 모습이 정말 아름답습니다. 이런 좋은 기분을 오래 간직하시길 바라요. 내일도 좋은 일들이 가득할 거예요! 🌟`,
        '😢': `마음으로 하루를 보내셨군요. 힘든 시간을 견뎌내신 당신이 정말 대단합니다. 모든 감정은 자연스러운 것이에요. 내일은 조금 더 나아질 거예요. 당신을 응원해요! 💙`,
        '😡': `화가 나는 것은 당연한 일이에요. 깊은 숨을 쉬고 잠시 휴식을 취해보세요. 내일은 더 차분한 마음으로 시작할 수 있을 거예요. 당신의 감정을 이해해요. 🤗`,
        '😴': `충분한 휴식이 필요할 때예요. 따뜻한 차 한 잔과 함께 잠시 쉬어가세요. 내일은 더 활기찬 하루가 될 거예요. 당신의 건강이 가장 중요해요! ☕`,
        '😐': `평온한 하루도 소중한 시간이에요. 내일은 새로운 기회가 찾아올 거예요. 당신의 일상이 아름답습니다. 🌸`
    };
    console.log(" ");
    return messages[diary.emotion] || `오늘 하루도 수고하셨습니다. 내일은 더 좋은 하루가 될 거예요! 🌈`;
}

// 캘린더 렌더링
function formatDateToYYYYMMDD(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function renderCalendar() {
    console.log('renderCalendar 시작, diaries:', Object.keys(diaries));
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    if (!calendarGrid) {
        console.error('calendarGrid 요소를 찾을 수 없음');
        return;
    }
    
    calendarGrid.innerHTML = '';
    
    for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day p-2 text-center border border-gray-200 min-h-[80px] flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50';
        
        const dayNumber = date.getDate();
        const isCurrentMonth = date.getMonth() === month;
        const dateString = formatDateToYYYYMMDD(date);
        const diary = diaries[dateString];
        
        if (diary) {
            console.log('일기 데이터 발견:', dateString, diary);
        }
        
        let dayContent = `<div class="text-sm ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}">${dayNumber}</div>`;
        
        if (diary) {
            dayContent += `<div class="text-lg mt-1">${diary.emotion}</div>`;
            
            // AI 메시지가 있으면 요약 표시
            if (diary.aiMessage && diary.aiSummary) {
                dayContent += `<div class="text-xs text-purple-600 mt-1 font-medium">🤖</div>`;
                dayContent += `<div class="text-xs text-gray-600 mt-1 px-1 leading-tight">${diary.aiSummary}</div>`;
            } else if (diary.aiMessage) {
                dayContent += `<div class="text-xs text-purple-500 mt-1">🤖</div>`;
            }
        }
        
        dayElement.innerHTML = dayContent;
        
        if (diary) {
            dayElement.addEventListener('click', () => showDiaryDetail(dateString));
        } else {
            dayElement.addEventListener('click', () => {
                if (diaryDateInput) {
                    diaryDateInput.value = dateString;
                    if (diaryContent) diaryContent.focus();
                    diaryDateInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
        }
        
        calendarGrid.appendChild(dayElement);
    }
    
    console.log('renderCalendar 완료');
}

// 현재 월 표시 업데이트
function updateCurrentMonthDisplay() {
    const options = { year: 'numeric', month: 'long' };
    currentMonthSpan.textContent = currentDate.toLocaleDateString('ko-KR', options);
}

// 일기 상세보기
function showDiaryDetail(dateString) {
    const diary = diaries[dateString];
    if (!diary) return;

    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });

    let aiMessageSection = '';
    if (diary.aiMessage) {
        const summaryText = diary.aiSummary ? `<div class="text-sm text-purple-600 mb-2 font-medium">💡 요약: ${diary.aiSummary}</div>` : '';
        aiMessageSection = `
            <div class="mt-4">
                <h4 class="text-sm font-medium text-gray-700 mb-2">🤖 AI의 위로</h4>
                ${summaryText}
                <div class="bg-purple-50 p-4 rounded-md border-l-4 border-purple-400">
                    <p class="text-gray-700 whitespace-pre-wrap">${diary.aiMessage}</p>
                </div>
            </div>
        `;
    }

    diaryDetailContent.innerHTML = `
        <div class="mb-4">
            <div class="flex items-center mb-2">
                <span class="text-2xl mr-2">${diary.emotion}</span>
                <span class="text-lg font-medium text-gray-800">${formattedDate}</span>
            </div>
            <div class="text-sm text-gray-500">${new Date(diary.timestamp).toLocaleString('ko-KR')}</div>
        </div>
        <div class="bg-gray-50 p-4 rounded-md">
            <h4 class="text-sm font-medium text-gray-700 mb-2">📝 일기 내용</h4>
            <p class="text-gray-700 whitespace-pre-wrap">${diary.content}</p>
        </div>
        ${aiMessageSection}
        <div class="mt-4 flex justify-end space-x-2">
            <button onclick="editDiary()" class="px-3 py-1 bg-primary text-white rounded-md hover:bg-purple-600 text-sm">
                ✏️ 수정
            </button>
            <button onclick="regenerateAIMessage('${dateString}')" class="px-3 py-1 bg-purple-500 text-white rounded-md hover:bg-purple-600 text-sm">
                🤖 AI 메시지 재생성
            </button>
            <button onclick="deleteDiary('${dateString}')" class="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm">
                삭제
            </button>
        </div>
    `;

    diaryDetail.classList.remove('hidden');
    currentDiaryDateString = dateString; // 현재 표시된 일기의 날짜 문자열 저장
}

// 일기 상세보기 닫기
function closeDiaryDetail() {
    diaryDetail.classList.add('hidden');
    currentDiaryDateString = ''; // 현재 일기 날짜 초기화
}

// AI 메시지 닫기
function closeAiMessage() {
    aiMessage.classList.add('hidden');
}

// 일기 수정
function editDiary() {
    // 전역 변수에서 현재 일기 날짜 가져오기
    if (!currentDiaryDateString) {
        console.error('현재 표시된 일기가 없습니다');
        showNotification('수정할 일기를 먼저 선택해주세요.', 'error');
        return;
    }
    
    const diary = diaries[currentDiaryDateString];
    if (!diary) {
        console.error('해당 날짜의 일기를 찾을 수 없습니다:', currentDiaryDateString);
        showNotification('해당 날짜의 일기를 찾을 수 없습니다.', 'error');
        return;
    }
    
    console.log('수정할 일기:', currentDiaryDateString, diary);
    
    // 일기 작성 폼에 데이터 설정
    if (diaryDateInput) diaryDateInput.value = currentDiaryDateString;
    if (diaryContent) diaryContent.value = diary.content;
    
    // 감정 선택
    selectedEmotion = diary.emotion;
    if (selectedEmotionSpan) selectedEmotionSpan.textContent = selectedEmotion;
    if (selectedEmotionText) selectedEmotionText.textContent = getEmotionText(selectedEmotion);
    
    // 감정 버튼 스타일 업데이트
    emotionBtns.forEach(btn => {
        btn.classList.remove('ring-2', 'ring-primary');
        if (btn.dataset.emotion === selectedEmotion) {
            btn.classList.add('ring-2', 'ring-primary');
        }
    });
    
    // 상세보기 닫기
    closeDiaryDetail();
    
    // 일기 작성 섹션으로 스크롤
    if (diaryDateInput) {
        diaryDateInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    showNotification('일기를 수정할 수 있습니다. 내용을 변경하고 저장해주세요.');
}

// AI 메시지 재생성
async function regenerateAIMessage(dateString) {
    const diary = diaries[dateString];
    if (!diary) return;

    // 로딩 상태 표시
    const detailContent = document.getElementById('diaryDetailContent');
    const originalContent = detailContent.innerHTML;
    
    detailContent.innerHTML = `
        <div class="mb-4">
            <div class="flex items-center mb-2">
                <span class="text-2xl mr-2">${diary.emotion}</span>
                <span class="text-lg font-medium text-gray-800">${new Date(dateString).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long'
                })}</span>
            </div>
            <div class="text-sm text-gray-500">${new Date(diary.timestamp).toLocaleString('ko-KR')}</div>
        </div>
        <div class="bg-gray-50 p-4 rounded-md">
            <h4 class="text-sm font-medium text-gray-700 mb-2">📝 일기 내용</h4>
            <p class="text-gray-700 whitespace-pre-wrap">${diary.content}</p>
        </div>
        <div class="mt-4">
            <h4 class="text-sm font-medium text-gray-700 mb-2">🤖 AI의 위로</h4>
            <div class="bg-purple-50 p-4 rounded-md border-l-4 border-purple-400">
                <div class="flex items-center justify-center">
                    <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                    <span class="ml-2">AI가 새로운 위로 메시지를 생성하고 있어요...</span>
                </div>
            </div>
        </div>
        <div class="mt-4 flex justify-end space-x-2">
            <button onclick="regenerateAIMessage('${dateString}')" class="px-3 py-1 bg-purple-500 text-white rounded-md hover:bg-purple-600 text-sm" disabled>
                🤖 AI 메시지 재생성
            </button>
            <button onclick="deleteDiary('${dateString}')" class="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm">
                삭제
            </button>
        </div>
    `;

    try {
        // AI 메시지 재생성
        await generateAIMessage(diary);
        
        // 상세보기 다시 표시
        showDiaryDetail(dateString);
        
        showNotification('AI 메시지가 재생성되었습니다!');
    } catch (error) {
        console.error('AI 메시지 재생성 실패:', error);
        detailContent.innerHTML = originalContent;
        showNotification('AI 메시지 재생성에 실패했습니다.', 'error');
    }
}

// 일기 삭제
async function deleteDiary(dateString) {
    if (confirm('정말로 이 일기를 삭제하시겠습니까?')) {
        const userId = auth.currentUser ? auth.currentUser.uid : null; // 현재 사용자 ID 가져오기
        if (userId) {
            await deleteDiaryFromFirestore(dateString, userId);
        } else {
            delete diaries[dateString];
            localStorage.setItem('diaries', JSON.stringify(diaries));
        }
        renderCalendar();
        closeDiaryDetail();
        currentDiaryDateString = ''; // 현재 일기 날짜 초기화
        showNotification('일기가 삭제되었습니다.');
    }
}

// 알림 표시
function showNotification(message, type = 'success') {
    notificationText.textContent = message;
    
    // 알림 타입에 따른 스타일 변경
    notification.className = 'fixed top-4 right-4 px-6 py-3 rounded-md shadow-lg transform translate-x-full transition-transform duration-300 z-50';
    
    if (type === 'error') {
        notification.classList.add('bg-red-500', 'text-white');
    } else {
        notification.classList.add('bg-green-500', 'text-white');
    }
    
    // 알림 표시
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // 알림 숨기기
    setTimeout(() => {
        notification.classList.add('translate-x-full');
    }, 3000);
} 

function getEmotionAdjective(emotion) {
    const map = {
        '😊': '행복한',
        '😢': '슬픈',
        '😡': '화난',
        '😴': '피곤한',
        '😐': '평온한'
    };
    return map[emotion] || '';
}

function cleanKeyword(keyword) {
    // '이', '가', '을', '를', '은', '는' 등 조사 제거
    return keyword.replace(/[이가을를은는]$/, '');
}

function generateSimpleTemplate(diary, emotionText) {
    const emotionAdj = getEmotionAdjective(diary.emotion);
    const keywords = extractKeywords(diary.content);
    const cleanKeywords = keywords.map(cleanKeyword);
    let keywordPart = '';
    if (cleanKeywords.length > 0) {
        keywordPart = `"${cleanKeywords.join(', ')}" 때문에 `;
    }
    return `오늘은 ${keywordPart}${emotionAdj} 일이 있었군요. 수고 많으셨습니다.`;
} 