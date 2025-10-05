document.addEventListener("DOMContentLoaded", (event) => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = today.getFullYear();
  document.getElementById("test-date").textContent = `${day}/${month}/${year}`;

  updateScoreDisplay();
  // startTimer();
});

function startTimer() {
  const timerDisplay = document.getElementById("timer-display");
  clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    timeInSeconds--;
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    timerDisplay.textContent = `${minutes}:${
      seconds < 10 ? "0" : ""
    }${seconds}`;
    if (timeInSeconds <= 0) {
      clearInterval(timerInterval);
      timerDisplay.textContent = "Hết giờ!";
      alert("Hết giờ làm bài!");
      document
        .querySelectorAll(".validate-btn")
        .forEach((btn) => (btn.disabled = true));
    }
  }, 1000);
}

function updateScoreDisplay() {
  const scoreDisplay = document.getElementById("score-display");
  scoreDisplay.textContent = `Score: ${score} / ${maxScore}`;
}

function updateScore(points = 1) {
  score += points;
  updateScoreDisplay();
}

function setLastFocused(element) {
  lastFocusedInput = element;
}

function insertChar(char) {
  if (lastFocusedInput) {
    const startPos = lastFocusedInput.selectionStart;
    const endPos = lastFocusedInput.selectionEnd;
    const value = lastFocusedInput.value;
    lastFocusedInput.value =
      value.substring(0, startPos) +
      char +
      value.substring(endPos, value.length);
    lastFocusedInput.focus();
    lastFocusedInput.selectionStart = startPos + 1;
    lastFocusedInput.selectionEnd = startPos + 1;
  }
}

function playAudio(questionNumber, buttonElement) {
  setAudioSource(questionNumber); // Thêm dòng này!
  const audioPlayer = document.getElementById(`audio-player-${questionNumber}`);
  if (audioPlayer) {
    audioPlayer.play();
    buttonElement.classList.add("playing");
    buttonElement.disabled = true;
    audioPlayer.onended = () => {
      buttonElement.classList.remove("playing");
      buttonElement.disabled = false;
    };
  }
}

function showTranscription(questionNumber) {
  const transcriptText = transcriptionData[questionNumber];
  const transcriptContainer = document.getElementById(
    `transcription-${questionNumber}`
  );
  const transcriptButton = document.getElementById(
    `show-transcription-btn-${questionNumber}`
  );

  if (transcriptText && transcriptContainer) {
    transcriptContainer.innerHTML = transcriptText.replace(/\n/g, "<br>");
    transcriptContainer.style.display = "block";
    transcriptButton.style.display = "none";
  }
}

function validateRadio(questionNumber, correctAnswer) {
  const questionBlock = document.getElementById(`q${questionNumber}`);
  const radios = document.getElementsByName(`q${questionNumber}`);
  const feedback = questionBlock.querySelector(".feedback");
  const button = questionBlock.querySelector(".validate-btn");
  let selectedAnswer = null;

  radios.forEach((radio) => {
    if (radio.checked) {
      selectedAnswer = radio;
    }
  });

  if (selectedAnswer === null) {
    feedback.textContent = "Vui lòng chọn một đáp án!";
    feedback.className = "feedback feedback-warning";
    return;
  }

  button.disabled = true;
  radios.forEach((radio) => (radio.disabled = true));
  const selectedLabel = selectedAnswer.parentElement;
  const explanation = feedbackExplanations[questionNumber];

  if (selectedAnswer.value === correctAnswer) {
    feedback.textContent = explanation;
    feedback.className = "feedback feedback-correct";
    selectedLabel.classList.add("correct-answer");
    updateScore();
  } else {
    const cleanedExplanation = explanation.replace("Chính xác! ", "");
    feedback.innerHTML = `<strong>Không chính xác.</strong> <br>Đáp án đúng là lựa chọn <strong>"${correctAnswer.toUpperCase()}"</strong>.`;
    feedback.className = "feedback feedback-incorrect";
    selectedLabel.classList.add("incorrect-answer");
    radios.forEach((radio) => {
      if (radio.value === correctAnswer) {
        radio.parentElement.classList.add("correct-answer");
      }
    });
  }

  if (document.getElementById(`audio-player-${questionNumber}`)) {
    const transcriptBtn = document.getElementById(
      `show-transcription-btn-${questionNumber}`
    );
    if (transcriptBtn) {
      transcriptBtn.style.display = "block";
    }
  }
}

