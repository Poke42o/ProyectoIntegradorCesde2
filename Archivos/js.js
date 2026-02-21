
const registerForm = document.querySelector('#registerModal form');

if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const nombre = registerForm.querySelectorAll('input')[0].value;
        const email = registerForm.querySelector('input[type="email"]').value.trim().toLowerCase();

        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const telefono = document.getElementById('phone')?.value || '';

        if(password !== confirmPassword){
            alert('Las contraseñas no coinciden');
            return;
        }

        // --- MEJORA: Lógica de múltiples usuarios ---
        // Guardar en 'usuarios' para login
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


const loginForm = document.querySelector('#loginModal form');

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const emailLogin = loginForm.querySelector('input[type="email"]').value.trim().toLowerCase();
        const passLogin = document.getElementById('loginPassword').value;

      
        if (emailLogin === 'magiaepigea@gmail.com' && passLogin === 'Magia391634*') {
            alert("¡Hola! Redirigiendo al Panel de Control");
            sessionStorage.setItem('sesionActiva', 'admin')
            window.location.href = 'admin.html'; 
            return; 
        }  

       const listaUsuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
       const usuarioEncontrado = listaUsuarios.find(u => u.email.toLowerCase() === emailLogin && u.password === passLogin);

       

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
// --- Lógica de Estado de Sesión ---

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

// Botón de cerrar sesión en el index
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

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', actualizarNavbar);


