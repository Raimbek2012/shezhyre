const SUPABASE_URL = 'https://enlphelzeokcozwyropm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVubHBoZWx6ZW9rY296d3lyb3BtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMTgzMzAsImV4cCI6MjEwMjg5NDMzMH0.q7RUP8mp1xs3_TrwQ11riBtiq3JDuW0GywesomXKf0Q';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', async function () {
  // Элементы модалки добавления потомка
  const modalOverlay = document.getElementById('modal-overlay');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  const addChildForm = document.getElementById('add-child-form');
  const parentNameInput = document.getElementById('parent-name-input');
  const childNameInput = document.getElementById('child-name-input');

  // Элементы модалки добавления основателя
  const addRootBtn = document.getElementById('add-root-btn');
  const rootModalOverlay = document.getElementById('root-modal-overlay');
  const closeRootModalBtn = document.getElementById('close-root-modal-btn');
  const cancelRootBtn = document.getElementById('cancel-root-btn');
  const addRootForm = document.getElementById('add-root-form');
  const rootNameInput = document.getElementById('root-name-input');

  // Элементы модалки редактирования имени
  const editModalOverlay = document.getElementById('edit-modal-overlay');
  const closeEditModalBtn = document.getElementById('close-edit-modal-btn');
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  const editPersonForm = document.getElementById('edit-person-form');
  const editNameInput = document.getElementById('edit-name-input');

  // Элементы авторизации
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
  let currentUser = null;
  let isSignUpMode = false;

  // 1. ПРОВЕРКА СЕССИИ И ПОЛЬЗОВАТЕЛЯ
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
      if (addRootBtn) addRootBtn.classList.remove('hidden');
    } else {
      guestView.classList.remove('hidden');
      userView.classList.add('hidden');
      userEmailDisplay.textContent = '';
      if (addRootBtn) addRootBtn.classList.add('hidden');
    }
    loadTree();
  }

  supabaseClient.auth.onAuthStateChange((_event, session) => {
    currentUser = session ? session.user : null;
    updateAuthUI();
  });

  // 2. ЗАГРУЗКА И ПОСТРОЕНИЕ ДРЕВА
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
      treeContainer.innerHTML = '<li>Нет основателей. Нажмите "+" внизу экрана, чтобы создать первого.</li>';
    }
  }

  function createPersonElement(person, allPeople) {
    const li = document.createElement('li');
    const isRoot = person.parent_id === null;
    const children = allPeople.filter(p => p.parent_id === person.id);
    const hasChildren = children.length > 0;

    const actionButtonsHTML = currentUser 
      ? `
        <button class="edit-btn" title="Изменить имя">✏️</button>
        <button class="add-child-btn" title="Добавить ребенка">+</button>
        ` 
      : '';

    const toggleIndicatorHTML = hasChildren ? `<span class="toggle-icon">[−]</span>` : '';

    li.innerHTML = `
      <div class="person-card ${isRoot ? 'root-person' : ''}" data-id="${person.id}">
        <span class="name">${person.name}</span>
        ${toggleIndicatorHTML}
        ${actionButtonsHTML}
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

  // СВОРАЧИВАНИЕ / РАЗВОРАЧИВАНИЕ ВЕТЕК ПРИ КЛИКЕ
  document.addEventListener('click', function (event) {
    const card = event.target.closest('.person-card');
    // Если кликнули по кнопкам действия — сворачивание не срабатывает
    if (!card || event.target.classList.contains('edit-btn') || event.target.classList.contains('add-child-btn')) {
      return;
    }

    const li = card.closest('li');
    const childrenUl = li.querySelector(':scope > ul.children');
    const toggleIcon = card.querySelector('.toggle-icon');

    if (childrenUl) {
      childrenUl.classList.toggle('hidden');
      if (toggleIcon) {
        toggleIcon.textContent = childrenUl.classList.contains('hidden') ? '[+]' : '[−]';
      }
    }
  });

  // 3. ДОБАВЛЕНИЕ НОВОГО ОСНОВАТЕЛЯ РОДА
  if (addRootBtn) {
    addRootBtn.addEventListener('click', () => rootModalOverlay.classList.remove('hidden'));
  }
  
  function closeRootModal() {
    if (rootModalOverlay) rootModalOverlay.classList.add('hidden');
    if (rootNameInput) rootNameInput.value = '';
  }

  if (closeRootModalBtn) closeRootModalBtn.addEventListener('click', closeRootModal);
  if (cancelRootBtn) cancelRootBtn.addEventListener('click', closeRootModal);

  if (addRootForm) {
    addRootForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = rootNameInput.value.trim();
      if (!name) return;

      const { error } = await supabaseClient
        .from('people')
        .insert([{ name: name, parent_id: null }]);

      if (error) alert('Ошибка создания: ' + error.message);
      else {
        closeRootModal();
        loadTree();
      }
    });
  }

  // 4. РЕДАКТИРОВАНИЕ ИМЕНИ
  document.addEventListener('click', function (event) {
    if (event.target.classList.contains('edit-btn')) {
      const parentCard = event.target.closest('.person-card');
      if (parentCard) {
        currentEditPersonId = parentCard.getAttribute('data-id');
        editNameInput.value = parentCard.querySelector('.name').textContent;
        editModalOverlay.classList.remove('hidden');
      }
    }
  });

  function closeEditModal() {
    if (editModalOverlay) editModalOverlay.classList.add('hidden');
    if (editNameInput) editNameInput.value = '';
    currentEditPersonId = null;
  }

  if (closeEditModalBtn) closeEditModalBtn.addEventListener('click', closeEditModal);
  if (cancelEditBtn) cancelEditBtn.addEventListener('click', closeEditModal);

  if (editPersonForm) {
    editPersonForm.addEventListener('submit', async function (event) {
      event.preventDefault();
      const newName = editNameInput.value.trim();
      if (!newName || !currentEditPersonId) return;

      const { error } = await supabaseClient
        .from('people')
        .update({ name: newName })
        .eq('id', currentEditPersonId);

      if (error) alert('Ошибка обновления: ' + error.message);
      else {
        closeEditModal();
        loadTree();
      }
    });
  }

  // 5. ДОБАВЛЕНИЕ ПОТОМКА
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
    if (modalOverlay) modalOverlay.classList.add('hidden');
    if (childNameInput) childNameInput.value = '';
    currentParentId = null;
  }

  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  if (addChildForm) {
    addChildForm.addEventListener('submit', async function (event) {
      event.preventDefault();
      const newChildName = childNameInput.value.trim();
      if (!newChildName || !currentParentId) return;

      const { error } = await supabaseClient
        .from('people')
        .insert([{ name: newChildName, parent_id: parseInt(currentParentId) }]);

      if (error) alert('Ошибка сохранения: ' + error.message);
      else {
        closeModal();
        loadTree();
      }
    });
  }

  // 6. АВТОРИЗАЦИЯ
  if (openAuthModalBtn) openAuthModalBtn.addEventListener('click', () => authModalOverlay.classList.remove('hidden'));
  if (closeAuthModalBtn) closeAuthModalBtn.addEventListener('click', () => authModalOverlay.classList.add('hidden'));

  if (toggleAuthModeBtn) {
    toggleAuthModeBtn.addEventListener('click', () => {
      isSignUpMode = !isSignUpMode;
      authTitle.textContent = isSignUpMode ? 'Регистрация' : 'Вход в систему';
      authSubmitBtn.textContent = isSignUpMode ? 'Зарегистрироваться' : 'Войти';
      toggleAuthModeBtn.textContent = isSignUpMode ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться';
    });
  }

  if (authForm) {
    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = authEmailInput.value.trim();
      const password = authPasswordInput.value.trim();

      if (isSignUpMode) {
        const { error } = await supabaseClient.auth.signUp({ email, password });
        if (error) alert('Ошибка регистрации: ' + error.message);
        else {
          alert('Успешная регистрация!');
          authModalOverlay.classList.add('hidden');
        }
      } else {
        const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) alert('Ошибка входа: ' + error.message);
        else authModalOverlay.classList.add('hidden');
      }
    });
  }

  if (logoutBtn) logoutBtn.addEventListener('click', () => supabaseClient.auth.signOut());

  // ==========================================
  // 7. МАСШТАБИРОВАНИЕ И ПЕРЕТАСКИВАНИЕ (ПК + ТЕЛЕФОНЫ)
  // ==========================================
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
    // ---- МЫШЬ (ПК) ----
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

    // ---- СЕНСОРНЫЙ ЭКРАН (ТЕЛЕФОНЫ И ТАБЛЕТЫ) ----
    viewport.addEventListener('touchstart', (e) => {
      if (e.target.closest('.person-card') || e.target.closest('#zoom-controls')) return;

      if (e.touches.length === 1) {
        // Перетаскивание одним пальцем
        isDragging = true;
        startX = e.touches[0].clientX - pointX;
        startY = e.touches[0].clientY - pointY;
      } else if (e.touches.length === 2) {
        // Зум двумя пальцами (Pinch)
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

  // Кнопки масштаба
  if (zoomInBtn) zoomInBtn.addEventListener('click', () => { scale = Math.min(scale * 1.2, 3); updateTransform(); });
  if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => { scale = Math.max(scale / 1.2, 0.3); updateTransform(); });
  if (zoomResetBtn) zoomResetBtn.addEventListener('click', () => { scale = 1; pointX = 0; pointY = 0; updateTransform(); });

  await checkUserSession();
});