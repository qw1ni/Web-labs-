const CURRENT_USER_KEY = 'currentUser';
const ADMIN_ROLES = ['admin', 'administrator', 'администратор'];
const CUSTOMER_ROLES = ['customer', 'client', 'покупатель', 'клиент'];

function getCurrentUser() {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn('Unable to read stored user', error);
    return null;
  }
}

function saveCurrentUser(user) {
  try {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.warn('Unable to save user', error);
  }
}

function clearCurrentUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

function isAdmin(user) {
  const role = (user?.role || '').toLowerCase();
  return ADMIN_ROLES.some((r) => r.toLowerCase() === role);
}

function isCustomer(user) {
  const role = (user?.role || '').toLowerCase();
  return CUSTOMER_ROLES.some((r) => r.toLowerCase() === role);
}

window.auth = {
  getCurrentUser,
  saveCurrentUser,
  clearCurrentUser,
  isAdmin,
  isCustomer
};
