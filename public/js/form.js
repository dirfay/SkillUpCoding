// form.js

// --- Кнопка "Повернутися нагору" ---
const scrollToTopBtn = document.getElementById("scrollToTopBtn");

window.onscroll = () => {
  scrollToTopBtn.classList.toggle("show", window.scrollY > 300);
};

scrollToTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// --- Плавний скролінг за anchor-посиланнями (окрім href="#") ---
document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach((anchor) => {
  anchor.addEventListener("click", (e) => {
    e.preventDefault();
    const href = anchor.getAttribute("href");
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  // ===================== ПІДСВІЧУВАННЯ ПОТОЧНОЇ СТОРІНКИ =====================
  // Припустимо, що у нас є десктоп-меню .desktop-menu і оф-канвас .offcanvas-menu
  const currentPage = window.location.pathname.split("/").pop();
  // Знаходимо ВСІ посилання у двох меню:
  const allMenuLinks = document.querySelectorAll(
    ".desktop-menu a, .offcanvas-menu a"
  );
  allMenuLinks.forEach((link) => {
    link.classList.remove("active");
    // Якщо href дорівнює поточній назві файлу, робимо .active
    if (link.getAttribute("href") === currentPage) {
      link.classList.add("active");
    }
  });

  // Кнопка "Вперед до вивчення!"
  const goToLanguagesBtn = document.getElementById("go-to-languages-btn");
  if (goToLanguagesBtn) {
    goToLanguagesBtn.addEventListener("click", () => {
      const internetSection = document.getElementById("Internet");
      if (internetSection) {
        internetSection.scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  // ===================== АВТОРИЗАЦІЯ (Sign In / Sign Up) =====================
  // Якщо у вас однакові ID для кнопок і десктоп, і мобільний, зробіть окремі
  // або керуйте одночасно (див. пояснення)

  // Припустимо, що ви тримаєте ТІЛЬКИ ОДИН набір кнопок (десктоп),
  // а в оф-канвасі інші (з суфіксами -m). Тоді можна додати логіку для обох:
  
  // ДЕСКТОП
  const signInButton = document.getElementById("sign-in-button");
  const signUpButton = document.getElementById("sign-up-button");
  const profileButton = document.getElementById("profile-button");

  // МОБІЛЬНИЙ
  const signInButtonM = document.getElementById("sign-in-button-m");
  const signUpButtonM = document.getElementById("sign-up-button-m");
  const profileButtonM = document.getElementById("profile-button-m");

  // Функція оновлення кнопок (SignIn, SignUp, Профіль)
  const updateAuthButtons = () => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    // Якщо Користувач залогінений: Ховаємо SignIn/Up, показуємо Profile
    // на обох меню (десктоп/мобільне)
    if (isLoggedIn) {
      if (signInButton) signInButton.style.display = "none";
      if (signUpButton) signUpButton.style.display = "none";
      if (profileButton) profileButton.style.display = "block";

      if (signInButtonM) signInButtonM.style.display = "none";
      if (signUpButtonM) signUpButtonM.style.display = "none";
      if (profileButtonM) profileButtonM.style.display = "block";
    } else {
      // Інакше: показуємо SignIn/Up, ховаємо Profile
      if (signInButton) signInButton.style.display = "block";
      if (signUpButton) signUpButton.style.display = "block";
      if (profileButton) profileButton.style.display = "none";

      if (signInButtonM) signInButtonM.style.display = "block";
      if (signUpButtonM) signUpButtonM.style.display = "block";
      if (profileButtonM) profileButtonM.style.display = "none";
    }
  };
  updateAuthButtons();

  // =================== Логіка відкриття модалки реєстрації ===================
  // Змінна, що вказує на поточний режим форми: Вхід (true) чи Реєстрація (false)
  let isLoginMode = false;

  // Обробники натискань на Sign In та Sign Up (ДЕСКТОПНІ кнопки)
  if (signInButton) {
    signInButton.onclick = (e) => {
      e.preventDefault();
      isLoginMode = true;
      openRegistrationModal();
    };
  }
  if (signUpButton) {
    signUpButton.onclick = (e) => {
      e.preventDefault();
      isLoginMode = false;
      openRegistrationModal();
    };
  }

  // Обробники натискань на Sign In / Sign Up (МОБІЛЬНІ) - якщо є
  if (signInButtonM) {
    signInButtonM.onclick = (e) => {
      e.preventDefault();
      isLoginMode = true;
      openRegistrationModal();
    };
  }
  if (signUpButtonM) {
    signUpButtonM.onclick = (e) => {
      e.preventDefault();
      isLoginMode = false;
      openRegistrationModal();
    };
  }

  // Модальне вікно реєстрації/входу
  const regModal = document.getElementById("registration-modal");
  const authModalTitle = document.getElementById("auth-modal-title");
  const switchToLogin = document.getElementById("switch-to-login");
  const regForm = document.getElementById("registration-form");
  const closeRegModalBtn = document.getElementById("close-registration-modal");

  // Функція відкриття модалки
  const openRegistrationModal = () => {
    if (!regModal) return;
    regModal.style.display = "block";
    toggleAuthMode();
  };

  // Закрити модалку
  if (closeRegModalBtn) {
    closeRegModalBtn.onclick = () => {
      regModal.style.display = "none";
    };
  }

  // Перемикання між режимами Вхід/Реєстрація
  const toggleAuthMode = () => {
    if (isLoginMode) {
      // Вхід
      authModalTitle.textContent = "Вхід";
      regForm.querySelector("button").textContent = "Увійти";
      switchToLogin.innerHTML =
        'Не маєте аккаунта? <a href="#" id="to-login-link">Зареєструватися</a>';
      document.getElementById("name-field").style.display = "none";
      document.getElementById("name").removeAttribute("required");
    } else {
      // Реєстрація
      authModalTitle.textContent = "Реєстрація";
      regForm.querySelector("button").textContent = "Зареєструватися";
      switchToLogin.innerHTML =
        'Вже маєте аккаунт? <a href="#" id="to-login-link">Увійти</a>';
      document.getElementById("name-field").style.display = "block";
      document.getElementById("name").setAttribute("required", "required");
    }
  };

  // Обробка сабміту форми (Вхід/Реєстрація)
  regForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (isLoginMode) {

// ======= Вхід ========
fetch("http://localhost:3000/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
})
  .then((res) => res.json())
  .then((data) => {
    if (data.userId && data.token) {
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("userName", data.name);
      localStorage.setItem("userEmail", data.email);
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("isLoggedIn", "true");

      updateAuthButtons();
      regModal.style.display = "none";

      // Ось додано:
      window.location.reload();

    } else {
      alert("Помилка входу: " + data.error);
    }
  })
  .catch((err) => console.error("Помилка входу:", err));
    } else {
      // ======= Реєстрація (з поверненням token) ========
fetch("http://localhost:3000/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name, email, password }),
})
  .then((res) => res.json())
  .then((data) => {
    if (data.userId && data.token) {
      // Зберігаємо token і позначаємо, що залогінені
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("userName", data.name);
      localStorage.setItem("userEmail", data.email);
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("isLoggedIn", "true");

      updateAuthButtons();
      regModal.style.display = "none";

      alert("Реєстрація успішна! Ви вже авторизовані.");
      
      // Додано: Перезавантажуємо сторінку
      window.location.reload();
    } else if (data.error) {
      alert("Помилка реєстрації: " + data.error);
    } else {
      console.log("Неочікувана відповідь при реєстрації:", data);
    }
  })
  .catch((err) => console.error("Помилка реєстрації:", err));
    }
  });

  // Перемикання між "Вже маєте аккаунт?" / "Не маєте аккаунта?"
  document.body.addEventListener("click", (e) => {
    if (e.target && e.target.id === "to-login-link") {
      e.preventDefault();
      isLoginMode = !isLoginMode;
      toggleAuthMode();
    }
  });

  // ===================== МОДАЛКА ПРОФІЛЬ =====================
  const profileModal = document.getElementById("profile-modal");
  const closeProfileModalBtn = document.getElementById("close-profile-modal");
  const logoutButton = document.getElementById("logout-button");

  if (profileButton) {
    profileButton.onclick = (e) => {
      e.preventDefault();
      openProfileModal();
    };
  }
  // Якщо є мобільна кнопка Профіль (profileButtonM) - теж підключити
  if (profileButtonM) {
    profileButtonM.onclick = (e) => {
      e.preventDefault();
      openProfileModal();
    };
  }

  const openProfileModal = () => {
    if (!profileModal) return;
    profileModal.style.display = "block";

    // 1. Отримуємо дані користувача
    fetch("http://localhost:3000/user-info", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("authToken"),
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          console.error("Помилка при завантаженні користувача:", data.error);
          document.getElementById("user-name").textContent = "Невідомо";
          document.getElementById("user-email").textContent = "Невідомо";
        } else {
          document.getElementById("user-name").textContent =
            data.name || "Невідомо";
          document.getElementById("user-email").textContent =
            data.email || "Невідомо";

          // Фото
          if (data.profilePhoto) {
            document.getElementById("profile-photo").src = data.profilePhoto;
          } else {
            document.getElementById("profile-photo").src = "";
          }

          // AboutMe
          if (data.aboutMe) {
            document.getElementById("aboutMe").value = data.aboutMe;
          } else {
            document.getElementById("aboutMe").value = "";
          }
        }
      })
      .catch((err) => console.error("Помилка завантаження user-info:", err));

    // 2. Завантажуємо результати тестів
    const userId = localStorage.getItem("userId");
    if (userId) {
      fetch(`http://localhost:3000/user-results/${userId}`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("authToken"),
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            const resultsList = document.getElementById("results-list");
            resultsList.innerHTML = "";
            data.forEach((result) => {
              const li = document.createElement("li");
              li.textContent = `Тест: ${result.testName}, Бали: ${result.score}, Час: ${result.timeTaken} сек.`;
              resultsList.appendChild(li);
            });
          } else {
            console.error(
              "Отримані дані не є масивом або є помилка:",
              data
            );
          }
        })
        .catch((err) =>
          console.error("Помилка завантаження результатів:", err)
        );
    }
  };

  // Закриття модалки профілю
  if (closeProfileModalBtn) {
    closeProfileModalBtn.onclick = () => {
      profileModal.style.display = "none";
    };
  }

  // Кнопка "Вийти"
  if (logoutButton) {
    logoutButton.onclick = () => {
      logout();
      profileModal.style.display = "none";
    };
  }

 // Функція logout
