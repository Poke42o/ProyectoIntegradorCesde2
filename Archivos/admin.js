const datosIniciales = [
    { id: 201, nombre: "Cachalote", stock: 50, precio: 25000, estado: "Activo", descripcion: "Variedad con predominancia sativa, ideal para exterior.", img: '/Imagenes/flowerOne.jpg' },
    { id: 202, nombre: "Early Skunk", stock: 40, precio: 25000, estado: "Activo", descripcion: "Genética estable, rápida floración.", img: '/Imagenes/flowerTwo.jpg' },
    { id: 203, nombre: "White Widow", stock: 30, precio: 25000, estado: "Activo", descripcion: "Clásica y potente, buena para cultivo indoor.", img: '/Imagenes/flowerThree.jpg' },
    { id: 204, nombre: "OG Kush", stock: 20, precio: 25000, estado: "Activo", descripcion: "Aromática y resinosa, preferida por conocedores.", img: '/Imagenes/flowerFour.jpg' },
    { id: 205, nombre: "Blue Dream", stock: 60, precio: 25000, estado: "Activo", descripcion: "Equilibrada, efecto suave y productiva.", img: '/Imagenes/flowerFive.jpg' },
    { id: 206, nombre: "Girl Scout Cookies", stock: 8, precio: 25000, estado: "Poco Stock", descripcion: "Sabor dulce y efecto potente.", img: '/Imagenes/flowerSix.jpg' }
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
    setInventario: (data) => localStorage.setItem('miInventario', JSON.stringify(data)),
    getClientes: () => JSON.parse(localStorage.getItem('usuariosRegistrados')) || [],
    setClientes: (data) => localStorage.setItem('usuariosRegistrados', JSON.stringify(data))
};
const EstadoHelper = {
    calcularEstado: (cantidad) => {
        cantidad = parseInt(cantidad, 10);
        if (isNaN(cantidad) || cantidad <= 0) return 'Inactivo';
        if (cantidad >= 10) return 'Activo';
        return 'Poco Stock';
    },
    getBadgeColor: (estado) => {
        const colores = {
            'Activo': 'bg-success',
            'Poco Stock': 'bg-warning text-dark',
            'Inactivo': 'bg-secondary'
        };
        return colores[estado] || 'bg-secondary';
    }
};
let indiceEdicionProducto = null;
let imagenEnBase64 = null;
let imagenEditEnBase64 = null;


function convertirImagenABase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}


const formInventario = document.getElementById('formInventario');
if (formInventario) {
    formInventario.addEventListener('submit', function(e) {
        e.preventDefault(); 

            const nombreVal = document.getElementById('nombreInput').value;
            let stockVal = parseInt(document.getElementById('stockInput').value, 10);
            if (isNaN(stockVal) || stockVal < 0) stockVal = 0;
            const precioVal = parseFloat(document.getElementById('precioInput').value) || 0;
            const descripcionVal = document.getElementById('descripcionInput').value || '';
            const imagenFile = document.getElementById('imagenInput').files[0];

            const nuevoProd = {
                id: Math.floor(Math.random() * 1000) + 100,
                nombre: nombreVal,
                stock: stockVal,
                precio: precioVal,
                estado: EstadoHelper.calcularEstado(stockVal),
                descripcion: descripcionVal,
                img: ''
            };

            function pushAndClose() {
                let inventario = StorageManager.getInventario();
                inventario.push(nuevoProd);
                StorageManager.setInventario(inventario);

                const modalEl = document.getElementById('modalProducto');
                const modalInstance = bootstrap.Modal.getInstance(modalEl);
                if (modalInstance) modalInstance.hide();
                formInventario.reset();
                cargarTabla();
                alert('Producto agregado correctamente');
            }

            if (imagenFile) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    nuevoProd.img = e.target.result;
                    pushAndClose();
                };
                reader.readAsDataURL(imagenFile);
            } else {
                pushAndClose();
            }
    });
}

