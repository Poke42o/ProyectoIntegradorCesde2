
const datosIniciales = [
    { id: 1, nombre: "Cachalote", stock: 50, precio: 25000, estado: "Activo", imagen: "flowerOne.jpg", descripcion: "Variedad con predominancia sativa experta para espacios de exterior y facil cuidado." },
    { id: 2, nombre: "Early Skunk", stock: 35, precio: 25000, estado: "Activo", imagen: "flowerTwo.jpg", descripcion: "Genética estable de primera generación. Ideales para proyectos de crianza o selección." },
    { id: 3, nombre: "White Widow", stock: 8, precio: 25000, estado: "Poco Stock", imagen: "flowerThree.jpg", descripcion: "Genética estable de primera generación. Ideales para proyectos de crianza o selección." },
    { id: 4, nombre: "OG Kush", stock: 0, precio: 25000, estado: "Inactivo", imagen: "flowerFour.jpg", descripcion: "Genética estable de primera generación. Ideales para proyectos de crianza o selección." },
    { id: 5, nombre: "Blue Dream", stock: 42, precio: 25000, estado: "Activo", imagen: "flowerFive.jpg", descripcion: "Genética estable de primera generación. Ideales para proyectos de crianza o selección." },
    { id: 6, nombre: "Girl Scout Cookies", stock: 12, precio: 25000, estado: "Poco Stock", imagen: "flowerSix.jpg", descripcion: "Genética estable de primera generación. Ideales para proyectos de crianza o selección." }
];
const StorageManager = {
    getInventario: () => {
        let inventario = JSON.parse(localStorage.getItem('miInventario')) || [];
        if (inventario.length === 0) {
            inventario = datosIniciales;
            localStorage.setItem('miInventario', JSON.stringify(inventario));
        }
        return inventario;
    },
    setInventario: (data) => localStorage.setItem('miInventario', JSON.stringify(data))
};
function resolveProductImage(prod, fallback = '../Imagenes/flowerOne.jpg') {
    if (!prod) return fallback;
    if (prod.img) {
        if (typeof prod.img === 'string' && prod.img.startsWith('data:')) return prod.img;
        if (typeof prod.img === 'string' && (prod.img.startsWith('/') || prod.img.startsWith('http'))) return prod.img;
        return `../Imagenes/${prod.img}`;
    }
    if (prod.imagen) {
        if (typeof prod.imagen === 'string' && prod.imagen.startsWith('data:')) return prod.imagen;
        if (typeof prod.imagen === 'string' && (prod.imagen.startsWith('/') || prod.imagen.startsWith('http'))) return prod.imagen;
        return `../Imagenes/${prod.imagen}`;
    }
    if (Array.isArray(prod.imagenes) && prod.imagenes.length) {
        const first = prod.imagenes[0];
        if (typeof first === 'string' && first.startsWith('data:')) return first;
        if (typeof first === 'string' && (first.startsWith('/') || first.startsWith('http'))) return first;
        return `../Imagenes/${first}`;
    }

    return fallback;
}
const defaultPool = ['flowerOne.jpg','flowerTwo.jpg','flowerThree.jpg','flowerFour.jpg','flowerFive.jpg','flowerSix.jpg'];
function cargarProductosDinamicos() {
    const contenedor = document.getElementById('productosDinamicos');
    if (!contenedor) return;
    let productos = StorageManager.getInventario();
    if (productos.length === 0) {
        contenedor.innerHTML = '<p class="text-muted">No hay productos disponibles en este momento</p>';
        return;
    }
    contenedor.innerHTML = productos.map((prod, idx) => {
        const fallback = `../Imagenes/${defaultPool[idx % defaultPool.length]}`;
        const imgSrc = resolveProductImage(prod, fallback);
        console.log('[productosDinamicos] imagen resuelta =>', prod.nombre, imgSrc);
        
        return `
            <div class="item">
                <p>${prod.nombre}</p>
                <img src="${imgSrc}" alt="${prod.nombre}" style="width: 100%; height: 250px; object-fit: cover;" onerror="this.onerror=null;this.src='../Imagenes/flowerOne.jpg';">
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
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', agregarAlCarritoDinamico);
    });
}


function agregarAlCarritoDinamico(e) {
    
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
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        const totalItems = carrito.reduce((sum, item) => sum + item.unidades, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = 'block';
    }

    alert(`${productName} agregado al carrito`);
}
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
        if (authLinks) authLinks.classList.remove('d-none');
        if (userLinks) userLinks.classList.add('d-none');
        if (userNameDisplay) userNameDisplay.textContent = "";
    }
}
document.addEventListener('DOMContentLoaded', function() {
    cargarProductosDinamicos();
    console.log('✅ Productos dinámicos cargados. Inventario:', StorageManager.getInventario());
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
                    window.location.href = 'index.html';
                } else {
                    alert('Correo o contraseña incorrectos.');
                }
        });
    }
    actualizarNavbar();
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
function getCartKey() {
    const email = sessionStorage.getItem('emailUsuarioActual');
    return email ? `magia_cart_${email}` : 'magia_cart_invitado';
}
function renderProductsFromInventario() {
    const container = document.getElementById('productosContainer');
    if (!container) return;

    const inventario = JSON.parse(localStorage.getItem('miInventario') || 'null');
    if (!inventario || inventario.length === 0) return;
    let html = '';
    inventario.forEach((prod, idx) => {
        const precio = Number(prod.precio) || 0;
        const fallback = `../Imagenes/${defaultPool[idx % defaultPool.length]}`;
        const imgSrc = resolveProductImage(prod, fallback);
        console.log('[productosInventario] imagen resuelta =>', prod.nombre, imgSrc);
        const descripcion = prod.descripcion || '';
        html += `
            <div class="item" data-product-id="${prod.id}">
                <p>${prod.nombre}</p>
                <img src="${imgSrc}" alt="${prod.nombre}" onerror="this.onerror=null;this.src='../Imagenes/flowerOne.jpg';">
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
        syncPendingPedidoFromCart(cart);
    }
    function syncPendingPedidoFromCart(cart) {
        const email = sessionStorage.getItem('emailUsuarioActual') || 'invitado';
        const pedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');
        const idx = pedidos.findIndex(p => p.email === email && p.estado === 'pendiente');
        if (!cart || cart.length === 0) {
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
            const productId = card ? card.dataset.productId : null;
            const cart = getCart();
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
                        const raw = m[m.length - 1].replace(/\./g, '').replace(/,/g, '');
                        unitPrice = Number(raw) / Math.max(1, Number(qty));
                    }
                }
            } catch (err) { unitPrice = 0; }
            const itemObj = {
                id: Date.now().toString() + Math.floor(Math.random()*1000),
                title: title.trim(),
                qty: Number(qty),
                img: img
            };
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
            const cartModalEl = document.getElementById('cartModal');
            if (cartModalEl) {
                const cartModal = new bootstrap.Modal(cartModalEl);
                cartModal.show();
            }
            return;
        }
    });
    renderProductsFromInventario();
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
            const ventasActual = parseFloat(localStorage.getItem('ventasMes') || '0') || 0;
            localStorage.setItem('ventasMes', String(ventasActual + totalPrice));
            saveCart([]); 
            renderCart();
            updateBadge();

          
            const cartModalEl = document.getElementById('cartModal');
            const cartModalInst = cartModalEl ? bootstrap.Modal.getInstance(cartModalEl) : null;
            if (cartModalInst) cartModalInst.hide();

            alert('Pedido realizado correctamente. Gracias por tu compra.');
        });
    }

    renderCart();
    updateBadge();
});