const logout = () => {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("userId");
  localStorage.removeItem("userName");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("authToken");
  updateAuthButtons();
  window.location.reload();
};

  // Обробка форми профілю (update-profile)
  const profileForm = document.getElementById("profile-form");
  if (profileForm) {
    profileForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const aboutMe = document.getElementById("aboutMe").value.trim();
      const photoFile = document.getElementById("uploadPicture").files[0];

      if (!aboutMe) {
        alert('Поле "Про себе" обов’язкове для заповнення.');
        return;
      }

      const formData = new FormData();
      formData.append("aboutMe", aboutMe);
      if (photoFile) {
        formData.append("profilePhoto", photoFile);
      }

      fetch("http://localhost:3000/update-profile", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("authToken"),
        },
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            alert("Профіль успішно оновлено!");
            if (data.profilePhoto) {
              document.getElementById("profile-photo").src = data.profilePhoto;
            }
          } else {
            alert("Помилка оновлення профілю: " + data.error);
          }
        })
        .catch((err) => console.error("Помилка оновлення профілю:", err));
    });
  }

  // Закриття модальних вікон при кліку поза ними
  window.onclick = function (event) {
    if (event.target === regModal) {
      regModal.style.display = "none";
    }
    if (event.target === profileModal) {
      profileModal.style.display = "none";
    }
  };

  // ===================== ТЕСТИ =====================
  let testsData = {};

  fetch("data/tests.json")
    .then((response) => response.json())
    .then((data) => {
      testsData = data;
      console.log("Тести завантажені:", testsData);
      addEventListenersForTests();
    })
    .catch((error) => console.error("Помилка при завантаженні JSON:", error));

  const addEventListenersForTests = () => {
    const sections = ["html-css", "javascript", "python", "csharp", "algorithms"];

    sections.forEach((section) => {
      const openTestBtn = document.getElementById(`go-to-${section}-test`);
      if (openTestBtn) {
        openTestBtn.onclick = () => openTestModal(`test-modal-${section}`, section);
      }

      const closeModalBtn = document.getElementById(`close-modal-${section}`);
      if (closeModalBtn) {
        closeModalBtn.onclick = () => closeTestModal(`test-modal-${section}`);
      }

      const submitTestBtn = document.getElementById(`submit-test-${section}`);
      if (submitTestBtn) {
        submitTestBtn.onclick = () => submitTest(section);
      }
      const retryTestBtn = document.getElementById(`retry-test-${section}`);
      if (retryTestBtn) {
        retryTestBtn.onclick = () => retryTest(section);
      }
    });

    // Закриваємо модальне вікно тесту при натисканні поза ним
    window.onclick = (event) => {
      if (
        event.target.classList &&
        event.target.classList.contains("modal")
      ) {
        event.target.style.display = "none";
      }
    };
  };

  let testStartTime = {};

  const openTestModal = (modalId, testName) => {
    const modal = document.getElementById(modalId);
    if (!modal)
      return console.error(`Модальне вікно ${modalId} не знайдено.`);

    modal.style.display = "block";
    loadTestQuestions(testName);
    testStartTime[testName] = Date.now();
  };

  const closeTestModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.style.display = "none";
  };

  const loadTestQuestions = (testName) => {
    if (!testsData || !testsData.tests) {
      console.error("Тести ще не завантажені або JSON-файл не знайдено.");
      return;
    }
    const selectedTest = testsData.tests.find((t) => t.section === testName);
    if (!selectedTest) {
      console.error(`Тест для розділу ${testName} не знайдено.`);
      return;
    }
    const container = document.getElementById(`test-questions-${testName}`);
    if (!container)
      return console.error(`Контейнер для питань ${testName} не знайдено.`);

    container.innerHTML = selectedTest.questions
      .map(
        (q, idx) =>
          `<div class="question-block">
             <p>${q.question}</p>` +
          q.options
            .map(
              (opt, optIdx) =>
                `<label>
                   <input type="radio" name="question${idx}" value="${optIdx}">
                   ${opt}
                 </label><br>`
            )
            .join("") +
          `</div>`
      )
      .join("");

    container.style.display = "block";
    const submitBtn = document.getElementById(`submit-test-${testName}`);
    if (submitBtn) submitBtn.style.display = "block";
    const resultContainer = document.getElementById(
      `test-result-${testName}`
    );
    if (resultContainer) resultContainer.style.display = "none";
    const retryBtn = document.getElementById(`retry-test-${testName}`);
    if (retryBtn) retryBtn.style.display = "none";
  };

  const calculateScore = (testName) => {
    const testData = testsData.tests.find((t) => t.section === testName);
    if (!testData)
      return { scorePercentage: 0, correctAnswers: 0, totalQuestions: 0 };

    let correctAnswers = 0;
    testData.questions.forEach((question, idx) => {
      const selectedOption = document.querySelector(
        `input[name="question${idx}"]:checked`
      );
      if (
        selectedOption &&
        parseInt(selectedOption.value) === question.correctAnswer
      ) {
        correctAnswers++;
      }
    });

    const total = testData.questions.length;
    const percentage = (correctAnswers / total) * 100;
    return { scorePercentage: percentage, correctAnswers, totalQuestions: total };
  };

  const showResult = (testName) => {
    const { scorePercentage, correctAnswers, totalQuestions } =
      calculateScore(testName);
    let message;
    if (scorePercentage <= 20) {
      message = "Ти погано засвоїв матеріал.";
    } else if (scorePercentage <= 40) {
      message = "Тобі потрібно краще опрацювати матеріал.";
    } else if (scorePercentage <= 60) {
      message = "Середній рівень знань.";
    } else if (scorePercentage <= 80) {
      message = "Добре засвоїв матеріал.";
    } else {
      message = "Ти прекрасно засвоїв матеріал.";
    }

    const resultEl = document.getElementById(`test-result-${testName}`);
    if (!resultEl) return;
    resultEl.innerHTML = `<p>${message}</p>
      <p>Ви відповіли правильно на ${correctAnswers} з ${totalQuestions} питань.</p>`;
    resultEl.style.display = "block";

    // Приховуємо питання
    const questionsCtn = document.getElementById(`test-questions-${testName}`);
    if (questionsCtn) questionsCtn.style.display = "none";
    const submitBtn = document.getElementById(`submit-test-${testName}`);
    if (submitBtn) submitBtn.style.display = "none";
    const retryBtn = document.getElementById(`retry-test-${testName}`);
    if (retryBtn) retryBtn.style.display = "block";

    // Якщо залогінений, зберігаємо результат
    const userId = localStorage.getItem("userId");
    if (!userId) {
      console.log("Користувач не авторизований, результат не збережено.");
      return;
    }

    let baseScore = Math.round((scorePercentage / 100) * 500);
    let timeTaken = Math.floor((Date.now() - testStartTime[testName]) / 1000);
    let timeBonus = Math.max(0, 100 - timeTaken);
    let totalScore = baseScore + timeBonus;

    fetch("http://localhost:3000/submit-result", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("authToken"),
      },
      body: JSON.stringify({
        userId: parseInt(userId),
        testName,
        score: totalScore,
        timeTaken,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Результат тесту збережено:", data);
      })
      .catch((err) => console.error("Помилка збереження результату:", err));
  };

  const submitTest = (testName) => {
    showResult(testName);
  };

  const retryTest = (testName) => {
    loadTestQuestions(testName);
  };
});

