const SUPABASE_URL = 'https://enlphelzeokcozwyropm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVubHBoZWx6ZW9rY296d3lyb3BtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMTgzMzAsImV4cCI6MjEwMjg5NDMzMH0.q7RUP8mp1xs3_TrwQ11riBtiq3JDuW0GywesomXKf0Q';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', async function () {
  // Элементы формы добавления потомка
  const modalOverlay = document.getElementById('modal-overlay');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  const addChildForm = document.getElementById('add-child-form');
  const parentNameInput = document.getElementById('parent-name-input');
  const childNameInput = document.getElementById('child-name-input');

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
  let currentUser = null;
  let isSignUpMode = false; // По умолчанию режим "Вход"

  // 1. ПРОВЕРКА СЕССИИ ПОЛЬЗОВАТЕЛЯ
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
    } else {
      guestView.classList.remove('hidden');
      userView.classList.add('hidden');
      userEmailDisplay.textContent = '';
    }
    loadTree(); // Перезагружаем древо, чтобы показать/скрыть кнопки "+"
  }

  // Отслеживание изменений статуса авторизации (вход / выход)
  supabaseClient.auth.onAuthStateChange((_event, session) => {
    currentUser = session ? session.user : null;
    updateAuthUI();
  });

  // 2. ЗАГРУЗКА И ОТОБРАЖЕНИЕ ДРЕВА
  async function loadTree() {
    const treeContainer = document.querySelector('.tree > ul');
    treeContainer.innerHTML = '<li>Загрузка шежире...</li>';

    const { data: people, error } = await supabaseClient.from('people').select('*');

    if (error) {
      console.error('Ошибка загрузки:', error);
      treeContainer.innerHTML = '<li>Ошибка загрузки данных</li>';
      return;
    }

    treeContainer.innerHTML = '';
    const rootPerson = people.find(p => p.parent_id === null);

    if (rootPerson) {
      const rootElement = createPersonElement(rootPerson, people);
      treeContainer.appendChild(rootElement);
    } else {
      treeContainer.innerHTML = '<li>Основатель не найден</li>';
    }
  }

  function createPersonElement(person, allPeople) {
    const li = document.createElement('li');
    const isRoot = person.parent_id === null;

    // Показываем кнопку "+" только для авторизованных пользователей
    const addButtonHTML = currentUser 
      ? `<button class="add-child-btn" title="Добавить ребенка">+</button>` 
      : '';

    li.innerHTML = `
      <div class="person-card ${isRoot ? 'root-person' : ''}" data-id="${person.id}">
        <span class="name">${person.name}</span>
        ${addButtonHTML}
      </div>
    `;

    const children = allPeople.filter(p => p.parent_id === person.id);
    if (children.length > 0) {
      const childrenUl = document.createElement('ul');
      childrenUl.className = 'children';
      children.forEach(child => {
        childrenUl.appendChild(createPersonElement(child, allPeople));
      });
      li.appendChild(childrenUl);
    }

    return li;
  }

  // 3. УПРАВЛЕНИЕ ОКНОМ АВТОРИЗАЦИИ
  openAuthModalBtn.addEventListener('click', () => authModalOverlay.classList.remove('hidden'));
  closeAuthModalBtn.addEventListener('click', () => authModalOverlay.classList.add('hidden'));

  toggleAuthModeBtn.addEventListener('click', () => {
    isSignUpMode = !isSignUpMode;
    if (isSignUpMode) {
      authTitle.textContent = 'Регистрация';
      authSubmitBtn.textContent = 'Зарегистрироваться';
      toggleAuthModeBtn.textContent = 'Уже есть аккаунт? Войти';
    } else {
      authTitle.textContent = 'Вход в систему';
      authSubmitBtn.textContent = 'Войти';
      toggleAuthModeBtn.textContent = 'Нет аккаунта? Зарегистрироваться';
    }
  });

  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = authEmailInput.value.trim();
    const password = authPasswordInput.value.trim();

    if (isSignUpMode) {
      const { error } = await supabaseClient.auth.signUp({ email, password });
      if (error) alert('Ошибка регистрации: ' + error.message);
      else {
        alert('Успешная регистрация! Теперь вы можете войти.');
        authModalOverlay.classList.add('hidden');
      }
    } else {
      const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) alert('Ошибка входа: ' + error.message);
      else authModalOverlay.classList.add('hidden');
    }
  });

  logoutBtn.addEventListener('click', () => supabaseClient.auth.signOut());

  // 4. УПРАВЛЕНИЕ ОКНОМ ДОБАВЛЕНИЯ ПОТОМКА
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
    currentParentId = null;
  }

  closeModalBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);

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

  // Запуск
  await checkUserSession();
});