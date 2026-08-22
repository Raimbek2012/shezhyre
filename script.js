const SUPABASE_URL = 'https://enlphelzeokcozwyropm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVubHBoZWx6ZW9rY296d3lyb3BtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMTgzMzAsImV4cCI6MjEwMjg5NDMzMH0.q7RUP8mp1xs3_TrwQ11riBtiq3JDuW0GywesomXKf0Q';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ПЕРЕВОДЫ (ЯЗЫКИ: RU / KK)
const i18n = {
  ru: {
    app_title: "Шежире рода Ишаевых",
    app_subtitle: "Генеалогическое древо и история нашей семьи",
    about_author: "Обо мне",
    login_register: "Войти / Регистрация",
    logout: "Выйти",
    lobby_welcome: "Добро пожаловать в Шежире",
    lobby_desc: "Авторизуйтесь, чтобы начать управление семейным древом, или выберите просмотр древа.",
    view_tree: "Смотреть древо",
    instruction: "Перетаскивайте удерживая мышь, используйте колесико или кнопки для масштабирования.",
    about_title: "Об авторе проекта",
    about_text_1: "Приветствую! Данное шежире было создано мной для сохранения и передачи истории нашего рода будущим поколениям.",
    about_text_2: "Здесь вы можете изучать семейные связи, узнавать о своих предках и вносить новых членов нашей семьи.",
    close: "Закрыть",
    add_root_title: "Добавить новый род / основателя",
    root_name_label: "Имя и Фамилия основателя:",
    birth_year: "Год рождения:",
    death_year: "Год смерти:",
    cancel: "Отмена",
    add: "Добавить",
    edit_title: "Редактировать данные",
    name_label: "Имя и Фамилия:",
    spouse_label: "Супруг / Супруга:",
    save: "Сохранить",
    add_child_title: "Добавить потомка",
    parent_label: "Родитель:",
    child_name_label: "Имя и Фамилия ребенка:",
    login_title: "Вход в систему",
    password_label: "Пароль:",
    login_btn: "Войти",
    no_account: "Нет аккаунта? Зарегистрироваться",
    created_by: "Создатель и разработчик сайта:",
    delete_confirm: "Вы действительно хотите удалить этого родственника?"
  },
  kk: {
    app_title: "Ишаевтар әулетінің шежіресі",
    app_subtitle: "Отбасымыздың генеалогиялық ағашы мен тарихы",
    about_author: "Мен туралы",
    login_register: "Киру / Тіркелу",
    logout: "Шығу",
    lobby_welcome: "Шежіреге кош келдіңіз",
    lobby_desc: "Отбасылық ағашты басқару үшін жүйеге кіріңіз немесе ағашты қарауды таңдаңыз.",
    view_tree: "Ағашты қарау",
    instruction: "Тышқанды ұстап жылжытыңыз, масштабын өзгерту үшін дөңгелекті қолданыңыз.",
    about_title: "Жоба авторы туралы",
    about_text_1: "Сәлеметсіз бе! Бул шежіре болашақ ұрпаққа әулетіміздің тарихын сақтау үшін жасалған.",
    about_text_2: "Мұнда сіз отбасылық байланыстарды зерттеп, бабаларыңыз туралы біле аласыз.",
    close: "Жабу",
    add_root_title: "Жаңа атаны / әулетті қосу",
    root_name_label: "Атаның аты-жөні:",
    birth_year: "Туған жылы:",
    death_year: "Қайтыс болған жылы:",
    cancel: "Бас тарту",
    add: "Қосу",
    edit_title: "Деректерді өңдеу",
    name_label: "Аты-жөні:",
    spouse_label: "Жұбайы / Зайыбы:",
    save: "Сақтау",
    add_child_title: "Ұрпақ қосу",
    parent_label: "Ата-анасы:",
    child_name_label: "Баланың аты-жөні:",
    login_title: "Жүйеге кіру",
    password_label: "Құпия сөз:",
    login_btn: "Кіру",
    no_account: "Аккаунт жоқ па? Тіркелу",
    created_by: "Сайтты жасаған және әзірлеуші:",
    delete_confirm: "Бұл туысты өшіргіңіз келетініне сенімдісіз бе?"
  }
};