// --------------------- SNIPPETS - ФУНКЦІЇ ---------------------

////////////////////////////////////////
// 1. Завантаження списку snippet-ів (з параметром сортування)
////////////////////////////////////////
function loadSnippets(sortValue = "dateDesc") {
  let url = "http://localhost:3000/snippets";

  if (sortValue === "likesDesc") {
    url += "?sort=likesDesc";
  } else if (sortValue === "dateAsc") {
    url += "?sort=dateAsc";
  } else if (sortValue === "languageAsc") {
    url += "?sort=languageAsc";
  } else {
    url += "?sort=dateDesc";
  }

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      renderSnippets(data);
    })
    .catch((err) => console.error("Помилка завантаження snippets:", err));
  
  // Закрити модалку по X
  const closeSnippetModalBtn = document.getElementById("close-snippet-modal");
  if (closeSnippetModalBtn) {
    closeSnippetModalBtn.onclick = () => {
      const modal = document.getElementById("snippet-modal");
      if (modal) modal.style.display = "none";
    };
  }

  // Кнопка "Додати" коментар у модалці
  const addCommentBtn = document.getElementById("modal-addCommentBtn");
  if (addCommentBtn) {
    addCommentBtn.onclick = () => {
      const text = document.getElementById("modal-commentText").value.trim();
      if (!text) return;
      addComment(currentSnippetId, text); // parentId = null
      // Очищаємо поле
      document.getElementById("modal-commentText").value = "";
    };
  }
}

