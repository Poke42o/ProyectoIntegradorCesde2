// ============ DATOS INICIALES (Fallback si no hay admin) ============
const datosIniciales = [
    { id: 1, nombre: "Cachalote", stock: 50, precio: 25000, estado: "Activo", imagen: "flowerOne.jpg", descripcion: "Variedad con predominancia sativa experta para espacios de exterior y facil cuidado." },
    { id: 2, nombre: "Early Skunk", stock: 35, precio: 25000, estado: "Activo", imagen: "flowerTwo.jpg", descripcion: "Genética estable de primera generación. Ideales para proyectos de crianza o selección." },
    { id: 3, nombre: "White Widow", stock: 8, precio: 25000, estado: "Poco Stock", imagen: "flowerThree.jpg", descripcion: "Genética estable de primera generación. Ideales para proyectos de crianza o selección." },
    { id: 4, nombre: "OG Kush", stock: 0, precio: 25000, estado: "Inactivo", imagen: "flowerFour.jpg", descripcion: "Genética estable de primera generación. Ideales para proyectos de crianza o selección." },
    { id: 5, nombre: "Blue Dream", stock: 42, precio: 25000, estado: "Activo", imagen: "flowerFive.jpg", descripcion: "Genética estable de primera generación. Ideales para proyectos de crianza o selección." },
    { id: 6, nombre: "Girl Scout Cookies", stock: 12, precio: 25000, estado: "Poco Stock", imagen: "flowerSix.jpg", descripcion: "Genética estable de primera generación. Ideales para proyectos de crianza o selección." }
];

// ============ UTILIDADES DE STORAGE ============
const StorageManager = {
    getInventario: () => {
        let inventario = JSON.parse(localStorage.getItem('miInventario')) || [];
        // Si no hay inventario, cargar datos iniciales automáticamente
        if (inventario.length === 0) {
            inventario = datosIniciales;
            localStorage.setItem('miInventario', JSON.stringify(inventario));
        }
        return inventario;
    },
    setInventario: (data) => localStorage.setItem('miInventario', JSON.stringify(data))
};

