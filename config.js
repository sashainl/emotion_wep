// LLM API 설정
const LLM_CONFIG = {
    // Gemini API 설정
    GEMINI: {
        enabled: true,
        apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
        apiKey: 'AIzaSyD9NIkW4vvFZSJlKHGO97MRu4GdHmsnZzA', // .env에서 가져온 Gemini API 키
        model: 'gemini-1.5-flash'
    }
};

// API 사용 설정
const USE_REAL_LLM = false; // 실제 LLM API 사용 여부

const LLM_API = {
    async callGemini(prompt) {
        if (!LLM_CONFIG.GEMINI.enabled) {
            throw new Error('Gemini API가 비활성화되어 있습니다.');
        }
        const response = await fetch(`${LLM_CONFIG.GEMINI.apiUrl}?key=${LLM_CONFIG.GEMINI.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `당신은 따뜻한 공감과 위로를 전하는 한국어 전용 AI 어시스턴트입니다. 1. 절대로 다른 언어사용 금지. 2. 항상 자연스럽고 부드러운 한국어로 답변. 3. 다른 언어가 포함되지 않도록 주의하고, 만약 감지되면 즉시 매끄러운 한국어로 번역·수정하세요.\n\n사용자 질문: ${prompt}`
                    }]
                }],
                generationConfig: {
                    maxOutputTokens: 200,
                    temperature: 0.8
                }
            })
        });
        if (!response.ok) {
            const errMsg = await response.text();
            console.error('❌ Gemini 호출 오류:', errMsg);
            throw new Error('Gemini API 호출 실패');
        }
        const data = await response.json();
        return data.candidates[0]?.content?.parts[0]?.text || '';
    }
};

// 실제 LLM API 호출 함수
async function callRealLLM(prompt) {
    try {
        if (LLM_CONFIG.GEMINI.enabled) {
            return await LLM_API.callGemini(prompt);
        } else {
            throw new Error('활성화된 LLM API가 없습니다.');
        }
    } catch (error) {
        console.error('LLM API 호출 실패:', error);
        throw error;
    }
}

const firebaseConfig = {
    apiKey: "AIzaSyB5srT_NAxC_X212-e0C4ZLU1_T8zxrjWY",
    authDomain: "emotion-86f15.firebaseapp.com",
    projectId: "emotion-86f15",
    storageBucket: "emotion-86f15.appspot.com",
    messagingSenderId: "357165782392",
    appId: "1:357165782392:web:1f52323d8adfeed3fca48d",
    measurementId: "G-07B6BMTSKF"
}; 