////////////////////////////////////////
// 2. Відмалювати snippet-и у #snippetsList
////////////////////////////////////////
function renderSnippets(snippets) {
  const container = document.getElementById("snippetsList");
  if (!container) return;
  container.innerHTML = "";

  const currentUserId = localStorage.getItem("userId") || "";

  snippets.forEach((snippet) => {
    const div = document.createElement("div");
    div.classList.add("snippet-card");

    // Inline-стилі за бажанням
    div.style.margin = "10px 0";
    div.style.padding = "10px";

    // Додаємо class="language-..." залежно від snippet.language
    // Наприклад, якщо snippet.language = "JS", робимо "language-js"
    // Якщо "Python" &rarr; "language-python", тощо.
    const langClass = snippet.language
      ? `language-${snippet.language.toLowerCase()}`
      : "language-plaintext";

    div.innerHTML = `
      <h4>${snippet.title} <small>(${snippet.language || "NoLang"})</small></h4>
      <p>Автор: ${snippet.userName}</p>
      <pre><code class="${langClass}">${snippet.codeText}</code></pre>
    `;

    // Блок лайків
    const likeContainer = document.createElement("div");
    likeContainer.classList.add("snippet-like-container");
    likeContainer.onclick = () => likeSnippet(snippet.id);

    const likeCount = document.createElement("span");
    likeCount.classList.add("snippet-like-count");
    likeCount.textContent = snippet.likes || 0;

    const likeIcon = document.createElement("img");
    likeIcon.classList.add("snippet-like-icon");
    likeIcon.src = "img/like.png";

    likeContainer.appendChild(likeCount);
    likeContainer.appendChild(likeIcon);
    div.appendChild(likeContainer);

    // Edit/Delete, якщо userId збігається
    if (parseInt(snippet.userId) === parseInt(currentUserId)) {
      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit";
      editBtn.classList.add("nav-btn");
      editBtn.style.marginRight = "8px";
      editBtn.onclick = () => editSnippet(snippet);

      const delBtn = document.createElement("button");
      delBtn.textContent = "Delete";
      delBtn.classList.add("nav-btn");
      delBtn.onclick = () => deleteSnippet(snippet.id);

      div.appendChild(editBtn);
      div.appendChild(delBtn);
    }

    // Створимо кнопку
    const viewCommentBtn = document.createElement("button");
    viewCommentBtn.textContent = "Переглянути / Коментувати";
    viewCommentBtn.classList.add("nav-btn");
    viewCommentBtn.style.margin = "8px";

    // При натисканні &rarr; openSnippetModal(snippet)
    viewCommentBtn.onclick = () => openSnippetModal(snippet);

    // Додаємо кнопку до div
    div.appendChild(viewCommentBtn);

    container.appendChild(div);
  });

  // Ось тут викликаємо highlightAll(),
  // коли всі <pre><code> уже в DOM:
  hljs.highlightAll();
}

