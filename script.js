import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDJuz23DrqGN3i98yGvEp4uI99l0AED6rY",
  authDomain: "shikayat-saathi.firebaseapp.com",
  projectId: "shikayat-saathi",
  storageBucket: "shikayat-saathi.firebasestorage.app",
  messagingSenderId: "810869568803",
  appId: "1:810869568803:web:00400d4b1da0b3b8e14896",
  measurementId: "G-3QP95L1T7T"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ------------------ Complaint Tracker ------------------
window.trackComplaint = async () => {
  const trackId = document.getElementById("trackId").value.trim();
  const resultDiv = document.getElementById("trackResult");
  if (!trackId) return alert("Please enter your Complaint ID.");

  try {
    const docSnap = await getDoc(doc(db, "complaints", trackId));
    if (docSnap.exists()) {
      const data = docSnap.data();
      const time = data.timestamp?.toDate().toLocaleString() || "Unknown";
      resultDiv.innerHTML = `
        <hr><strong>Complaint Details:</strong><br>
        <strong>Name:</strong> ${data.name}<br>
        <strong>Village:</strong> ${data.village}<br>
        <strong>Problem:</strong> ${data.problem}<br>
        <strong>Status:</strong> ${data.status}<br>
        <strong>Filed At:</strong> ${time}<br>`;
    } else resultDiv.innerHTML = "❌ No complaint found with this ID.";
  } catch (e) {
    console.error("Track Error:", e);
    resultDiv.innerHTML = `❌ Error fetching data: ${e.message}`;
  }
};

// ------------------ Submit Complaint ------------------
window.sendComplaintToFirebase = async (name, village, problem, lat, long) => {
  try {
    const docRef = await addDoc(collection(db, "complaints"), {
      name, village, problem,
      status: "Received",
      location: { latitude: lat, longitude: long },
      timestamp: new Date()
    });
    alert(`✅ Complaint Registered!\nComplaint ID: ${docRef.id}`);
  } catch (e) {
    alert(`❌ Failed to submit: ${e.message}`);
    console.error(e);
  }
};

// ------------------ Language & Speech ------------------
const prompts = {
  hi: ["कृपया अपनी समस्या बताएं", "कृपया अपने गांव और राज्य का नाम बताएं", "कृपया अपना नाम बताएं", "धन्यवाद, आपकी समस्या रिकॉर्ड कर ली गई है", "आपका सहायक", "बोलें"],
  kn: ["ದಯವಿಟ್ಟು ನಿಮ್ಮ ಸಮಸ್ಯೆಯನ್ನು ಹೇಳಿ", "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಹಳ್ಳಿ ಮತ್ತು ರಾಜ್ಯದ ಹೆಸರನ್ನು ಹೇಳಿ", "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಹೆಸರನ್ನು ಹೇಳಿ", "ಧನ್ಯವಾದಗಳು, ನಿಮ್ಮ ಸಮಸ್ಯೆಯನ್ನು ದಾಖಲಿಸಲಾಗಿದೆ", "ನಿಮ್ಮ ಸಹಾಯಕ", "ಮಾತನಾಡಿ"],
  ta: ["தயவுசெய்து உங்கள் பிரச்சனையை கூறுங்கள்", "தயவுசெய்து உங்கள் கிராமம் மற்றும் மாநிலத்தின் பெயரை கூறுங்கள்", "தயவுசெய்து உங்கள் பெயரை கூறுங்கள்", "நன்றி, உங்கள் பிரச்சனை பதிவு செய்யப்பட்டுள்ளது", "உங்கள் உதவியாளர்", "பேசவும்"],
  ur: ["براہ کرم اپنی مسئلہ بتائیں", "براہ کرم اپنے گاؤں اور ریاست کا نام بتائیں", "براہ کرم اپنا نام بتائیں", "شکریہ، آپ کا مسئلہ ریکارڈ کر لیا گیا ہے", "آپ کا معاون", "بولیں"],
  gu: ["કૃપા કરીને તમારી સમસ્યા કહો", "તમારા ગામ અને રાજ્યનું નામ કહો", "તમારું નામ કહો", "આભાર, તમારી સમસ્યા નોંધાઈ ગઈ છે", "તમારો સહાયક", "બોલો"],
  bn: ["আপনার সমস্যাটি বলুন", "আপনার গ্রাম এবং রাজ্যের নাম বলুন", "আপনার নাম বলুন", "ধন্যবাদ, আপনার সমস্যাটি রেকর্ড করা হয়েছে", "আপনার সহায়ক", "বলুন"],
  or: ["ଦୟାକରି ଆପଣଙ୍କର ସମସ୍ୟା କୁ କୁହନ୍ତୁ", "ଆପଣଙ୍କ ଗାଁ ଓ ରାଜ୍ୟର ନାମ କୁହନ୍ତୁ", "ଆପଣଙ୍କ ନାମ କୁହନ୍ତୁ", "ଧନ୍ୟବାଦ, ଆପଣଙ୍କ ସମସ୍ୟା ରେକର୍ଡ ହୋଇଛି", "ଆପଣଙ୍କ ସହାୟକ", "କୁହନ୍ତୁ"],
  raj: ["कृपया थारी समस्स्या बतावो", "थारो गांव अर राज्य को नाम बोलो", "थारो नाम बतावो", "धन्यवाद, थारी समस्स्या रिकॉर्ड कर ली गई है", "थारो सहायक", "बोलो"]
};

