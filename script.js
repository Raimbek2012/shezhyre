const SUPABASE_URL = 'https://enlphelzeokcozwyropm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVubHBoZWx6ZW9rY296d3lyb3BtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMTgzMzAsImV4cCI6MjEwMjg5NDMzMH0.q7RUP8mp1xs3_TrwQ11riBtiq3JDuW0GywesomXKf0Q';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const i18n = {
  ru: {
    app_title: "Шежире рода",
    app_subtitle: "Генеалогическое древо и история нашей семьи",
    about_author: "Обо мне",
    lobby_welcome: "Вход в семейное шежире",
    lobby_desc: "Введите название вашего рода и пароль. Если рода с таким названием нет, он создастся автоматически.",
    instruction: "Перетаскивайте удерживая мышь, используйте колесико или кнопки для масштабирования.",
    about_title: "Об авторе проекта",
    about_text_1: "Приветствую! Меня зовут Раимбек. Данное шежире было создано мной для сохранения и передачи истории нашего рода будущим поколениям.",
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
    created_by: "Создатель и разработчик сайта:",
    delete_confirm: "Вы действительно хотите удалить этого родственника?"
  },
  kk: {
    app_title: "Әулет шежіресі",
    app_subtitle: "Отбасымыздың генеалогиялық ағашы мен тарихы",
    about_author: "Мен туралы",
    lobby_welcome: "Шежіреге кіру",
    lobby_desc: "Әулетіңіздің атын және құпия сөзін енгізіңіз.",
    instruction: "Тышқанды ұстап жылжытыңыз, масштабын өзгерту үшін дөңгелекті қолданыңыз.",
    about_title: "Жоба авторы туралы",
    about_text_1: "Сәлеметсіз бе! Менің атым Райымбек. Бұл шежіре болашақ ұрпаққа әулетіміздің тарихын сақтау үшін жасалған.",
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
    created_by: "Сайтты жасаған және әзірлеуші:",
    delete_confirm: "Бұл туысты өшіргіңіз келетініне сенімдісіз бе?"
  }
};

let currentLang = 'ru';
let isDeleteMode = false;
let currentTree = null; // Текущий выбранный род
let currentEditorUser = null; // Пользователь-редактор с почтой