let currentSnippetId = null;

function openSnippetModal(snippet) {
  currentSnippetId = snippet.id; // збереже ID snippet'a

  const modal = document.getElementById("snippet-modal");
  if (!modal) return;

  // Заповнюємо поля
  document.getElementById("modal-snippet-title").textContent = snippet.title;
  document.getElementById("modal-snippet-author").textContent = snippet.userName || "Невідомо";
  const codeEl = document.getElementById("modal-snippet-code");
  codeEl.textContent = snippet.codeText;

  // Якщо хочете підсвітити конкретною мовою:
  // codeEl.className = "language-" + (snippet.language || "plaintext").toLowerCase();
  // hljs.highlightElement(codeEl);

  // Показати модальне вікно
  modal.style.display = "block";

  // Завантажити коментарі
  loadComments(snippet.id);
}

////////////////////////////////////////
// 3. Створити snippet
////////////////////////////////////////
function createSnippet() {
  const token = localStorage.getItem("authToken");
  if (!token) {
    alert("Спершу увійдіть у систему!");
    return;
  }

  const titleEl = document.getElementById("snippetTitle");
  const codeEl = document.getElementById("snippetCode");
  const langEl = document.getElementById("snippetLang");

  if (!titleEl || !codeEl) {
    console.log("Елементи не знайдені: #snippetTitle, #snippetCode");
    return;
  }

  const title = titleEl.value.trim();
  const codeText = codeEl.value.trim();
  const language = langEl.value.trim();

  if (!title || !codeText) {
    alert("Title і CodeText обов'язкові!");
    return;
  }

  fetch("http://localhost:3000/snippets", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({ title, codeText, language }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        alert("Snippet створено!");
        titleEl.value = "";
        codeEl.value = "";
        langEl.value = "";
        loadSnippets();
      } else {
        alert("Помилка: " + (data.error || ""));
      }
    })
    .catch((err) => console.error("Помилка createSnippet:", err));
}