let currentLang = 'ru';
let isDeleteMode = false;
let currentUser = null;

document.addEventListener('DOMContentLoaded', async function () {

  // Элементы переключения экрана
  const lobbyScreen = document.getElementById('lobby-screen');
  const treeMainScreen = document.getElementById('tree-main-screen');
  const lobbyViewTreeBtn = document.getElementById('lobby-view-tree-btn');
  const lobbyLoginBtn = document.getElementById('lobby-login-btn');

  // Модалка "Обо мне"
  const aboutAuthorBtn = document.getElementById('about-author-btn');
  const aboutModalOverlay = document.getElementById('about-modal-overlay');
  const closeAboutModalBtn = document.getElementById('close-about-modal-btn');
  const closeAboutBtn = document.getElementById('close-about-btn');

  // Переключение темы
  const themeToggleBtn = document.getElementById('theme-toggle-btn');

  // Языки
  const langRuBtn = document.getElementById('lang-ru-btn');
  const langKkBtn = document.getElementById('lang-kk-btn');

  // Кнопки режимов
  const fabContainer = document.getElementById('fab-container');
  const toggleDeleteModeBtn = document.getElementById('toggle-delete-mode-btn');
  const addRootBtn = document.getElementById('add-root-btn');

  // Модалка добавления потомка
  const modalOverlay = document.getElementById('modal-overlay');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  const addChildForm = document.getElementById('add-child-form');
  const parentNameInput = document.getElementById('parent-name-input');
  const childNameInput = document.getElementById('child-name-input');
  const childBirthInput = document.getElementById('child-birth-input');
  const childDeathInput = document.getElementById('child-death-input');

  // Модалка основания
  const rootModalOverlay = document.getElementById('root-modal-overlay');
  const closeRootModalBtn = document.getElementById('close-root-modal-btn');
  const cancelRootBtn = document.getElementById('cancel-root-btn');
  const addRootForm = document.getElementById('add-root-form');
  const rootNameInput = document.getElementById('root-name-input');
  const rootBirthInput = document.getElementById('root-birth-input');
  const rootDeathInput = document.getElementById('root-death-input');

  // Модалка редактирования
  const editModalOverlay = document.getElementById('edit-modal-overlay');
  const closeEditModalBtn = document.getElementById('close-edit-modal-btn');
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  const editPersonForm = document.getElementById('edit-person-form');
  const editNameInput = document.getElementById('edit-name-input');
  const editSpouseInput = document.getElementById('edit-spouse-input');
  const editBirthInput = document.getElementById('edit-birth-input');
  const editDeathInput = document.getElementById('edit-death-input');

  // Авторизация
  const authModalOverlay = document.getElementById('auth-modal-overlay');
  const openAuthModalBtn = document.getElementById('open-auth-modal-btn');
  const closeAuthModalBtn = document.getElementById('close-auth-modal-btn');
  const authForm = document.getElementById('auth-form');
  const authEmailInput = document.getElementById('auth-email');
  const authPasswordInput = document.getElementById('auth-password');
  const authSubmitBtn = document.getElementById('auth-submit-btn');
  const toggleAuthModeBtn = document.getElementById('toggle-auth-mode-btn');
  const authTitle = document.getElementById('auth-title');
  const guestView = document.getElementById('guest-view');
  const userView = document.getElementById('user-view');
  const userEmailDisplay = document.getElementById('user-email-display');
  const logoutBtn = document.getElementById('logout-btn');

  let currentParentId = null;
  let currentEditPersonId = null;
  let isSignUpMode = false;

  // 1. СМЕНА ТЕМЫ (Светлая / Темная)
  themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    themeToggleBtn.textContent = isDark ? '☀️' : '🌙';
  });

  // 2. ЯЗЫКОВАЯ ПОДДЕРЖКА (RU / KK)
  function applyLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (i18n[lang][key]) {
        el.textContent = i18n[lang][key];
      }
    });

    if (lang === 'ru') {
      langRuBtn.classList.add('active-lang');
      langKkBtn.classList.remove('active-lang');
    } else {
      langKkBtn.classList.add('active-lang');
      langRuBtn.classList.remove('active-lang');
    }
  }

  langRuBtn.addEventListener('click', () => applyLanguage('ru'));
  langKkBtn.addEventListener('click', () => applyLanguage('kk'));

  // 3. ЭКРАН ЛОББИ И ПЕРЕХОД К ДРЕВУ
  function openTreeScreen() {
    lobbyScreen.classList.add('hidden');
    treeMainScreen.classList.remove('hidden');
  }

  lobbyViewTreeBtn.addEventListener('click', openTreeScreen);
  lobbyLoginBtn.addEventListener('click', () => authModalOverlay.classList.remove('hidden'));

  // 4. ОБО МНЕ
  aboutAuthorBtn.addEventListener('click', () => aboutModalOverlay.classList.remove('hidden'));
  closeAboutModalBtn.addEventListener('click', () => aboutModalOverlay.classList.add('hidden'));
  closeAboutBtn.addEventListener('click', () => aboutModalOverlay.classList.add('hidden'));

  // 5. РЕЖИМ УДАЛЕНИЯ
  toggleDeleteModeBtn.addEventListener('click', () => {
    isDeleteMode = !isDeleteMode;
    toggleDeleteModeBtn.classList.toggle('active-delete-mode', isDeleteMode);
    loadTree();
  });

  // 6. ПРОВЕРКА СЕССИИ
  async function checkUserSession() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    currentUser = session ? session.user : null;
    updateAuthUI();
  }

  function updateAuthUI() {
    if (currentUser) {
      guestView.classList.add('hidden');
      userView.classList.remove('hidden');
      userEmailDisplay.textContent = currentUser.email;
      if (fabContainer) fabContainer.classList.remove('hidden');
    } else {
      guestView.classList.remove('hidden');
      userView.classList.add('hidden');
      userEmailDisplay.textContent = '';
      if (fabContainer) fabContainer.classList.add('hidden');
      isDeleteMode = false;
    }
    loadTree();
  }

  supabaseClient.auth.onAuthStateChange((_event, session) => {
    currentUser = session ? session.user : null;
    updateAuthUI();
  });

  // 7. ЗАГРУЗКА И ПОСТРОЕНИЕ ДРЕВА
  async function loadTree() {
    const treeContainer = document.querySelector('.tree > ul');
    if (!treeContainer) return;
    
    treeContainer.innerHTML = '<li>Загрузка...</li>';

    const { data: people, error } = await supabaseClient.from('people').select('*');

    if (error) {
      console.error(error);
      treeContainer.innerHTML = '<li>Ошибка загрузки данных</li>';
      return;
    }

    treeContainer.innerHTML = '';
    const rootPeople = people.filter(p => p.parent_id === null);

    if (rootPeople.length > 0) {
      rootPeople.forEach(rootPerson => {
        const rootElement = createPersonElement(rootPerson, people);
        treeContainer.appendChild(rootElement);
      });
    } else {
      treeContainer.innerHTML = '<li>Нет основателей. Нажмите "+" внизу экрана.</li>';
    }
  }

  function createPersonElement(person, allPeople) {
    const li = document.createElement('li');
    const isRoot = person.parent_id === null;
    const children = allPeople.filter(p => p.parent_id === person.id);
    const hasChildren = children.length > 0;

    let actionButtonsHTML = '';
    if (currentUser) {
      if (isDeleteMode) {
        actionButtonsHTML = `<button class="delete-card-btn" title="Удалить">🗑️</button>`;
      } else {
        actionButtonsHTML = `
          <button class="edit-btn" title="Изменить">✏️</button>
          <button class="add-child-btn" title="Добавить потомка">+</button>
        `;
      }
    }

    const toggleIndicatorHTML = hasChildren ? `<span class="toggle-icon">[−]</span>` : '';
    const spouseHTML = person.spouse ? `<span class="spouse-name">❤️ ${person.spouse}</span>` : '';
    
    let yearsText = '';
    if (person.birth_year || person.death_year) {
      yearsText = `(${person.birth_year || '...'} — ${person.death_year || '...'})`;
    }
    const yearsHTML = yearsText ? `<span class="years">${yearsText}</span>` : '';

    li.innerHTML = `
      <div class="person-card ${isRoot ? 'root-person' : ''}" 
           data-id="${person.id}" 
           data-spouse="${person.spouse || ''}"
           data-birth="${person.birth_year || ''}"
           data-death="${person.death_year || ''}">
        <span class="name">${person.name}</span>
        ${yearsHTML}
        ${spouseHTML}
        ${toggleIndicatorHTML}
        <div class="action-btns">${actionButtonsHTML}</div>
      </div>
    `;

    if (hasChildren) {
      const childrenUl = document.createElement('ul');
      childrenUl.className = 'children';
      children.forEach(child => {
        childrenUl.appendChild(createPersonElement(child, allPeople));
      });
      li.appendChild(childrenUl);
    }

    return li;
  }

  // СВОРАЧИВАНИЕ / РАЗВОРАЧИВАНИЕ И ФОКУСИРОВКА НА КАРТОЧКЕ
  document.addEventListener('click', function (event) {
    const card = event.target.closest('.person-card');
    if (!card) return;

    // Если кликнули на кнопки редактирования/удаления — пропускаем
    if (event.target.closest('.action-btns')) return;

    const li = card.closest('li');
    const childrenUl = li.querySelector(':scope > ul.children');
    const toggleIcon = card.querySelector('.toggle-icon');

    if (childrenUl) {
      childrenUl.classList.toggle('collapsed');
      const isCollapsed = childrenUl.classList.contains('collapsed');
      if (toggleIcon) {
        toggleIcon.textContent = isCollapsed ? '[+]' : '[−]';
      }
    }

    // Фокусировка экрана на выбранной карте
    focusOnElement(card);
  });

  // Функция фокусировки
  function focusOnElement(element) {
    const rect = element.getBoundingClientRect();
    const viewportRect = viewport.getBoundingClientRect();

    const elementCenterX = rect.left + rect.width / 2;
    const elementCenterY = rect.top + rect.height / 2;

    const viewportCenterX = viewportRect.left + viewportRect.width / 2;
    const viewportCenterY = viewportRect.top + viewportRect.height / 2;

    const deltaX = viewportCenterX - elementCenterX;
    const deltaY = viewportCenterY - elementCenterY;

    pointX += deltaX;
    pointY += deltaY;
    updateTransform();
  }

  // 8. УДАЛЕНИЕ РОДСТВЕННИКА
  document.addEventListener('click', async function (event) {
    if (event.target.classList.contains('delete-card-btn')) {
      const parentCard = event.target.closest('.person-card');
      const id = parentCard.getAttribute('data-id');

      if (confirm(i18n[currentLang].delete_confirm)) {
        const { error } = await supabaseClient.from('people').delete().eq('id', id);
        if (error) alert('Ошибка удаления: ' + error.message);
        else loadTree();
      }
    }
  });

  // 9. СОЗДАНИЕ ОСНОВАТЕЛЯ РОДА
  if (addRootBtn) addRootBtn.addEventListener('click', () => rootModalOverlay.classList.remove('hidden'));
  
  function closeRootModal() {
    rootModalOverlay.classList.add('hidden');
    rootNameInput.value = '';
    rootBirthInput.value = '';
    rootDeathInput.value = '';
  }

  if (closeRootModalBtn) closeRootModalBtn.addEventListener('click', closeRootModal);
  if (cancelRootBtn) cancelRootBtn.addEventListener('click', closeRootModal);

  if (addRootForm) {
    addRootForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = rootNameInput.value.trim();
      const birth_year = rootBirthInput.value.trim();
      const death_year = rootDeathInput.value.trim();

      if (!name) return;

      const { error } = await supabaseClient
        .from('people')
        .insert([{ name, parent_id: null, birth_year, death_year }]);

      if (error) alert('Ошибка создания: ' + error.message);
      else {
        closeRootModal();
        loadTree();
      }
    });
  }

  // 10. РЕДАКТИРОВАНИЕ
  document.addEventListener('click', function (event) {
    if (event.target.classList.contains('edit-btn')) {
      const parentCard = event.target.closest('.person-card');
      if (parentCard) {
        currentEditPersonId = parentCard.getAttribute('data-id');
        editNameInput.value = parentCard.querySelector('.name').textContent;
        editSpouseInput.value = parentCard.getAttribute('data-spouse') || '';
        editBirthInput.value = parentCard.getAttribute('data-birth') || '';
        editDeathInput.value = parentCard.getAttribute('data-death') || '';
        editModalOverlay.classList.remove('hidden');
      }
    }
  });

  function closeEditModal() {
    editModalOverlay.classList.add('hidden');
    editNameInput.value = '';
    editSpouseInput.value = '';
    editBirthInput.value = '';
    editDeathInput.value = '';
    currentEditPersonId = null;
  }

  if (closeEditModalBtn) closeEditModalBtn.addEventListener('click', closeEditModal);
  if (cancelEditBtn) cancelEditBtn.addEventListener('click', closeEditModal);

  if (editPersonForm) {
    editPersonForm.addEventListener('submit', async function (event) {
      event.preventDefault();
      const name = editNameInput.value.trim();
      const spouse = editSpouseInput.value.trim();
      const birth_year = editBirthInput.value.trim();
      const death_year = editDeathInput.value.trim();

      if (!name || !currentEditPersonId) return;

      const { error } = await supabaseClient
        .from('people')
        .update({ name, spouse: spouse || null, birth_year, death_year })
        .eq('id', currentEditPersonId);

      if (error) alert('Ошибка обновления: ' + error.message);
      else {
        closeEditModal();
        loadTree();
      }
    });
  }

  // 11. ДОБАВЛЕНИЕ ПОТОМКА
  document.addEventListener('click', function (event) {
    if (event.target.classList.contains('add-child-btn')) {
      const parentCard = event.target.closest('.person-card');
      if (parentCard) {
        currentParentId = parentCard.getAttribute('data-id');
        parentNameInput.value = parentCard.querySelector('.name').textContent;
        modalOverlay.classList.remove('hidden');
      }
    }
  });

  function closeModal() {
    modalOverlay.classList.add('hidden');
    childNameInput.value = '';
    childBirthInput.value = '';
    childDeathInput.value = '';
    currentParentId = null;
  }

  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  if (addChildForm) {
    addChildForm.addEventListener('submit', async function (event) {
      event.preventDefault();
      const name = childNameInput.value.trim();
      const birth_year = childBirthInput.value.trim();
      const death_year = childDeathInput.value.trim();

      if (!name || !currentParentId) return;

      const { error } = await supabaseClient
        .from('people')
        .insert([{ name, parent_id: parseInt(currentParentId), birth_year, death_year }]);

      if (error) alert('Ошибка сохранения: ' + error.message);
      else {
        closeModal();
        loadTree();
      }
    });
  }

  // 12. АВТОРИЗАЦИЯ
  if (openAuthModalBtn) openAuthModalBtn.addEventListener('click', () => authModalOverlay.classList.remove('hidden'));
  if (closeAuthModalBtn) closeAuthModalBtn.addEventListener('click', () => authModalOverlay.classList.add('hidden'));

  if (toggleAuthModeBtn) {
    toggleAuthModeBtn.addEventListener('click', () => {
      isSignUpMode = !isSignUpMode;
      authTitle.textContent = isSignUpMode ? i18n[currentLang].no_account : i18n[currentLang].login_title;
      authSubmitBtn.textContent = isSignUpMode ? 'Зарегистрироваться' : i18n[currentLang].login_btn;
      toggleAuthModeBtn.textContent = isSignUpMode ? 'Уже есть аккаунт? Войти' : i18n[currentLang].no_account;
    });
  }

  if (authForm) {
    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = authEmailInput.value.trim();
      const password = authPasswordInput.value.trim();

      if (isSignUpMode) {
        const { error } = await supabaseClient.auth.signUp({ email, password });
        if (error) alert('Ошибка: ' + error.message);
        else {
          alert('Регистрация успешна!');
          authModalOverlay.classList.add('hidden');
          openTreeScreen();
        }
      } else {
        const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) alert('Ошибка: ' + error.message);
        else {
          authModalOverlay.classList.add('hidden');
          openTreeScreen();
        }
      }
    });
  }

  if (logoutBtn) logoutBtn.addEventListener('click', () => supabaseClient.auth.signOut());

  // 13. МАСШТАБИРОВАНИЕ И ПЕРЕТАСКИВАНИЕ
  const viewport = document.getElementById('viewport');
  const panContainer = document.getElementById('pan-container');
  const zoomInBtn = document.getElementById('zoom-in');
  const zoomOutBtn = document.getElementById('zoom-out');
  const zoomResetBtn = document.getElementById('zoom-reset');

  let scale = 1;
  let pointX = 0;
  let pointY = 0;
  let startX = 0;
  let startY = 0;
  let isDragging = false;
  let initialPinchDistance = null;

  function updateTransform() {
    if (panContainer) {
      panContainer.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`;
    }
  }

  if (viewport) {
    viewport.addEventListener('mousedown', (e) => {
      if (e.target.closest('.person-card') || e.target.closest('#zoom-controls')) return;
      isDragging = true;
      startX = e.clientX - pointX;
      startY = e.clientY - pointY;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      e.preventDefault();
      pointX = e.clientX - startX;
      pointY = e.clientY - startY;
      updateTransform();
    });

    window.addEventListener('mouseup', () => { isDragging = false; });

    viewport.addEventListener('wheel', (e) => {
      e.preventDefault();
      const xs = (e.clientX - pointX) / scale;
      const ys = (e.clientY - pointY) / scale;
      const delta = -e.deltaY;

      scale = delta > 0 ? Math.min(scale * 1.1, 3) : Math.max(scale / 1.1, 0.3);
      pointX = e.clientX - xs * scale;
      pointY = e.clientY - ys * scale;
      updateTransform();
    }, { passive: false });

    // Сенсор
    viewport.addEventListener('touchstart', (e) => {
      if (e.target.closest('.person-card') || e.target.closest('#zoom-controls')) return;

      if (e.touches.length === 1) {
        isDragging = true;
        startX = e.touches[0].clientX - pointX;
        startY = e.touches[0].clientY - pointY;
      } else if (e.touches.length === 2) {
        isDragging = false;
        initialPinchDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    }, { passive: false });

    viewport.addEventListener('touchmove', (e) => {
      if (e.target.closest('#zoom-controls')) return;

      if (e.touches.length === 1 && isDragging) {
        e.preventDefault();
        pointX = e.touches[0].clientX - startX;
        pointY = e.touches[0].clientY - startY;
        updateTransform();
      } else if (e.touches.length === 2 && initialPinchDistance) {
        e.preventDefault();
        const currentDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );

        const factor = currentDistance / initialPinchDistance;
        scale = Math.min(Math.max(scale * factor, 0.3), 3);
        initialPinchDistance = currentDistance;
        updateTransform();
      }
    }, { passive: false });

    viewport.addEventListener('touchend', (e) => {
      if (e.touches.length < 2) initialPinchDistance = null;
      if (e.touches.length === 0) isDragging = false;
    });
  }

  if (zoomInBtn) zoomInBtn.addEventListener('click', () => { scale = Math.min(scale * 1.2, 3); updateTransform(); });
  if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => { scale = Math.max(scale / 1.2, 0.3); updateTransform(); });
  if (zoomResetBtn) zoomResetBtn.addEventListener('click', () => { scale = 1; pointX = 0; pointY = 0; updateTransform(); });

  await checkUserSession();
});