window.eliminarProducto = function(index) {
    if(confirm('¿Estás seguro de borrar este producto del inventario?')) {
        let inventario = StorageManager.getInventario();
        inventario.splice(index, 1);
        StorageManager.setInventario(inventario);
        cargarTabla();
    }
};

let indiceEdicion = null;

window.abrirModalEditar = function(index) {
    indiceEdicion = index;
    let inventario = StorageManager.getInventario();
    const producto = inventario[index];
    
    document.getElementById('nombreEditInput').value = producto.nombre;
    document.getElementById('stockEditInput').value = producto.stock;
    document.getElementById('precioEditInput').value = producto.precio;
    document.getElementById('estadoEditInput').value = producto.estado;
    document.getElementById('descripcionEditInput').value = producto.descripcion || '';
    const preview = document.getElementById('imagenEditPreview');
    if (producto.img) { preview.src = producto.img; preview.style.display = 'block'; } else { preview.src = ''; preview.style.display = 'none'; }
};

const formEditarInventario = document.getElementById('formEditarInventario');
if (formEditarInventario) {
    formEditarInventario.addEventListener('submit', function(e) {
        e.preventDefault();
        
        let inventario = StorageManager.getInventario();
        const nombreVal = document.getElementById('nombreEditInput').value;
        let stockVal = parseInt(document.getElementById('stockEditInput').value, 10);
        if (isNaN(stockVal) || stockVal < 0) stockVal = 0;
        const precioVal = parseFloat(document.getElementById('precioEditInput').value) || 0;
        const descripcionVal = document.getElementById('descripcionEditInput').value || '';
        const imagenFile = document.getElementById('imagenEditInput').files[0];

        function applyUpdateWithImg(imgData) {
            inventario[indiceEdicion] = {
                id: inventario[indiceEdicion].id,
                nombre: nombreVal,
                stock: stockVal,
                precio: precioVal,
                estado: EstadoHelper.calcularEstado(stockVal),
                descripcion: descripcionVal,
                img: imgData
            };

            StorageManager.setInventario(inventario);
            const modalEl = document.getElementById('modalEditarProducto');
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            if (modalInstance) modalInstance.hide();
            formEditarInventario.reset();
            cargarTabla();
            alert('Producto actualizado correctamente');
        }

        if (imagenFile) {
            const reader = new FileReader();
            reader.onload = function(e) { applyUpdateWithImg(e.target.result); };
            reader.readAsDataURL(imagenFile);
        } else {
            const existingImg = inventario[indiceEdicion].img || '';
            applyUpdateWithImg(existingImg);
        }
    });
}


function inicializarAdmin() {
    let clientes = StorageManager.getClientes();
    const adminExisteNuevo = clientes.some(c => c.email === 'magiaepigea@gmail.com');
    const adminExisteAntiguo = clientes.find(c => c.email === 'admin@magic.com');
    if (adminExisteAntiguo && !adminExisteNuevo) {
        adminExisteAntiguo.email = 'magiaepigea@gmail.com';
        StorageManager.setClientes(clientes);
    }
    else if (!adminExisteNuevo && clientes.length === 0) {
        const adminUser = {
            id: 1,
            nombre: 'Administrador',
            email: 'magiaepigea@gmail.com',
            telefono: '+57 3001234567',
            fechaRegistro: new Date().toISOString().split('T')[0],
            esAdmin: true
        };
        clientes.push(adminUser);
        StorageManager.setClientes(clientes);
    }
}


function asegurarProductosPorDefecto() {
    let inventario = StorageManager.getInventario();
    let agregado = false;

    datosIniciales.forEach(def => {
        const existe = inventario.some(p => p.id === def.id || p.nombre === def.nombre);
        if (!existe) {
            inventario.push(def);
            agregado = true;
        }
    });

    if (agregado || inventario.length === 0) {
        StorageManager.setInventario(inventario.length ? inventario : datosIniciales.slice());
    }
}