////////////////////////////////////////
// 4. Видалити snippet
////////////////////////////////////////
function deleteSnippet(snippetId) {
  const token = localStorage.getItem("authToken");
  if (!token) {
    alert("Увійдіть, щоб видалити snippet.");
    return;
  }
  if (!confirm("Видалити snippet?")) return;

  fetch(`http://localhost:3000/snippets/${snippetId}`, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + token,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        alert("Snippet видалено.");
        loadSnippets();
      } else {
        alert("Помилка при видаленні: " + data.error);
      }
    })
    .catch((err) => console.error("Помилка deleteSnippet:", err));
}

////////////////////////////////////////
// 5. Редагувати snippet
////////////////////////////////////////
function editSnippet(snippet) {
  const token = localStorage.getItem("authToken");
  if (!token) {
    alert("Спершу увійдіть!");
    return;
  }
  const newTitle = prompt("Новий заголовок:", snippet.title);
  if (newTitle === null) return;
  const newLang = prompt("Мова:", snippet.language || "");
  if (newLang === null) return;
  const newCode = prompt("Новий codeText:", snippet.codeText);
  if (newCode === null) return;

  fetch(`http://localhost:3000/snippets/${snippet.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({
      title: newTitle,
      codeText: newCode,
      language: newLang,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        alert("Snippet оновлено!");
        loadSnippets();
      } else {
        alert("Помилка оновлення: " + data.error);
      }
    })
    .catch((err) => console.error("Помилка editSnippet:", err));
}

////////////////////////////////////////
// 6. Лайк snippet (POST /snippets/:id/like)
////////////////////////////////////////
function likeSnippet(snippetId) {
  // Перевіряємо, чи є токен (чи авторизований користувач)
  const token = localStorage.getItem("authToken");
  if (!token) {
    alert("Будь ласка, увійдіть, щоб лайкати Snippet.");
    return;
  }

  // Перевіряємо, чи взагалі передали snippetId
  if (!snippetId) {
    console.error("Немає ID snippet'а для лайку!");
    return;
  }

  // Виконуємо POST-запит на маршрут /snippets/:id/like
  fetch(`http://localhost:3000/snippets/${snippetId}/like`, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      // Перевіряємо, чи запит пройшов успішно
      if (data.success) {
        // Оновлюємо список snippet-ів, щоб відобразити нову кількість likes
        loadSnippets();
      } else {
        // Якщо є помилка від сервера (наприклад, snippet не знайдено)
        alert("Помилка лайку: " + (data.error || "Невідома"));
      }
    })
    .catch((err) => {
      console.error("Помилка likeSnippet:", err);
      alert("Сталася помилка при виконанні запиту на лайк.");
    });
}

