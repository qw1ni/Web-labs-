const auth = window.auth || {
  getCurrentUser: () => null,
  isAdmin: () => false
};

async function checkAdminAccess() {
  const adminBtn = document.getElementById('admin-access-btn');
  if (!adminBtn) return;

  const currentUser = auth.getCurrentUser();
  if (currentUser && auth.isAdmin(currentUser)) {
    adminBtn.style.display = 'block';
    adminBtn.addEventListener('click', () => {
      window.location.href = 'admin.html';
    });
  } else {
    adminBtn.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  checkAdminAccess();
});