document.addEventListener('DOMContentLoaded', async function () {

  const lobbyScreen = document.getElementById('lobby-screen');
  const treeMainScreen = document.getElementById('tree-main-screen');
  const treeInfoPanel = document.getElementById('tree-info-panel');
  const currentTreeDisplay = document.getElementById('current-tree-display');
  const leaveTreeBtn = document.getElementById('leave-tree-btn');

  // Форма входа в род
  const treeAccessForm = document.getElementById('tree-access-form');
  const treeNameInput = document.getElementById('tree-name-input');
  const treePasswordInput = document.getElementById('tree-password-input');

  // Авторизация редактора
  const editorModalOverlay = document.getElementById('editor-modal-overlay');
  const openEditorAuthBtn = document.getElementById('open-editor-auth-btn');
  const closeEditorModalBtn = document.getElementById('close-editor-modal-btn');
  const editorAuthForm = document.getElementById('editor-auth-form');
  const editorEmailInput = document.getElementById('editor-email');
  const editorPasswordInput = document.getElementById('editor-password');
  const editorSubmitBtn = document.getElementById('editor-submit-btn');
  const toggleEditorModeBtn = document.getElementById('toggle-editor-mode-btn');
  const logoutEditorBtn = document.getElementById('logout-editor-btn');
  const editorStatusText = document.getElementById('editor-status-text');

  // Модалка "Обо мне"
  const aboutAuthorBtn = document.getElementById('about-author-btn');
  const aboutModalOverlay = document.getElementById('about-modal-overlay');
  const closeAboutModalBtn = document.getElementById('close-about-modal-btn');
  const closeAboutBtn = document.getElementById('close-about-btn');

  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const langRuBtn = document.getElementById('lang-ru-btn');
  const langKkBtn = document.getElementById('lang-kk-btn');

  const fabContainer = document.getElementById('fab-container');
  const toggleDeleteModeBtn = document.getElementById('toggle-delete-mode-btn');
  const addRootBtn = document.getElementById('add-root-btn');

  // Модалка потомка
  const modalOverlay = document.getElementById('modal-overlay');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  const addChildForm = document.getElementById('add-child-form');
  const parentNameInput = document.getElementById('parent-name-input');
  const childNameInput = document.getElementById('child-name-input');
  const childBirthInput = document.getElementById('child-birth-input');
  const childDeathInput = document.getElementById('child-death-input');

  // Модалка основателя
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

  let currentParentId = null;
  let currentEditPersonId = null;
  let isSignUpEditor = false;

  // 1. ТЕМА И ЯЗЫКИ
  themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    themeToggleBtn.textContent = document.body.classList.contains('dark-theme') ? '☀️' : '🌙';
  });

  function applyLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (i18n[lang][key]) el.textContent = i18n[lang][key];
    });
    langRuBtn.classList.toggle('active-lang', lang === 'ru');
    langKkBtn.classList.toggle('active-lang', lang === 'kk');
  }

  langRuBtn.addEventListener('click', () => applyLanguage('ru'));
  langKkBtn.addEventListener('click', () => applyLanguage('kk'));

  aboutAuthorBtn.addEventListener('click', () => aboutModalOverlay.classList.remove('hidden'));
  closeAboutModalBtn.addEventListener('click', () => aboutModalOverlay.classList.add('hidden'));
  closeAboutBtn.addEventListener('click', () => aboutModalOverlay.classList.add('hidden'));

  toggleDeleteModeBtn.addEventListener('click', () => {
    isDeleteMode = !isDeleteMode;
    toggleDeleteModeBtn.classList.toggle('active-delete-mode', isDeleteMode);
    loadTree();
  });

  // 2. ВХОД / СОЗДАНИЕ РОДА (ИМЯ + ПАРОЛЬ)
  treeAccessForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const treeName = treeNameInput.value.trim();
    const treePassword = treePasswordInput.value.trim();

    if (!treeName || !treePassword) return;

    // Ищем род с таким именем
    let { data: existingTree, error } = await supabaseClient
      .from('trees')
      .select('*')
      .eq('name', treeName)
      .maybeSingle();

    if (error) {
      alert('Ошибка запроса: ' + error.message);
      return;
    }

    if (existingTree) {
      // Род существует — проверяем пароль
      if (existingTree.password !== treePassword) {
        alert('Неверный пароль рода!');
        return;
      }
      currentTree = existingTree;
    } else {
      // Рода нет — создаем новый
      const { data: newTree, error: createError } = await supabaseClient
        .from('trees')
        .insert([{ name: treeName, password: treePassword }])
        .select()
        .single();

      if (createError) {
        alert('Ошибка создания рода: ' + createError.message);
        return;
      }
      currentTree = newTree;
      alert(`Новый род "${treeName}" успешно создан!`);
    }

    localStorage.setItem('shezhire_tree', JSON.stringify(currentTree));
    enterTreeUI();
  });

  leaveTreeBtn.addEventListener('click', () => {
    currentTree = null;
    localStorage.removeItem('shezhire_tree');
    lobbyScreen.classList.remove('hidden');
    treeMainScreen.classList.add('hidden');
    treeInfoPanel.classList.add('hidden');
  });

  function enterTreeUI() {
    lobbyScreen.classList.add('hidden');
    treeMainScreen.classList.remove('hidden');
    treeInfoPanel.classList.remove('hidden');
    currentTreeDisplay.textContent = `Род: ${currentTree.name}`;
    loadTree();
    checkEditorSession();
  }

  // 3. АВТОРИЗАЦИЯ РЕДАКТОРА (ПОЧТА)
  openEditorAuthBtn.addEventListener('click', () => editorModalOverlay.classList.remove('hidden'));
  closeEditorModalBtn.addEventListener('click', () => editorModalOverlay.classList.add('hidden'));

  toggleEditorModeBtn.addEventListener('click', () => {
    isSignUpEditor = !isSignUpEditor;
    editorSubmitBtn.textContent = isSignUpEditor ? 'Зарегистрироваться' : 'Войти как редактор';
    toggleEditorModeBtn.textContent = isSignUpEditor ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться';
  });

  editorAuthForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = editorEmailInput.value.trim();
    const password = editorPasswordInput.value.trim();

    if (isSignUpEditor) {
      const { error } = await supabaseClient.auth.signUp({ email, password });
      if (error) alert('Ошибка регистрации: ' + error.message);
      else alert('Регистрация прошла успешно!');
    } else {
      const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) alert('Ошибка входа: ' + error.message);
      else editorModalOverlay.classList.add('hidden');
    }
  });

  logoutEditorBtn.addEventListener('click', () => supabaseClient.auth.signOut());

  async function checkEditorSession() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    currentEditorUser = session ? session.user : null;
    updateEditorUI();
  }

  function updateEditorUI() {
    if (currentEditorUser) {
      openEditorAuthBtn.classList.add('hidden');
      logoutEditorBtn.classList.remove('hidden');
      editorStatusText.textContent = `Редактор: ${currentEditorUser.email}`;
      editorStatusText.className = 'status-badge editor';
      fabContainer.classList.remove('hidden');
    } else {
      openEditorAuthBtn.classList.remove('hidden');
      logoutEditorBtn.classList.add('hidden');
      editorStatusText.textContent = 'Режим чтения';
      editorStatusText.className = 'status-badge viewer';
      fabContainer.classList.add('hidden');
      isDeleteMode = false;
    }
    loadTree();
  }

  supabaseClient.auth.onAuthStateChange((_event, session) => {
    currentEditorUser = session ? session.user : null;
    updateEditorUI();
  });

  // 4. ЗАГРУЗКА ДРЕВА ТЕКУЩЕГО РОДА
  async function loadTree() {
    if (!currentTree) return;
    const treeContainer = document.querySelector('.tree > ul');
    if (!treeContainer) return;

    treeContainer.innerHTML = '<li>Загрузка...</li>';

    // Загружаем ЛЮДЕЙ ТОЛЬКО ТЕКУЩЕГО РОДА
    const { data: people, error } = await supabaseClient
      .from('people')
      .select('*')
      .eq('tree_id', currentTree.id);

    if (error) {
      console.error(error);
      treeContainer.innerHTML = '<li>Ошибка загрузки данных</li>';
      return;
    }

    treeContainer.innerHTML = '';
    const rootPeople = people.filter(p => p.parent_id === null);

    if (rootPeople.length > 0) {
      rootPeople.forEach(rootPerson => {
        treeContainer.appendChild(createPersonElement(rootPerson, people));
      });
    } else {
      treeContainer.innerHTML = '<li>В этом роду пока нет записей. Авторизуйтесь через почту, чтобы добавить основателя.</li>';
    }
  }

  function createPersonElement(person, allPeople) {
    const li = document.createElement('li');
    const isRoot = person.parent_id === null;
    const children = allPeople.filter(p => p.parent_id === person.id);
    const hasChildren = children.length > 0;

    let actionButtonsHTML = '';
    // Кнопки управления выводим ТОЛЬКО ЕСЛИ ПОЛЬЗОВАТЕЛЬ ВОШЁЛ КАК РЕДАКТОР ПО ПОЧТЕ
    if (currentEditorUser) {
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

  // 5. РАЗВОРАЧИВАНИЕ / СВОРАЧИВАНИЕ
  document.addEventListener('click', function (event) {
    const card = event.target.closest('.person-card');
    if (!card || event.target.closest('.action-btns')) return;

    const li = card.closest('li');
    const directChildrenUl = li.querySelector(':scope > ul.children');
    const toggleIcon = card.querySelector('.toggle-icon');

    if (directChildrenUl) {
      const isCurrentlyCollapsed = directChildrenUl.classList.contains('collapsed');

      if (isCurrentlyCollapsed) {
        directChildrenUl.classList.remove('collapsed');
        if (toggleIcon) toggleIcon.textContent = '[−]';
      } else {
        const allSubLists = li.querySelectorAll('ul.children');
        allSubLists.forEach(subUl => subUl.classList.add('collapsed'));

        const allToggleIcons = li.querySelectorAll('.toggle-icon');
        allToggleIcons.forEach(icon => icon.textContent = '[+]');
      }
    }

    focusOnElement(card);
  });

  function focusOnElement(element) {
    const rect = element.getBoundingClientRect();
    const viewportRect = viewport.getBoundingClientRect();

    const elementCenterX = rect.left + rect.width / 2;
    const elementCenterY = rect.top + rect.height / 2;

    const viewportCenterX = viewportRect.left + viewportRect.width / 2;
    const viewportCenterY = viewportRect.top + viewportRect.height / 2;

    pointX += viewportCenterX - elementCenterX;
    pointY += viewportCenterY - elementCenterY;
    updateTransform();
  }

  // 6. ОПЕРАЦИИ С БАЗОЙ (ДОБАВЛЕНИЕ / ИЗМЕНЕНИЕ / УДАЛЕНИЕ)
  document.addEventListener('click', async function (event) {
    if (event.target.classList.contains('delete-card-btn')) {
      const id = event.target.closest('.person-card').getAttribute('data-id');

      if (confirm(i18n[currentLang].delete_confirm)) {
        const { error } = await supabaseClient.from('people').delete().eq('id', id);
        if (error) alert('Ошибка удаления: ' + error.message);
        else loadTree();
      }
    }
  });

  // Добавление основателя
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

      if (!name || !currentTree) return;

      const { error } = await supabaseClient
        .from('people')
        .insert([{ name, parent_id: null, tree_id: currentTree.id, birth_year, death_year }]);

      if (error) alert('Ошибка создания: ' + error.message);
      else {
        closeRootModal();
        loadTree();
      }
    });
  }

  // Редактирование
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

  // Добавление потомка
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

      if (!name || !currentParentId || !currentTree) return;

      const { error } = await supabaseClient
        .from('people')
        .insert([{ name, parent_id: parseInt(currentParentId), tree_id: currentTree.id, birth_year, death_year }]);

      if (error) alert('Ошибка сохранения: ' + error.message);
      else {
        closeModal();
        loadTree();
      }
    });
  }

  // 7. МАСШТАБИРОВАНИЕ
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
  }

  if (zoomInBtn) zoomInBtn.addEventListener('click', () => { scale = Math.min(scale * 1.2, 3); updateTransform(); });
  if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => { scale = Math.max(scale / 1.2, 0.3); updateTransform(); });
  if (zoomResetBtn) zoomResetBtn.addEventListener('click', () => { scale = 1; pointX = 0; pointY = 0; updateTransform(); });

  // Загружаем род из памяти при открытии страницы, если он был выбран
  const savedTree = localStorage.getItem('shezhire_tree');
  if (savedTree) {
    currentTree = JSON.parse(savedTree);
    enterTreeUI();
  }
});