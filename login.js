const API_BASE_URL = 'http://localhost:3000';

const auth = window.auth || {
  getCurrentUser: () => null,
  saveCurrentUser: () => {},
  isAdmin: () => false
};

document.addEventListener('DOMContentLoaded', () => {
  setupForm();
  setupValidation();
  preloadUser();
});

function setupForm() {
  const form = document.getElementById('login-form');
  if (form) {
    form.addEventListener('submit', handleLogin);
  }
}

function setupValidation() {
  ['login-email', 'login-password'].forEach((id) => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('input', () => {
        setGeneralError('');
        validateField(id);
      });
      input.addEventListener('blur', () => {
        setGeneralError('');
        validateField(id);
      });
    }
  });
  checkFormValidity();
}

function preloadUser() {
  const user = auth.getCurrentUser ? auth.getCurrentUser() : null;
  if (user?.email) {
    const emailInput = document.getElementById('login-email');
    if (emailInput) {
      emailInput.value = user.email;
    }
  }
}

function showFieldError(fieldId, message) {
  const errorElement = document.getElementById(`${fieldId}-error`);
  if (errorElement) {
    errorElement.textContent = message;
  }
}

function setGeneralError(message) {
  const general = document.getElementById('login-general-error');
  if (general) {
    general.textContent = message || '';
  }
}

function validateField(fieldId, options = {}) {
  const silent = options.silent === true;
  let isValid = true;
  let message = '';
  const value = (document.getElementById(fieldId)?.value || '').trim();

  if (fieldId === 'login-email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) {
      isValid = false;
      message = 'Укажите email, использованный при регистрации';
    } else if (!emailRegex.test(value)) {
      isValid = false;
      message = 'Некорректный формат email';
    }
  }

  if (fieldId === 'login-password') {
    if (!value) {
      isValid = false;
      message = 'Введите пароль';
    } else if (value.length < 8) {
      isValid = false;
      message = 'Пароль не короче 8 символов';
    }
  }

  showFieldError(fieldId, message);
  if (!silent) {
    updateSubmitState();
  }
  return isValid;
}

function updateSubmitState() {
  const emailOk = validateField('login-email', { silent: true });
  const passOk = validateField('login-password', { silent: true });
  const btn = document.getElementById('login-btn');
  if (btn) {
    btn.disabled = !(emailOk && passOk);
  }
  return emailOk && passOk;
}

function checkFormValidity() {
  return updateSubmitState();
}

async function handleLogin(event) {
  event.preventDefault();
  setGeneralError('');

  if (!checkFormValidity()) {
    return;
  }

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value.trim();

  try {
    const response = await fetch(`${API_BASE_URL}/users?email=${encodeURIComponent(email)}`);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const users = await response.json();
    const user = users.find((u) => u.password === password);

    if (!user) {
      showFieldError('login-password', 'Неверный email или пароль');
      return;
    }

    if (auth.saveCurrentUser) {
      auth.saveCurrentUser(user);
    }

    const redirectTarget = auth.isAdmin && auth.isAdmin(user) ? 'admin.html' : 'catalog.html';
    window.location.href = redirectTarget;
  } catch (error) {
    console.error('Login error:', error);
    setGeneralError('Не удалось выполнить вход. Проверьте соединение с JSON Server.');
  }
}