function cargarClientes() {
    if (!tablaClientes) return;
    tablaClientes.innerHTML = '';
    let clientes = StorageManager.getClientes();
    const admin = clientes.filter(c => c.esAdmin);
    const clientesRegulares = clientes.filter(c => !c.esAdmin);
    const clientesOrdenados = [
        ...admin,
        ...clientesRegulares.sort((a, b) => new Date(b.fechaRegistro) - new Date(a.fechaRegistro))
    ];
    
    document.getElementById('totalClientes').textContent = clientesOrdenados.length;
    document.getElementById('clientesActivos').textContent = clientesOrdenados.length;
    document.getElementById('comprasTotal').textContent = Math.floor(Math.random() * 100) + 30;
    if (clientesOrdenados.length === 0) {
        tablaClientes.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No hay clientes registrados</td></tr>';
    } else {
        clientesOrdenados.forEach((cliente, index) => {
            const badgeAdmin = cliente.esAdmin ? '<span class="badge bg-danger ms-2">ADMIN</span>' : '';
            const fila = `
                <tr>
                    <td>#${cliente.id}</td>
                    <td class="fw-bold">${cliente.nombre} ${badgeAdmin}</td>
                    <td>${cliente.email}</td>
                    <td>${cliente.telefono || 'N/A'}</td>
                    <td>${cliente.fechaRegistro || 'N/A'}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-info" onclick="verDetalleCliente(${index})" title="Ver detalles">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="eliminarCliente(${index})" ${cliente.esAdmin ? 'disabled' : ''}>
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            tablaClientes.innerHTML += fila;
        });
    }
}

window.eliminarCliente = function(index) {
    if(confirm('¿Estás seguro de que deseas eliminar este cliente? Se eliminará su cuenta completamente.')) {
        let clientes = StorageManager.getClientes();
        const admin = clientes.filter(c => c.esAdmin);
        const clientesRegulares = clientes.filter(c => !c.esAdmin);
        const clientesOrdenados = [...admin, ...clientesRegulares];
        const clienteAEliminar = clientesOrdenados[index];
        if (clienteAEliminar.esAdmin) {
            alert('No se puede eliminar la cuenta del administrador.');
            return;
        }
        const indiceReal = clientes.findIndex(c => c.email === clienteAEliminar.email);
        if (indiceReal !== -1) {
            clientes.splice(indiceReal, 1);
            StorageManager.setClientes(clientes);
            let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
            usuarios = usuarios.filter(u => u.email !== clienteAEliminar.email);
            localStorage.setItem('usuarios', JSON.stringify(usuarios));
            const cartKey = `magia_cart_${clienteAEliminar.email}`;
            localStorage.removeItem(cartKey);
            cargarClientes();
            alert(`Cliente ${clienteAEliminar.nombre} eliminado completamente.`);
        }
    }
};

window.verDetalleCliente = function(index) {
    let clientes = StorageManager.getClientes();
    const admin = clientes.filter(c => c.esAdmin);
    const clientesRegulares = clientes.filter(c => !c.esAdmin);
    const clientesOrdenados = [...admin, ...clientesRegulares.sort((a, b) => new Date(b.fechaRegistro) - new Date(a.fechaRegistro))];
    const cliente = clientesOrdenados[index];
    const badge = cliente.esAdmin ? '\n\n👤 Perfil: ADMINISTRADOR' : '';
    alert(`Detalles del Cliente\n\nNombre: ${cliente.nombre}\nEmail: ${cliente.email}\nTeléfono: ${cliente.telefono}\nFecha Registro: ${cliente.fechaRegistro}${badge}`);
};
window.mostrarDashboard = function(e) {
    e.preventDefault();
    document.getElementById('dashboardPanel').style.display = 'block';
    document.getElementById('clientesPanel').style.display = 'none';
    document.querySelectorAll('.sidebar a').forEach(a => a.classList.remove('active'));
    e.target.closest('a').classList.add('active');
};
window.mostrarClientes = function(e) {
    e.preventDefault();
    document.getElementById('dashboardPanel').style.display = 'none';
    document.getElementById('clientesPanel').style.display = 'block';
    document.getElementById('productosPanel').style.display = 'none';
    cargarClientes();
    document.querySelectorAll('.sidebar a').forEach(a => a.classList.remove('active'));
    e.target.closest('a').classList.add('active');
};
window.mostrarProductos = function(e) {
    e.preventDefault();
    document.getElementById('dashboardPanel').style.display = 'none';
    document.getElementById('clientesPanel').style.display = 'none';
    document.getElementById('productosPanel').style.display = 'block';
    cargarProductosAdmin();
    document.querySelectorAll('.sidebar a').forEach(a => a.classList.remove('active'));
    e.target.closest('a').classList.add('active');
};

function cargarProductosAdmin() {
    const tablaProductos = document.getElementById('tablaProductrosAdmin');
    if (!tablaProductos) return;
    
    tablaProductos.innerHTML = '';
    
    let inventario = StorageManager.getInventario();
    const totalActivos = inventario.filter(p => p.estado === 'Activo').length;
    const valorTotal = inventario.reduce((sum, p) => sum + (Number(p.precio) * Number(p.stock)), 0);
    
    document.getElementById('totalProductos').textContent = inventario.length;
    document.getElementById('productosActivos').textContent = totalActivos;
    document.getElementById('valorInventario').textContent = `$${valorTotal.toLocaleString()}`;
    if (inventario.length === 0) {
        tablaProductos.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No hay productos en el inventario</td></tr>';
    } else {
        inventario.forEach((prod, index) => {
            const badgeColor = EstadoHelper.getBadgeColor(prod.estado);
            const fila = `
                <tr>
                    <td>#${prod.id}</td>
                    <td class="fw-bold">${prod.nombre}</td>
                    <td>${prod.stock} un.</td>
                    <td>$${Number(prod.precio).toLocaleString()}</td>
                    <td><span class="badge ${badgeColor}">${prod.estado}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-info" onclick="verDetalleProducto(${index})" title="Ver detalles">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-primary" onclick="abrirModalEditarProductoAdmin(${index})" data-bs-toggle="modal" data-bs-target="#modalEditarProducto">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="eliminarProductoAdmin(${index})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            tablaProductos.innerHTML += fila;
        });
    }
}