// ============ CARGAR PRODUCTOS DINÁMICAMENTE ============
function cargarProductosDinamicos() {
    const contenedor = document.getElementById('productosDinamicos');
    if (!contenedor) return;
    
    // Obtener productos del localStorage (con fallback automático)
    let productos = StorageManager.getInventario();
    
    // Si aún no hay productos, mostrar mensaje
    if (productos.length === 0) {
        contenedor.innerHTML = '<p class="text-muted">No hay productos disponibles en este momento</p>';
        return;
    }
    
    // Generar HTML para cada producto
    contenedor.innerHTML = productos.map(prod => {
        // Si la imagen es Base64, usarla; si no, usar ruta de archivo
        const imgSrc = prod.imagen && prod.imagen.startsWith('data:') 
            ? prod.imagen 
            : `/Imagenes/${prod.imagen || 'placeholder.jpg'}`;
        
        return `
            <div class="item">
                <p>${prod.nombre}</p>
                <img src="${imgSrc}" alt="${prod.nombre}" style="width: 100%; height: 250px; object-fit: cover;">
                <div class="product-controls">
                    <select class="form-control qty-select custom-input">
                        <option value="1">1 semilla - $${Number(prod.precio).toLocaleString()} COP</option>
                        <option value="3">3 semillas - $${(Number(prod.precio) * 2.8).toLocaleString()} COP</option>
                        <option value="5">5 semillas - $${(Number(prod.precio) * 4.4).toLocaleString()} COP</option>
                        <option value="10">10 semillas - $${(Number(prod.precio) * 8).toLocaleString()} COP</option>
                        <option value="25">25 semillas - $${(Number(prod.precio) * 18).toLocaleString()} COP</option>
                        <option value="100">100 semillas - $${(Number(prod.precio) * 64).toLocaleString()} COP</option>
                    </select>
                    <button type="button" class="btn custom-btn add-to-cart" data-product-id="${prod.id}" data-product-name="${prod.nombre}" data-product-price="${prod.precio}">
                        Agregar al carrito
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    // Re-asignar event listeners a los botones "Agregar al carrito"
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', agregarAlCarritoDinamico);
    });
}

// Función para agregar al carrito desde productos dinámicos
function agregarAlCarritoDinamico(e) {
    // Obtener email del usuario desde sessionStorage
    const emailUsuario = sessionStorage.getItem('emailUsuarioActual');
    
    if (!emailUsuario) {
        alert('Debes iniciar sesión para agregar productos al carrito');
        return;
    }

    const btn = e.target;
    const cantidad = parseInt(btn.previousElementSibling.value);
    const productId = btn.getAttribute('data-product-id');
    const productName = btn.getAttribute('data-product-name');
    const productPrice = Number(btn.getAttribute('data-product-price'));

    const cartKey = `magia_cart_${emailUsuario}`;
    let carrito = JSON.parse(localStorage.getItem(cartKey)) || [];

    const itemExistente = carrito.find(item => item.id === productId && item.cantidad === cantidad);
    if (itemExistente) {
        itemExistente.unidades += 1;
    } else {
        carrito.push({
            id: productId,
            nombre: productName,
            precio: productPrice,
            cantidad: cantidad,
            unidades: 1
        });
    }

    localStorage.setItem(cartKey, JSON.stringify(carrito));
    
    // Actualizar contador del carrito
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        const totalItems = carrito.reduce((sum, item) => sum + item.unidades, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = 'block';
    }

    alert(`${productName} agregado al carrito`);
}

// ============ FUNCIONES GLOBALES ============

// Alternar visibilidad de contraseña
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

// Actualizar navbar según sesión
function actualizarNavbar() {
    const authLinks = document.getElementById('auth-links');
    const userLinks = document.getElementById('user-links');
    const userNameDisplay = document.getElementById('userNameDisplay');
    const sesion = sessionStorage.getItem('sesionActiva');
   

    if (sesion) {
        
        if (authLinks) authLinks.classList.add('d-none');
        if (userLinks) userLinks.classList.remove('d-none');

        if (sesion === 'admin') {
            userNameDisplay.textContent = "Admin Magia";
        } else{
            const nombre = sessionStorage.getItem('nombreUsuarioActual')
            userNameDisplay.textContent = `Hola, ${nombre || 'Usuario'}`;
        } 
        
    } else {
        // Si no hay sesión, mostramos botones de auth
      if (authLinks) authLinks.classList.remove('d-none');
        if (userLinks) userLinks.classList.add('d-none');
        if (userNameDisplay) userNameDisplay.textContent = "";
    }
}

// ============ INICIALIZACIÓN AL CARGAR EL DOCUMENTO ============
document.addEventListener('DOMContentLoaded', function() {
    // 1. Cargar productos dinámicos (automáticamente se cargan datos iniciales si no existen)
    cargarProductosDinamicos();
    console.log('✅ Productos dinámicos cargados. Inventario:', StorageManager.getInventario());
    
    // 2. Manejar formulario de registro
    const registerForm = document.querySelector('#registerModal form');
    
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();

        const nombre = registerForm.querySelectorAll('input')[0].value;
        const email = registerForm.querySelector('input[type="email"]').value.trim().toLowerCase();

        const password = registerForm.querySelectorAll('input[type="password"]')[0].value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const telefono = document.getElementById('phone')?.value || '';

        if(password !== confirmPassword){
            alert('Las contraseñas no coinciden');
            return;
        }

        const usuariosGuardados = JSON.parse(localStorage.getItem('usuarios')) || [];
        const existe = usuariosGuardados.find(u => u.email.toLowerCase() === email);


        if (existe) {
            alert('Este correo ya está registrado. Intenta iniciar sesión.');
            return;
        }

        const userData = {
        nombre: nombre,
        email: email, 
        password: password
        };


        usuariosGuardados.push(userData);
        localStorage.setItem('usuarios', JSON.stringify(usuariosGuardados));

        // --- NUEVO: Guardar en 'usuariosRegistrados' para admin ---
        const clientesGuardados = JSON.parse(localStorage.getItem('usuariosRegistrados')) || [];
        const maxId = clientesGuardados.length > 0 ? Math.max(...clientesGuardados.map(c => c.id)) : 0;
        
        const clienteData = {
            id: maxId + 1,
            nombre: nombre,
            email: email,
            telefono: telefono,
            fechaRegistro: new Date().toISOString().split('T')[0]
        };

        clientesGuardados.push(clienteData);
        localStorage.setItem('usuariosRegistrados', JSON.stringify(clientesGuardados));

        alert('¡Cuenta creada con éxito! Ahora puedes iniciar sesión.');

        const modal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
        modal.hide();
        registerForm.reset();
        });
    }

    // 3. Manejar formulario de login
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

       const listaUsuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
       const usuarioEncontrado = listaUsuarios.find(u => u.email === emailLogin && u.password === passLogin);
       

            if (usuarioEncontrado) {
             
                    alert(`¡Bienvenido de nuevo, ${usuarioEncontrado.nombre}!`);
                    sessionStorage.setItem('sesionActiva', 'usuario');
                    sessionStorage.setItem('nombreUsuarioActual', usuarioEncontrado.nombre)
                    
                    sessionStorage.setItem('emailUsuarioActual', usuarioEncontrado.email);

                    // Redirige al usuario normal al index.html
                    window.location.href = 'index.html'; 
                } else {
                    alert('Correo o contraseña incorrectos.');
                }
            
        });
    }
    
    // 4. Actualizar navbar
    actualizarNavbar();

    // 5. Manejar botón de logout
    const btnLogoutMain = document.getElementById('btnLogoutMain');
    if (btnLogoutMain) {
        btnLogoutMain.addEventListener('click', (e) => {
            e.preventDefault();

            if (confirm("¿Seguro que quieres cerrar sesión?")) {
                sessionStorage.clear()
                window.location.href ='index.html'
            }
        });
    }

    // 6. CARRITO: cantidad, agregar y renderizar en modal

function getCartKey() {
    const email = sessionStorage.getItem('emailUsuarioActual');
    
    return email ? `magia_cart_${email}` : 'magia_cart_invitado';
}

    function getCart() {
        const key = getCartKey();
        return JSON.parse(localStorage.getItem(key) || '[]');
    }

    function saveCart(cart) {
        const key = getCartKey();
        localStorage.setItem(key, JSON.stringify(cart));
    }

    function updateBadge() {
        const cart = getCart();
        const total = cart.reduce((s, it) => s + Number(it.qty), 0);
        const badge = document.querySelector('.cart-count');
        if (!badge) return;
        if (total > 0) { badge.style.display = 'inline-block'; badge.textContent = total; }
        else { badge.style.display = 'none'; }
    }

   function renderCart() {
        const container = document.getElementById('cartItems');
        if (!container) return;
        const cart = getCart();
        container.innerHTML = '';

        if (cart.length === 0) {
            container.innerHTML = '<div class="text-muted text-center py-3">No hay productos en el carrito.</div>';
            return;
        }

        cart.forEach(item => {
            const div = document.createElement('div');
            div.className = 'list-group-item d-flex justify-content-between align-items-center cart-item py-3';
            div.innerHTML = `
                <div class="d-flex align-items-center" style="gap:1rem">
                    <img src="${item.img || ''}" alt="" style="width:60px;height:60px;object-fit:cover;border-radius:8px;display:${item.img ? 'block' : 'none'}">
                    <div>
                        <strong class="d-block">${item.title}</strong>
                        <div class="d-flex align-items-center mt-2" style="gap: 0.5rem;">
                            <button class="btn btn-sm btn-outline-light text-dark change-qty" data-id="${item.id}" data-action="decrease" style="width:30px; height:30px; padding:0; line-height:1;">-</button>
                            
                            <span class="fw-bold mx-2" style="min-width: 20px; text-align: center;">${item.qty}</span>
                            
                            <button class="btn btn-sm btn-outline-light text-dark change-qty" data-id="${item.id}" data-action="increase" style="width:30px; height:30px; padding:0; line-height:1;">+</button>
                        </div>
                    </div>
                </div>
                <div class="text-end">
                    <button class="btn btn-sm btn-link text-danger remove-item p-0" data-id="${item.id}" title="Eliminar">
                        <i class="bi bi-trash3-fill" style="font-size: 1.2rem;"></i>
                    </button>
                </div>`;
            container.appendChild(div);
        });

        // --- Eventos para cambiar cantidad ---
        container.querySelectorAll('.change-qty').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.dataset.id;
                const action = this.dataset.action;
                let cart = getCart();
                const item = cart.find(i => i.id === id);

                if (item) {
                    if (action === 'increase') {
                        item.qty += 1;
                    } else if (action === 'decrease' && item.qty > 1) {
                        item.qty -= 1;
                    }
                    saveCart(cart);
                    renderCart();
                    updateBadge();
                }
            });
        });

        // --- Evento para eliminar ---
        container.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', function () {
                const id = this.dataset.id;
                let cart = getCart();
                cart = cart.filter(i => i.id !== id);
                saveCart(cart);
                renderCart();
                updateBadge();
            });
        });
    }

    // Handle add-to-cart with select option
    document.addEventListener('click', function (e) {
        const addBtn = e.target.closest('.add-to-cart');
        if (addBtn) {
            const card = addBtn.closest('.cardInf') || addBtn.closest('.item') || addBtn.closest('.product-card');
            let title = 'Producto';
            if (card) {
                const h3 = card.querySelector('h3');
                const p = card.querySelector('p');
                const t = card.querySelector('.item p');
                title = (h3 && h3.innerText) || (p && p.innerText) || (t && t.innerText) || title;
            }
            const qtySelect = card ? card.querySelector('.qty-select') : null;
            const qty = qtySelect ? Math.max(1, parseInt(qtySelect.value)||1) : 1;
            const imgEl = card ? card.querySelector('img') : null;
            const img = imgEl ? imgEl.src : '';

            // Build item object
            const itemObj = {
                id: Date.now().toString() + Math.floor(Math.random()*1000),
                title: title.trim(),
                qty: Number(qty),
                img: img
            };

            // Merge if same title exists
            const cart = getCart();
            const existing = cart.find(i => i.title === itemObj.title && i.img === itemObj.img);
            if (existing) {
                existing.qty = Number(existing.qty) + Number(itemObj.qty);
            } else {
                cart.push(itemObj);
            }
            saveCart(cart);
            renderCart();
            updateBadge();

            // show modal
            const cartModalEl = document.getElementById('cartModal');
            if (cartModalEl) {
                const cartModal = new bootstrap.Modal(cartModalEl);
                cartModal.show();
            }
            return;
        }
    });

    // Initialize
    renderCart();
    updateBadge();
});