const modalOverlay = document.getElementById('modalOverlay');
const openLoginBtn = document.getElementById('openLogin');
const openRegisterBtn = document.getElementById('openRegister');
const closeModalBtn = document.getElementById('closeModal');

const loginFormContainer = document.getElementById('loginFormContainer');
const registerFormContainer = document.getElementById('registerFormContainer');

const switchToRegister = document.getElementById('switchToRegister');
const switchToLogin = document.getElementById('switchToLogin');

const captchaText = document.getElementById('captchaText');
const refreshCaptcha = document.getElementById('refreshCaptcha');
const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');
const captchaInput = document.getElementById('captchaInput');

let currentCaptcha = '';

function generateCaptcha() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 4; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    currentCaptcha = result;
    captchaText.textContent = currentCaptcha;
}

function showLogin() {
    loginFormContainer.style.display = 'block';
    registerFormContainer.style.display = 'none';
    modalOverlay.classList.add('active');
}

function showRegister() {
    generateCaptcha();
    loginFormContainer.style.display = 'none';
    registerFormContainer.style.display = 'block';
    modalOverlay.classList.add('active');
}

function hideModal() {
    modalOverlay.classList.remove('active');
}

openLoginBtn.addEventListener('click', showLogin);
openRegisterBtn.addEventListener('click', showRegister);
closeModalBtn.addEventListener('click', hideModal);

switchToRegister.addEventListener('click', showRegister);
switchToLogin.addEventListener('click', showLogin);

refreshCaptcha.addEventListener('click', generateCaptcha);

modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        hideModal();
    }
});

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Zalogowano pomyślnie!');
    hideModal();
});

registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (captchaInput.value.trim().toUpperCase() !== currentCaptcha) {
        alert('Błędny kod CAPTCHA! Spróbuj ponownie.');
        generateCaptcha();
        captchaInput.value = '';
    } else {
        alert('Rejestracja udana!');
        hideModal();
    }
});