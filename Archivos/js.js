
const registerForm = document.querySelector('#registerModal form');

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


const loginForm = document.querySelector('#loginModal form');

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const emailLogin = loginForm.querySelector('input[type="email"]').value;
    const passLogin = loginForm.querySelector('input[type="password"]').value;

    
    const datosGuardados = localStorage.getItem('usuarioRegistrado');

    if (datosGuardados) {
      
        const usuario = JSON.parse(datosGuardados);

        
        if (emailLogin === usuario.email && passLogin === usuario.password) {
            alert(`¡Bienvenido de nuevo, ${usuario.nombre}!`);
            
            
            sessionStorage.setItem('sesionActiva', 'true');
            
           
            window.location.href = 'dashboard.html';
        } else {
            alert('Correo o contraseña incorrectos.');
        }
    } else {
        alert('No hay ninguna cuenta registrada con estos datos.');
    }
});