window.verDetalleProducto = function(index) {
    let inventario = StorageManager.getInventario();
    const prod = inventario[index];
    const costoTotal = (Number(prod.precio) * Number(prod.stock)).toLocaleString();
    const descripcion = prod.descripcion || 'Sin descripción disponible';
    let imagenHTML = '';
    if (prod.imagen) {
        imagenHTML = `\n🖼️ Imagen: [Se muestra una imagen en Base64]\n`;
    }
    
    alert(`DETALLES DEL PRODUCTO\n\n📦 Nombre: ${prod.nombre}\n🔢 ID: ${prod.id}\n📊 Stock: ${prod.stock} unidades\n💵 Precio: $${Number(prod.precio).toLocaleString()}\n🎯 Estado: ${prod.estado}\n📈 Valor Total: $${costoTotal}\n📝 Descripción: ${descripcion}${imagenHTML}`);
};

window.abrirModalEditarProductoAdmin = function(index) {
    indiceEdicionProducto = index;
    indiceEdicion = index;
    imagenEditEnBase64 = null;
    let inventario = StorageManager.getInventario();
    const producto = inventario[index];

    document.getElementById('nombreEditInput').value = producto.nombre;
    document.getElementById('descripcionEditInput').value = producto.descripcion || '';
    document.getElementById('stockEditInput').value = producto.stock;
    document.getElementById('precioEditInput').value = producto.precio;
    document.getElementById('estadoEditInput').value = producto.estado;
    const previewEl = document.getElementById('previewImagenEdit');
    const srcImg = producto.imagen || producto.img || '';
    if (previewEl) {
        if (srcImg) {
            previewEl.innerHTML = `<img src="${srcImg}" style="max-width: 100%; height: 150px; object-fit: cover; border-radius: 8px;" alt="Imagen actual">`;
        } else {
            previewEl.innerHTML = '<small class="text-muted">No hay imagen</small>';
        }
    }
};