////////////////////////////////////////
// Коментарі
////////////////////////////////////////

////////////////////////////////////////
// Функція "скільки часу тому"
////////////////////////////////////////
function timeAgo(isoDateString) {
  const date = new Date(isoDateString);
  const now = new Date();
  let diffInSeconds = (now - date) / 1000; // різниця в секундах

  if (diffInSeconds < 60) {
    return "менше хвилини тому";
  }

  let minutes = Math.floor(diffInSeconds / 60);
  if (minutes < 60) {
    return minutes + " хв. тому";
  }

  let hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return hours + " год. тому";
  }

  let days = Math.floor(hours / 24);
  if (days < 30) {
    return days + " дн. тому";
  }

  let months = Math.floor(days / 30);
  if (months < 12) {
    return months + " міс. тому";
  }

  let years = Math.floor(months / 12);
  return years + " р. тому";
}

////////////////////////////////////////
// Завантажити і відобразити коментарі
////////////////////////////////////////
function loadComments(snippetId) {
  fetch(`http://localhost:3000/snippets/${snippetId}/comments`)
    .then(res => res.json())
    .then(data => {
      renderComments(data, snippetId);
    })
    .catch(err => console.error("Помилка завантаження коментарів:", err));
}

function renderComments(comments, snippetId) {
  const container = document.getElementById("commentsList");
  if (!container) return;
  container.innerHTML = "";

  comments.forEach(comment => {
    const div = document.createElement("div");

    // Якщо comment.parentId != null => це відповідь (зсув)
    div.style.marginLeft = comment.parentId ? "30px" : "0";

    // Використовуємо нашу timeAgo, щоб вивести "5 хв. тому" замість повної дати
    const dateStr = timeAgo(comment.dateCreated);

    div.innerHTML = `
      <p>
        <strong>${comment.userName}</strong> &bull;
        <small>${dateStr}</small>
      </p>
      <p>${comment.commentText}</p>
    `;

    // Кнопка "Відповісти"
    const replyBtn = document.createElement("button");
    replyBtn.classList.add("nav-btn");
    replyBtn.textContent = "Відповісти";
    // Відступ між кнопками
    replyBtn.style.marginRight = "5px";

    replyBtn.onclick = () => {
      const text = prompt("Ваш коментар (відповідь):");
      if (text) {
        addComment(snippetId, text, comment.id);
      }
    };
    div.appendChild(replyBtn);

    // Якщо автор => "Редагувати" / "Видалити"
    const currentUserId = localStorage.getItem("userId") || "";
    if (parseInt(comment.userId) === parseInt(currentUserId)) {
      // Редагувати
      const editBtn = document.createElement("button");
      editBtn.classList.add("nav-btn");
      editBtn.textContent = "Редагувати";
      editBtn.style.marginRight = "5px";
      editBtn.onclick = () => {
        const newText = prompt("Новий текст:", comment.commentText);
        if (newText !== null) {
          editComment(comment.id, newText, snippetId);
        }
      };
      div.appendChild(editBtn);

      // Видалити
      const delBtn = document.createElement("button");
      delBtn.classList.add("nav-btn");
      delBtn.textContent = "Видалити";
      delBtn.style.marginRight = "5px";
      delBtn.onclick = () => {
        if (confirm("Видалити коментар?")) {
          deleteComment(comment.id, snippetId);
        }
      };
      div.appendChild(delBtn);
    }

    container.appendChild(div);
  });
}