let currentLang = 'hi';
let step = 0;

window.selectLanguage = (lang) => {
  currentLang = lang;
  step = 0;
  document.getElementById("stepText").innerText = prompts[lang][step];
  document.getElementById("micButton").innerText = "🎤 " + prompts[lang][5];
  document.getElementById("slogan").innerText = prompts[lang][4];
  speak(prompts[lang][step], lang);
};

function speak(text, lang) {
  const msg = new SpeechSynthesisUtterance(text);
  const langMap = { hi: "hi-IN", kn: "kn-IN", ta: "ta-IN", ur: "ur-PK", gu: "gu-IN", bn: "bn-IN", or: "or-IN", raj: "hi-IN" };
  msg.lang = langMap[lang] || "en-US";
  msg.pitch = 1; msg.rate = 0.9; msg.volume = 1;
  window.speechSynthesis.speak(msg);
}

window.startRecognition = () => {
  if (!('webkitSpeechRecognition' in window)) {
    alert("Speech recognition not supported on this browser.");
    return;
  }

  const recognition = new webkitSpeechRecognition();
  const recogLangMap = { hi: "hi-IN", kn: "kn-IN", ta: "ta-IN", ur: "ur-PK", gu: "gu-IN", bn: "bn-IN", or: "or-IN", raj: "hi-IN" };
  recognition.lang = recogLangMap[currentLang] || "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.trim();
    const resultBox = document.getElementById("resultText");
    resultBox.innerText += (resultBox.innerText ? "\n" : "") + transcript;

    step++;
    if (step < 3) {
      document.getElementById("stepText").innerText = prompts[currentLang][step];
      speak(prompts[currentLang][step], currentLang);
      setTimeout(() => recognition.start(), 1800);
    } else {
      document.getElementById("stepText").innerText = prompts[currentLang][3];
      speak(prompts[currentLang][3], currentLang);

      const lines = resultBox.innerText.split("\n");
      const problem = lines[0] || "";
      const village = lines[1] || "";
      const name = lines[2] || "";

      navigator.geolocation.getCurrentPosition(
        (pos) => sendComplaintToFirebase(name, village, problem, pos.coords.latitude, pos.coords.longitude),
        () => alert("Location access denied. Complaint not recorded.")
      );
      step = 0;
    }
  };

  speak(prompts[currentLang][step], currentLang);
  setTimeout(() => recognition.start(), 1500);
};

window.speechSynthesis.onvoiceschanged = () => speak(prompts[currentLang][step], currentLang);
