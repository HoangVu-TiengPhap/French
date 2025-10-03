let activeInput = null;

document.addEventListener("mousedown", (event) => {
  if (event.target.tagName === "INPUT" && event.target.type === "text") {
    activeInput = event.target;
  } else if (!event.target.classList.contains("char-button")) {
    activeInput = null;
  }
});

function insertChar(char) {
  if (activeInput) {
    const start = activeInput.selectionStart;
    const end = activeInput.selectionEnd;
    const value = activeInput.value;

    activeInput.value = value.substring(0, start) + char + value.substring(end);

    activeInput.selectionStart = activeInput.selectionEnd = start + char.length;

    activeInput.focus();
  } else {
    alert(
      "Vui lòng click vào ô bạn muốn điền trước khi chọn ký tự! (Please click on the input field you want to fill before selecting a character!)"
    );
  }
}

// Hàm kiểm tra duy nhất một đáp án cho bài tập này
function checkAnswer(inputId, correctAnswer, feedbackId) {
  const inputElement = document.getElementById(inputId);
  const feedbackElement = document.getElementById(feedbackId);

  // Chuyển đổi đáp án đúng sang chữ thường và loại bỏ dấu câu cuối nếu có
  const cleanCorrectAnswer = correctAnswer
    .toLowerCase()
    .replace(/[\.\?!,;]$/, "")
    .trim();
  const userAnswer = inputElement.value
    .trim()
    .toLowerCase()
    .replace(/[\.\?!,;]$/, "");

  feedbackElement.classList.remove("correct", "incorrect", "warning");
  feedbackElement.style.display = "block";

  // Kiểm tra nếu ô input trống
  if (userAnswer === "") {
    feedbackElement.textContent =
      "Bạn cần điền vào ô trống trước khi kiểm tra! (Please fill in the blank before checking!)";
    feedbackElement.classList.add("warning");
    return;
  }

  // Nếu không trống, tiếp tục kiểm tra đáp án
  // Cho phép "est" hoặc "est" nếu có apostrophe (không áp dụng cho động từ etre)
  let isCorrect = userAnswer === cleanCorrectAnswer;

  if (isCorrect) {
    feedbackElement.textContent = "Chính xác! (Correct!)";
    feedbackElement.classList.add("correct");
  } else {
    feedbackElement.textContent = `Chưa đúng. Đáp án là: ${correctAnswer}. (Incorrect. The correct answer is: ${correctAnswer}.)`;
    feedbackElement.classList.add("incorrect");
  }
}