// --- Carrito: cantidad, agregar y renderizar en modal ---
document.addEventListener('DOMContentLoaded', function () {
   

function getCartKey() {
    const email = sessionStorage.getItem('emailUsuarioActual');
    
    return email ? `magia_cart_${email}` : 'magia_cart_invitado';
}

// Renderizar productos en la página principal desde el inventario guardado por el admin
function renderProductsFromInventario() {
    const container = document.getElementById('productosContainer');
    if (!container) return;

    const inventario = JSON.parse(localStorage.getItem('miInventario') || 'null');
    if (!inventario || inventario.length === 0) return; // mantener items estáticos si no hay inventario

    let html = '';
    inventario.forEach(prod => {
        const precio = Number(prod.precio) || 0;
        const imgSrc = prod.img || '/Imagenes/flowerOne.jpg';
        const descripcion = prod.descripcion || '';
        html += `
            <div class="item" data-product-id="${prod.id}">
                <p>${prod.nombre}</p>
                <img src="${imgSrc}" alt="${prod.nombre}">
                <div class="product-desc" style="margin:0.5rem 0; color:#fff; font-size:0.9rem;">${descripcion}</div>
                <div class="product-controls">
                    <select class="form-control qty-select custom-input">
                        <option value="1">1 semilla - ${precio.toLocaleString()} COP</option>
                        <option value="3">3 semillas - ${Math.round(precio * 3).toLocaleString()} COP</option>
                        <option value="5">5 semillas - ${Math.round(precio * 5).toLocaleString()} COP</option>
                        <option value="10">10 semillas - ${Math.round(precio * 10).toLocaleString()} COP</option>
                        <option value="25">25 semillas - ${Math.round(precio * 25).toLocaleString()} COP</option>
                        <option value="100">100 semillas - ${Math.round(precio * 100).toLocaleString()} COP</option>
                    </select>
                    <button type="button" class="btn custom-btn add-to-cart">Agregar al carrito</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}


    function getCart() {
        const key = getCartKey();
        return JSON.parse(localStorage.getItem(key) || '[]');
    }

    function saveCart(cart) {
        const key = getCartKey();
        localStorage.setItem(key, JSON.stringify(cart));
        // Mantener sincronizado un pedido 'pendiente' basado en el carrito
        syncPendingPedidoFromCart(cart);
    }

    // Sincroniza el carrito actual con un pedido en localStorage (estado 'pendiente')
    function syncPendingPedidoFromCart(cart) {
        const email = sessionStorage.getItem('emailUsuarioActual') || 'invitado';
        const pedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');

        // Buscar pedido pendiente del mismo email
        const idx = pedidos.findIndex(p => p.email === email && p.estado === 'pendiente');

        if (!cart || cart.length === 0) {
            // si carrito vacío, eliminar pedido pendiente si existía
            if (idx !== -1) {
                pedidos.splice(idx, 1);
                localStorage.setItem('pedidos', JSON.stringify(pedidos));
            }
            return;
        }

        const totalQty = cart.reduce((s, it) => s + Number(it.qty), 0);
        const totalPrice = cart.reduce((s, it) => s + (Number(it.unitPrice || 0) * Number(it.qty || 0)), 0);
        const pedidoObj = {
            id: idx !== -1 ? pedidos[idx].id : (Date.now().toString()),
            email: email,
            items: cart,
            qty: totalQty,
            total: totalPrice,
            fecha: new Date().toISOString(),
            estado: 'pendiente'
        };

        if (idx !== -1) {
            pedidos[idx] = pedidoObj;
        } else {
            pedidos.push(pedidoObj);
        }

        localStorage.setItem('pedidos', JSON.stringify(pedidos));
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

            // Build item object. Prefer product id if the card provides one.
            const productId = card ? card.dataset.productId : null;
            const cart = getCart();

            // intentar obtener precio unitario desde inventario
            let unitPrice = 0;
            try {
                const inv = JSON.parse(localStorage.getItem('miInventario') || '[]');
                if (productId) {
                    const prod = inv.find(p => String(p.id) === String(productId));
                    if (prod) unitPrice = Number(prod.precio) || 0;
                }
                if (!unitPrice) {
                    const opt = qtySelect ? qtySelect.selectedOptions[0].textContent : '';
                    const m = opt.match(/([0-9\.,]+)/g);
                    if (m && m.length) {
                        // tomar el último grupo (precio)
                        const raw = m[m.length - 1].replace(/\./g, '').replace(/,/g, '');
                        unitPrice = Number(raw) / Math.max(1, Number(qty));
                    }
                }
            } catch (err) { unitPrice = 0; }

            const itemObj = {
                id: productId ? String(productId) : (Date.now().toString() + Math.floor(Math.random()*1000)),
                productId: productId ? String(productId) : null,
                title: title.trim(),
                qty: Number(qty),
                img: img,
                unitPrice: Number(unitPrice) || 0
            };

            // Merge if same productId exists (preferred), otherwise by title+img
            let existing = null;
            if (itemObj.productId) {
                existing = cart.find(i => i.productId === itemObj.productId);
            } else {
                existing = cart.find(i => i.title === itemObj.title && i.img === itemObj.img);
            }

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
    renderProductsFromInventario();
    // Checkout: crear pedido y actualizar 'ventasMes' + limpiar carrito
    const checkoutBtnEl = document.getElementById('checkoutBtn');
    if (checkoutBtnEl) {
            checkoutBtnEl.addEventListener('click', function() {
            const cart = getCart();
            if (!cart || cart.length === 0) {
                alert('No hay productos en el carrito.');
                return;
            }

            const totalQty = cart.reduce((s, it) => s + Number(it.qty), 0);
            const totalPrice = cart.reduce((s, it) => s + (Number(it.unitPrice || 0) * Number(it.qty || 0)), 0);
            const pedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');
            const email = sessionStorage.getItem('emailUsuarioActual') || 'invitado';

            // Si existe un pedido pendiente para este usuario, marcarlo como completado
            const idxPend = pedidos.findIndex(p => p.email === email && p.estado === 'pendiente');
            if (idxPend !== -1) {
                pedidos[idxPend].items = cart;
                pedidos[idxPend].qty = totalQty;
                pedidos[idxPend].total = totalPrice;
                pedidos[idxPend].fecha = new Date().toISOString();
                pedidos[idxPend].estado = 'completado';
            } else {
                const nuevoPedido = {
                    id: Date.now().toString(),
                    email: email,
                    items: cart,
                    qty: totalQty,
                    total: totalPrice,
                    fecha: new Date().toISOString(),
                    estado: 'completado'
                };
                pedidos.push(nuevoPedido);
            }

            localStorage.setItem('pedidos', JSON.stringify(pedidos));

            // Actualizar contador de ventas del mes (suma monetaria)
            const ventasActual = parseFloat(localStorage.getItem('ventasMes') || '0') || 0;
            localStorage.setItem('ventasMes', String(ventasActual + totalPrice));

            // Limpiar carrito del usuario y eliminar pedido pendiente
            saveCart([]); // esto llamará a syncPendingPedidoFromCart y eliminará el pendiente
            renderCart();
            updateBadge();

            // Cerrar modal carrito si está abierto
            const cartModalEl = document.getElementById('cartModal');
            const cartModalInst = cartModalEl ? bootstrap.Modal.getInstance(cartModalEl) : null;
            if (cartModalInst) cartModalInst.hide();

            alert('Pedido realizado correctamente. Gracias por tu compra.');
        });
    }

    renderCart();
    updateBadge();
});