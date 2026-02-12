
const registerForm = document.querySelector('#registerModal form');

if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const nombre = registerForm.querySelectorAll('input')[0].value;
        const email = registerForm.querySelector('input[type="email"]').value;
        const password = registerForm.querySelectorAll('input[type="password"]')[0].value;

        const userData = {
            nombre: nombre,
            email: email,
            password: password
        };

        localStorage.setItem('usuarioRegistrado', JSON.stringify(userData));

        alert('¡Cuenta creada con éxito! Ahora puedes iniciar sesión.');

        const modal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
        modal.hide();
    });
}


const loginForm = document.querySelector('#loginModal form');

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const emailLogin = loginForm.querySelector('input[type="email"]').value;
        const passLogin = loginForm.querySelector('input[type="password"]').value;

      
        if (emailLogin === 'magiaepigea@gmail.com' && passLogin === 'Magia391634*') {
            alert("¡Hola! Redirigiendo al Panel de Control");
            sessionStorage.setItem('sesionActiva', 'admin')
            window.location.href = 'admin.html'; 
            return; 
        }  


       
        const datosGuardados = localStorage.getItem('usuarioRegistrado');

        if (datosGuardados) {
            const usuario = JSON.parse(datosGuardados);

            if (emailLogin === usuario.email && passLogin === usuario.password) {
                alert(`¡Bienvenido de nuevo, ${usuario.nombre}!`);
                sessionStorage.setItem('sesionActiva', 'usuario');
                
                // Redirige al usuario normal al index.html
                window.location.href = 'index.html'; 
            } else {
                alert('Correo o contraseña incorrectos.');
            }
        } else {
            alert('No hay ninguna cuenta registrada con estos datos.');
        }
    });
}

// ojo de la contraseña
function togglePassword(inputId, iconSpan) {
    const input = document.getElementById(inputId);
    const icon = iconSpan.querySelector("i");
  
    if (input.type === "password") {
      input.type = "text";
      icon.classList.remove("bi-eye");
      icon.classList.add("bi-eye-slash");
    } else {
      input.type = "password";
      icon.classList.remove("bi-eye-slash");
      icon.classList.add("bi-eye");
    }
}