window.eliminarProductoAdmin = function(index) {
    if(confirm('¿Estás seguro de que deseas eliminar este producto del inventario?')) {
        let inventario = StorageManager.getInventario();
        inventario.splice(index, 1);
        StorageManager.setInventario(inventario);
        cargarProductosAdmin();
        alert('Producto eliminado correctamente');
    }
};
const btnLogout = document.querySelector('.logout-btn');
if(btnLogout) {
    btnLogout.addEventListener('click', function(e) {
        e.preventDefault();
        if(confirm("¿Deseas cerrar sesión?")) {
            sessionStorage.removeItem('sesionActiva'); 
            window.location.href = 'index.html'; 
        }
    });
}


document.addEventListener('DOMContentLoaded', function() {
    
    inicializarAdmin();
    
    asegurarProductosPorDefecto();
    cargarTabla();
    cargarClientes();
    actualizarEstadisticasAdmin();
    inicializarControlesEstado();
    const imagenInput = document.getElementById('imagenInput');
    if (imagenInput) {
        imagenInput.addEventListener('change', async function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const preview = document.getElementById('previewImagen');
                    if (preview) {
                        preview.innerHTML = `<img src="${event.target.result}" style="max-width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin-top: 8px;" alt="Preview">`;
                    }
                };
                reader.readAsDataURL(file);
                imagenEnBase64 = await convertirImagenABase64(file);
            }
        });
    }
    
    const imagenEditInput = document.getElementById('imagenEditInput');
    if (imagenEditInput) {
        imagenEditInput.addEventListener('change', async function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const preview = document.getElementById('previewImagenEdit');
                    if (preview) {
                        preview.innerHTML = `<img src="${event.target.result}" style="max-width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin-top: 8px;" alt="Preview">`;
                    }
                };
                reader.readAsDataURL(file);
                imagenEditEnBase64 = await convertirImagenABase64(file);
            }
        });
    }
    
    console.log('✅ Admin Panel Iniciado - Datos disponibles en StorageManager');
    console.log('📦 Inventario:', StorageManager.getInventario());
});
window.addEventListener('storage', function(e) {
    if (!e.key) return;
    const keysToWatch = ['pedidos', 'miInventario', 'usuariosRegistrados', 'ventasMes'];
    if (keysToWatch.includes(e.key)) {
        try { cargarTabla(); } catch (err) {}
        try { cargarClientes(); } catch (err) {}
        try { actualizarEstadisticasAdmin(); } catch (err) {}
    }
});
function inicializarControlesEstado() {
    const pares = [
        { stock: 'stockInput', estado: 'estadoInput' },
        { stock: 'stockEditInput', estado: 'estadoEditInput' }
    ];

    pares.forEach(par => {
        const stockInput = document.getElementById(par.stock);
        const estadoInput = document.getElementById(par.estado);
        
        if (stockInput && estadoInput) {
            stockInput.addEventListener('input', function() {
                let val = parseInt(this.value, 10);
                if (isNaN(val) || val < 0) { val = 0; this.value = 0; }
                estadoInput.value = EstadoHelper.calcularEstado(val);
            });
        }
    });
}


function actualizarEstadisticasAdmin() {
   
    const pedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');
    const ventas = pedidos.reduce((s, p) => s + (parseFloat(p.total) || 0), 0);
    const pendientes = pedidos.filter(p => p.estado === 'pendiente').length;
    const clientes = StorageManager.getClientes();
    const clientesRegulares = clientes.filter(c => !c.esAdmin).length;
    const elVentas = document.getElementById('ventasMes');
    const elPendientes = document.getElementById('pedidosPendientes');
    const elUsuarios = document.getElementById('usuariosNuevos');

    if (elVentas) elVentas.textContent = '$' + ventas.toLocaleString();
    if (elPendientes) elPendientes.textContent = pendientes;
    if (elUsuarios) elUsuarios.textContent = clientesRegulares;
}