function validateText(questionNumber, correctAnswer) {
  const questionBlock = document.getElementById(`q${questionNumber}`);
  const inputField = questionBlock.querySelector('input[type="text"]');
  const feedback = questionBlock.querySelector(".feedback");
  const button = questionBlock.querySelector(".validate-btn");
  const userAnswer = inputField.value.trim();

  if (userAnswer === "") {
    feedback.textContent = "Vui lòng điền câu trả lời của bạn.";
    feedback.className = "feedback feedback-warning";
    return;
  }

  const explanation = feedbackExplanations[questionNumber];

  button.disabled = true;
  inputField.disabled = true;

  if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
    feedback.textContent = explanation;
    feedback.className = "feedback feedback-correct";
    inputField.classList.add("correct-answer");
    updateScore();
  } else {
    const cleanedExplanation = explanation.replace("Chính xác! ", "");
    feedback.innerHTML = `<strong>Không chính xác.</strong> ${cleanedExplanation}<br>Đáp án đúng phải là: <strong>${correctAnswer}</strong>`;
    feedback.className = "feedback feedback-incorrect";
    inputField.classList.add("incorrect-answer");
  }
}

function validateCloze(clozeSetIndex, questionId) {
  const currentAnswers = clozeAnswers[clozeSetIndex - 1];
  const questionBlock = document.getElementById(`q${questionId}`);
  const button = questionBlock.querySelector(".validate-btn");
  const feedback = questionBlock.querySelector(".feedback");
  let correctCount = 0;

  for (let i = 0; i < currentAnswers.length; i++) {
    const inputId = `cloze-${clozeSetIndex}-${i + 1}`;
    const inputElement = document.getElementById(inputId);
    if (inputElement.value.trim() === "") {
      feedback.textContent = "Vui lòng điền đầy đủ tất cả các chỗ trống.";
      feedback.className = "feedback feedback-warning";
      return;
    }
  }

  for (let i = 0; i < currentAnswers.length; i++) {
    const inputId = `cloze-${clozeSetIndex}-${i + 1}`;
    const inputElement = document.getElementById(inputId);

    const userAnswer = inputElement.value.trim().toLowerCase();
    const correctAnswer = currentAnswers[i].toLowerCase();

    if (userAnswer === correctAnswer) {
      inputElement.classList.add("correct-answer");
      correctCount++;
    } else {
      inputElement.classList.add("incorrect-answer");
      inputElement.value = currentAnswers[i];
    }

    inputElement.disabled = true;
  }

  if (correctCount > 0) {
    updateScore(correctCount);
  }

  feedback.textContent = `Bạn đã điền đúng ${correctCount} trên ${currentAnswers.length} từ.`;
  feedback.className = "feedback feedback-correct";

  button.disabled = true;
}


function setAudioSource(questionNumber) {
  const audioPlayer = document.getElementById(`audio-player-${questionNumber}`);
  const source = audioPlayer.querySelector("source");

  // Định nghĩa một biến global để lưu trữ các URL audio riêng lẻ
  // Bạn sẽ cần định nghĩa biến này (ví dụ: window.individualAudioUrls) trong file HTML hoặc một script khác.
  const individualAudioUrls = window.individualAudioUrls || {};

  let audioUrl;

  // 1. Kiểm tra xem có URL audio riêng lẻ cho câu hỏi này không
  if (individualAudioUrls[questionNumber]) {
    audioUrl = individualAudioUrls[questionNumber];
  } else {
    // 2. Nếu không có URL riêng lẻ, sử dụng prefix mặc định (như logic hiện tại)
    const prefix =
      window.audioPrefix || ""; // Thêm một chuỗi rỗng mặc định nếu không có prefix để tránh lỗi

    // Nếu prefix được comment out, bạn có thể muốn một logic fallback tốt hơn,
    // nhưng dựa trên code hiện tại, nó sẽ cố gắng ghép nối.
    // Giả định rằng nếu window.audioPrefix không tồn tại, nó sẽ không chạy
    // hoặc bạn sẽ cung cấp nó ở nơi khác.
    audioUrl = `${prefix}${questionNumber}.mp3`;
  }

  // 3. Cập nhật và tải audio
  if (audioUrl) {
    source.src = audioUrl;
    audioPlayer.load();
  } else {
    console.error(`Không tìm thấy nguồn audio cho câu hỏi ${questionNumber}`);
  }
}


// function setAudioSource(questionNumber) {
//   const audioPlayer = document.getElementById(`audio-player-${questionNumber}`);
//   const source = audioPlayer.querySelector("source");
//   const prefix =
//     window.audioPrefix 
//   const audioUrl = `${prefix}${questionNumber}.mp3`;
//   source.src = audioUrl;
//   audioPlayer.load();
// }

function setImageSource(questionNumber) {
  const imgElement = document.querySelector(
    `#q${questionNumber} .listening-image`
  );
  if (
    imgElement &&
    window.imageSources &&
    window.imageSources[questionNumber]
  ) {
    imgElement.src = window.imageSources[questionNumber];
  }
}
