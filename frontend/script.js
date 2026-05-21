const chatBox =
document.getElementById("chat-box");

const userInput =
document.getElementById("user-input");

const sendBtn =
document.getElementById("send-btn");

const muteBtn =
document.getElementById("mute-btn");

const micBtn =
document.getElementById("mic-btn");

const startupSound =
document.getElementById("startup-sound");

const API_URL =
"https://jarvis-ai-chat-bot.onrender.com/chat";

let isMuted = false;

/* SPEAK */

function speak(text){

  if(isMuted) return;

  window.speechSynthesis.cancel();

  const speech =
  new SpeechSynthesisUtterance(text);

  speech.rate = 1.05;

  speech.pitch = 0.9;

  speech.volume = 1;

  const voices =
  window.speechSynthesis.getVoices();

  const jarvisVoice = voices.find(
    voice =>
    voice.name.includes(
      "Google UK English Male"
    ) ||
    voice.name.includes("David")
  );

  if(jarvisVoice){
    speech.voice = jarvisVoice;
  }

  window.speechSynthesis.speak(speech);
}

/* ADD MESSAGE */

function addMessage(text, sender){

  const messageDiv =
  document.createElement("div");

  messageDiv.className =
  `message ${sender}`;

  messageDiv.textContent = text;

  chatBox.appendChild(messageDiv);

  chatBox.scrollTop =
  chatBox.scrollHeight;
}

/* TYPE MESSAGE */

function typeMessage(text, sender){

  const messageDiv =
  document.createElement("div");

  messageDiv.className =
  `message ${sender}`;

  chatBox.appendChild(messageDiv);

  let index = 0;

  const typing =
  setInterval(()=>{

    messageDiv.textContent =
    text.slice(0,index);

    index++;

    chatBox.scrollTop =
    chatBox.scrollHeight;

    if(index > text.length){

      clearInterval(typing);

      if(sender === "bot"){
        speak(text);
      }
    }

  },12);
}

/* SEND MESSAGE */

async function sendMessage(){

  const message =
  userInput.value.trim();

  if(!message) return;

  addMessage(message,"user");

  userInput.value = "";

  const typingDiv =
  document.createElement("div");

  typingDiv.className =
  "message bot";

  typingDiv.innerHTML =
  `
  <div class="thinking">
    <span></span>
    <span></span>
    <span></span>
  </div>
  `;

  chatBox.appendChild(typingDiv);

  chatBox.scrollTop =
  chatBox.scrollHeight;

  try{

    const response =
    await fetch(API_URL,{

      method:"POST",

      headers:{
        "Content-Type":"application/json"
      },

      body:JSON.stringify({
        message
      })

    });

    if(!response.ok){
      throw new Error("Server error");
    }

    const data =
    await response.json();

    typingDiv.remove();

    typeMessage(
      data.reply,
      "bot"
    );

  }catch(error){

    console.error(error);

    typingDiv.remove();

    addMessage(
      "Connection to JARVIS failed, sir.",
      "bot"
    );
  }
}

/* BUTTON EVENTS */

sendBtn.addEventListener(
"click",
sendMessage
);

userInput.addEventListener(
"keypress",
(e)=>{

  if(e.key === "Enter"){
    sendMessage();
  }

}
);

/* MUTE */

muteBtn.addEventListener(
"click",
()=>{

  isMuted = !isMuted;

  muteBtn.innerText =
  isMuted
  ? "UNMUTE"
  : "MUTE";

  if(isMuted){
    window.speechSynthesis.cancel();
  }

}
);

/* MIC */

const SpeechRecognition =
window.SpeechRecognition ||
window.webkitSpeechRecognition;

if(SpeechRecognition){

  const recognition =
  new SpeechRecognition();

  recognition.lang = "en-US";

  recognition.continuous = false;

  recognition.interimResults = false;

  micBtn.addEventListener(
  "click",
  ()=>{

    micBtn.innerText = "🎙️";

    recognition.start();

  });

  recognition.onresult =
  (event)=>{

    const transcript =
    event.results[0][0].transcript;

    userInput.value =
    transcript;

    micBtn.innerText = "🎤";

    sendMessage();
  };

  recognition.onend = ()=>{

    micBtn.innerText = "🎤";
  };

}

/* CLOCK */

function updateClock(){

  const clock =
  document.getElementById("clock");

  const now = new Date();

  clock.textContent =
  now.toLocaleTimeString();
}

setInterval(updateClock,1000);

updateClock();

/* STARTUP */

window.onload = ()=>{

  document.body.addEventListener(
  "click",
  ()=>{

    if(startupSound){
      startupSound.play();
    }

  },
  { once:true }
  );

  setTimeout(()=>{

    typeMessage(
      "Good evening, sir. JARVIS systems are now online.",
      "bot"
    );

  },2500);

};