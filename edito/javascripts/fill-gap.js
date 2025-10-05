document.addEventListener("DOMContentLoaded", (event) => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = today.getFullYear();
  document.getElementById("test-date").textContent = `${day}/${month}/${year}`;

  updateScoreDisplay();
});

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
    transcriptContainer.textContent = transcriptText;
    transcriptContainer.style.display = "block";
    if (transcriptButton) transcriptButton.style.display = "none";
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

  // Allow empty answers: treat them as incorrect but still allow validation.

  const explanation = feedbackExplanations[questionNumber];
  // Special case: if the expected correct answer is the empty string,
  // that means the correct response is to leave the field blank.
  const expectedIsEmpty = correctAnswer.trim() === "";

  if (expectedIsEmpty) {
    // If user left it blank => correct
    if (userAnswer === "") {
      feedback.textContent = `${explanation} Câu này không cần điền gì cả.`;
      feedback.className = "feedback feedback-correct";
      inputField.classList.add("correct-answer");
      button.disabled = true;
      inputField.disabled = true;
      updateScore();
      return;
    }

    // User filled something but the correct answer is blank => incorrect
    feedback.innerHTML = `<strong>Không chính xác.</strong> <br>Hãy để trống ô này — câu này không cần điền gì cả.`;
    feedback.className = "feedback feedback-incorrect";
    inputField.classList.add("incorrect-answer");
    button.disabled = true;
    inputField.disabled = true;
    return;
  }

  // Default behaviour for non-empty expected answers
  button.disabled = true;
  inputField.disabled = true;

  if (
    userAnswer.toLowerCase() === correctAnswer.toLowerCase() &&
    userAnswer !== ""
  ) {
    feedback.textContent = explanation;
    feedback.className = "feedback feedback-correct";
    inputField.classList.add("correct-answer");
    updateScore();
  } else {
    const cleanedExplanation = explanation.replace("Chính xác! ", "");
    feedback.innerHTML = `<strong>Không chính xác.</strong> <br>Đáp án đúng phải là: <strong>${correctAnswer}</strong>`;
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
    // Previously we blocked validation if any field was empty.
    // Now we allow submission with empty fields; they will be treated as incorrect.
  }

  for (let i = 0; i < currentAnswers.length; i++) {
    const inputId = `cloze-${clozeSetIndex}-${i + 1}`;
    const inputElement = document.getElementById(inputId);

    const userAnswer = inputElement.value.trim().toLowerCase();
    const correctAnswer = currentAnswers[i].toLowerCase();

    // If the expected correct answer is an empty string, consider an empty user answer as correct.
    const isCorrectWhenEmpty = correctAnswer === "" && userAnswer === "";
    if (userAnswer === correctAnswer && userAnswer !== "") {
      inputElement.classList.add("correct-answer");
      correctCount++;
    } else if (isCorrectWhenEmpty) {
      // user left it blank and that is the expected (correct) answer
      inputElement.classList.add("correct-answer");
      // keep the input empty (do not overwrite with the correctAnswers entry)
      correctCount++;
    } else {
      // mark as incorrect; if empty, show the correct answer for feedback
      inputElement.classList.add("incorrect-answer");
      inputElement.value = currentAnswers[i];
    }

    inputElement.disabled = true;
  }

  if (correctCount > 0) {
    updateScore(correctCount);
  }

  // Multi-case feedback for cloze sets:
  // - single-answer: simple correct/incorrect (kept below for compatibility)
  // - multi-answer:
  //    * all correct -> "Chính xác!" (or explanation if present)
  //    * none correct -> "Không chính xác." and reveal the correct answers
  //    * partial correct -> "Bạn đã điền đúng X trên Y từ."
  const total = currentAnswers.length;
  if (total === 1) {
    const explanation = feedbackExplanations[questionId] || "Chính xác!";
    if (correctCount === 1) {
      feedback.textContent = explanation;
      feedback.className = "feedback feedback-correct";
    } else {
      const correctAnswerText = currentAnswers[0];
      feedback.innerHTML = `<strong>Không chính xác.</strong> <br>Đáp án đúng phải là: <strong>${correctAnswerText}</strong>`;
      feedback.className = "feedback feedback-incorrect";
    }
  } else {
    // multiple-answer set
    if (correctCount === total) {
      const explanation = feedbackExplanations[questionId] || "Chính xác!";
      feedback.textContent = explanation;
      feedback.className = "feedback feedback-correct";
    } else if (correctCount === 0) {
      // none correct: show incorrect and reveal answers (already filled into inputs above)
      const answersText = currentAnswers.join(" ");
      feedback.innerHTML = `<strong>Không chính xác.</strong> <br>Đáp án đúng là: <strong>${answersText}</strong>`;
      feedback.className = "feedback feedback-incorrect";
    } else {
      // partially correct
      feedback.textContent = `Bạn đã điền đúng ${correctCount} trên ${total} từ.`;
      feedback.className = "feedback feedback-correct";
    }
  }

  button.disabled = true;
}