function addComment(snippetId, commentText, parentId = null) {
  const token = localStorage.getItem("authToken");
  if (!token) {
    alert("Спершу увійдіть!");
    return;
  }
  fetch(`http://localhost:3000/snippets/${snippetId}/comments`, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({ commentText, parentId })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        // знову завантажуємо коментарі, щоби побачити новий
        loadComments(snippetId);
      } else {
        alert("Помилка додавання коментаря: " + (data.error || ''));
      }
    })
    .catch(err => console.error("Помилка addComment:", err));
}

function editComment(commentId, newText, snippetId) {
  const token = localStorage.getItem("authToken");
  if (!token) {
    alert("Спершу увійдіть!");
    return;
  }
  fetch(`http://localhost:3000/comments/${commentId}`, {
    method: 'PUT',
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({ newText })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        loadComments(snippetId);
      } else {
        alert("Помилка редагування: " + (data.error || ''));
      }
    })
    .catch(err => console.error("Помилка editComment:", err));
}

function deleteComment(commentId, snippetId) {
  const token = localStorage.getItem("authToken");
  if (!token) {
    alert("Спершу увійдіть!");
    return;
  }
  fetch(`http://localhost:3000/comments/${commentId}`, {
    method: 'DELETE',
    headers: {
      Authorization: "Bearer " + token
    }
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        loadComments(snippetId); // оновити список коментарів
      } else {
        alert("Помилка видалення коментаря: " + (data.error || ''));
      }
    })
    .catch(err => console.error("Помилка deleteComment:", err));
}

////////////////////////////////////////
// Коли DOM готовий — викликаємо loadSnippets()
////////////////////////////////////////

document.addEventListener("DOMContentLoaded", () => {
  // Шукаємо контейнер для snippet-ів
  const snippetListEl = document.getElementById("snippetsList");
  if (snippetListEl) {
    // За замовчуванням завантажимо snippets з сортуванням "dateDesc" (останні додані)
    loadSnippets("dateDesc");

    // Кнопка "Створити Snippet" (якщо існує)
    const createBtn = document.getElementById("createSnippetBtn");
    if (createBtn) {
      createBtn.addEventListener("click", createSnippet);
    }

    // Блок із селектом сортування
    const sortSelect = document.getElementById("sortSnippets");
    const sortApplyBtn = document.getElementById("sortSnippetsApply");

    if (sortApplyBtn && sortSelect) {
      sortApplyBtn.addEventListener("click", () => {
        // Зчитуємо обране значення з <select>
        const sortValue = sortSelect.value; 
        // Викликаємо loadSnippets(sortValue), яке підставить ?sort=... до URL
        loadSnippets(sortValue);
      });
    }
  }
});

