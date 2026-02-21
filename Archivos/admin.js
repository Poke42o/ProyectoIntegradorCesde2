// ============ CONFIGURACIÓN Y CONSTANTES ============
const datosIniciales = [
    { id: 201, nombre: "Cachalote", stock: 50, precio: 25000, estado: "Activo", descripcion: "Variedad con predominancia sativa, ideal para exterior.", img: '/Imagenes/flowerOne.jpg' },
    { id: 202, nombre: "Early Skunk", stock: 40, precio: 25000, estado: "Activo", descripcion: "Genética estable, rápida floración.", img: '/Imagenes/flowerTwo.jpg' },
    { id: 203, nombre: "White Widow", stock: 30, precio: 25000, estado: "Activo", descripcion: "Clásica y potente, buena para cultivo indoor.", img: '/Imagenes/flowerThree.jpg' },
    { id: 204, nombre: "OG Kush", stock: 20, precio: 25000, estado: "Activo", descripcion: "Aromática y resinosa, preferida por conocedores.", img: '/Imagenes/flowerFour.jpg' },
    { id: 205, nombre: "Blue Dream", stock: 60, precio: 25000, estado: "Activo", descripcion: "Equilibrada, efecto suave y productiva.", img: '/Imagenes/flowerFive.jpg' },
    { id: 206, nombre: "Girl Scout Cookies", stock: 8, precio: 25000, estado: "Poco Stock", descripcion: "Sabor dulce y efecto potente.", img: '/Imagenes/flowerSix.jpg' }
];

// ============ UTILIDADES DE STORAGE ============
const StorageManager = {
    getInventario: () => JSON.parse(localStorage.getItem('miInventario')) || [],
    setInventario: (data) => localStorage.setItem('miInventario', JSON.stringify(data)),
    getClientes: () => JSON.parse(localStorage.getItem('usuariosRegistrados')) || [],
    setClientes: (data) => localStorage.setItem('usuariosRegistrados', JSON.stringify(data))
};

// ============ UTILIDADES DE ESTADO ============
const EstadoHelper = {
    calcularEstado: (cantidad) => {
        cantidad = parseInt(cantidad) || 0;
        if (cantidad > 10) return 'Activo';
        if (cantidad > 0 && cantidad <= 10) return 'Poco Stock';
        return 'Inactivo';
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

// ============ GESTIÓN DE INVENTARIO ============
function cargarTabla() {
    const cuerpoTabla = document.getElementById('tablaProductos');
    if (!cuerpoTabla) return; 

    cuerpoTabla.innerHTML = ''; 

    let inventario = StorageManager.getInventario();
    if (inventario.length === 0) {
        inventario = datosIniciales;
        StorageManager.setInventario(inventario);
    }

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
                    <button class="btn btn-sm btn-outline-primary" onclick="abrirModalEditar(${index})" data-bs-toggle="modal" data-bs-target="#modalEditarProducto">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="eliminarProducto(${index})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        cuerpoTabla.innerHTML += fila;
    });
}

// Manejador de eventos del formulario de inventario
const formInventario = document.getElementById('formInventario');
if (formInventario) {
    formInventario.addEventListener('submit', function(e) {
        e.preventDefault(); 

            const nombreVal = document.getElementById('nombreInput').value;
            const stockVal = document.getElementById('stockInput').value || 0;
            const precioVal = document.getElementById('precioInput').value || 0;
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
        const stockVal = document.getElementById('stockEditInput').value || 0;
        const precioVal = document.getElementById('precioEditInput').value || 0;
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
            // keep existing img if any
            const existingImg = inventario[indiceEdicion].img || '';
            applyUpdateWithImg(existingImg);
        }
    });
}

// ============ GESTIÓN DE CLIENTES ============
function inicializarAdmin() {
    let clientes = StorageManager.getClientes();
    
    // Verificar si el admin ya existe
    const adminExiste = clientes.some(c => c.email === 'admin@magic.com');
    
    if (!adminExiste && clientes.length === 0) {
        const adminUser = {
            id: 1,
            nombre: 'Administrador',
            email: 'admin@magic.com',
            telefono: '+57 3001234567',
            fechaRegistro: new Date().toISOString().split('T')[0],
            esAdmin: true
        };
        clientes.push(adminUser);
        StorageManager.setClientes(clientes);
    }
}

