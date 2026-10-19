/* Login page logic */

(function () {
  App.initTheme();

  // If already logged in, go to dashboard
  if (App.getUser()) {
    window.location.href = 'dashboard.html';
    return;
  }

  const form = document.getElementById('loginForm');
  const alertBox = document.getElementById('loginAlert');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const school = document.getElementById('school').value.trim();
    const scienceClass = document.getElementById('scienceClass').value;

    if (!name || !school) {
      showAlert('Please fill in all fields.', 'error');
      return;
    }

    if (name.length < 2) {
      showAlert('Name must be at least 2 characters.', 'error');
      return;
    }

    const user = {
      name: name,
      school: school,
      className: scienceClass,
      department: 'Science',
      loginTime: new Date().toISOString()
    };

    App.setUser(user);
    showAlert('Login successful! Redirecting...', 'success');
    setTimeout(() => { window.location.href = 'dashboard.html'; }, 800);
  });

  function showAlert(msg, type) {
    alertBox.textContent = msg;
    alertBox.className = 'alert show alert-' + type;
  }
})();