// Asegura que los productos por defecto en `datosIniciales` existan en el storage
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
    const tablaClientes = document.getElementById('tablaClientes');
    if (!tablaClientes) return;
    
    tablaClientes.innerHTML = '';
    
    // Cargar SOLO usuarios registrados del localStorage
    let clientes = StorageManager.getClientes();
    
    // Separar admin de los demás clientes
    const admin = clientes.filter(c => c.esAdmin);
    const clientesRegulares = clientes.filter(c => !c.esAdmin);
    
    // Ordenar: admin primero, luego clientes por fecha de registro (más recientes primero)
    const clientesOrdenados = [
        ...admin,
        ...clientesRegulares.sort((a, b) => new Date(b.fechaRegistro) - new Date(a.fechaRegistro))
    ];
    
    // Actualizar estadísticas
    document.getElementById('totalClientes').textContent = clientesOrdenados.length;
    document.getElementById('clientesActivos').textContent = clientesOrdenados.length;
    document.getElementById('comprasTotal').textContent = Math.floor(Math.random() * 100) + 30;
    
    // Llenar tabla
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
        
        // Separar admin de regulares
        const admin = clientes.filter(c => c.esAdmin);
        const clientesRegulares = clientes.filter(c => !c.esAdmin);
        
        // El índice corresponde a la lista ordenada (admin primero)
        const clientesOrdenados = [...admin, ...clientesRegulares];
        
        // Obtener el cliente a eliminar
        const clienteAEliminar = clientesOrdenados[index];
        
        // No permitir eliminar admin
        if (clienteAEliminar.esAdmin) {
            alert('No se puede eliminar la cuenta del administrador.');
            return;
        }
        
        // Buscar su índice real en el array original
        const indiceReal = clientes.findIndex(c => c.email === clienteAEliminar.email);
        
        if (indiceReal !== -1) {
            // Eliminar de usuariosRegistrados
            clientes.splice(indiceReal, 1);
            StorageManager.setClientes(clientes);
            
            // Eliminar de usuarios (login)
            let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
            usuarios = usuarios.filter(u => u.email !== clienteAEliminar.email);
            localStorage.setItem('usuarios', JSON.stringify(usuarios));
            
            // Eliminar carrito del usuario si existe
            const cartKey = `magia_cart_${clienteAEliminar.email}`;
            localStorage.removeItem(cartKey);
            
            cargarClientes();
            alert(`Cliente ${clienteAEliminar.nombre} eliminado completamente.`);
        }
    }
};

window.verDetalleCliente = function(index) {
    let clientes = StorageManager.getClientes();
    
    // Separar admin de regulares
    const admin = clientes.filter(c => c.esAdmin);
    const clientesRegulares = clientes.filter(c => !c.esAdmin);
    
    // Ordenar igual que en cargarClientes()
    const clientesOrdenados = [...admin, ...clientesRegulares.sort((a, b) => new Date(b.fechaRegistro) - new Date(a.fechaRegistro))];
    
    const cliente = clientesOrdenados[index];
    const badge = cliente.esAdmin ? '\n\n👤 Perfil: ADMINISTRADOR' : '';
    alert(`Detalles del Cliente\n\nNombre: ${cliente.nombre}\nEmail: ${cliente.email}\nTeléfono: ${cliente.telefono}\nFecha Registro: ${cliente.fechaRegistro}${badge}`);
};

// ============ NAVEGACIÓN ============
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
    cargarClientes();
    document.querySelectorAll('.sidebar a').forEach(a => a.classList.remove('active'));
    e.target.closest('a').classList.add('active');
};

// ============ CERRAR SESIÓN ============
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

// ============ INICIALIZACIÓN DEL DOCUMENTO ============
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar usuario admin si es la primera vez
    inicializarAdmin();
    // Asegurar productos por defecto en storage
    asegurarProductosPorDefecto();
    cargarTabla();
    cargarClientes();
    actualizarEstadisticasAdmin();
    
    // Inicializar controles de estado automático
    inicializarControlesEstado();
});

// Escuchar cambios en localStorage desde otras pestañas para actualizar stats/tabla
window.addEventListener('storage', function(e) {
    if (!e.key) return;
    const keysToWatch = ['pedidos', 'miInventario', 'usuariosRegistrados', 'ventasMes'];
    if (keysToWatch.includes(e.key)) {
        // refrescar vistas y estadísticas cuando cambian
        try { cargarTabla(); } catch (err) {}
        try { cargarClientes(); } catch (err) {}
        try { actualizarEstadisticasAdmin(); } catch (err) {}
    }
});

// Función auxiliar para inicializar controles de estado automático (sin repetición)
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
                estadoInput.value = EstadoHelper.calcularEstado(stockInput.value);
            });
        }
    });
}

// Actualiza estadísticas visibles en el dashboard (ventas, pedidos pendientes, usuarios nuevos)
function actualizarEstadisticasAdmin() {
    // Calcular ventas como la suma monetaria de todos los pedidos (pendientes + completados)
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