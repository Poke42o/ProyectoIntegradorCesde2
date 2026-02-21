// ============ CONFIGURACIÓN Y CONSTANTES ============
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

// ============ GESTIÓN DE INVENTARIO (VISTA PRODUCTOS) ============
let indiceEdicionProducto = null;
let imagenEnBase64 = null;
let imagenEditEnBase64 = null;

// Función para convertir imagen a Base64
function convertirImagenABase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Manejador de eventos del formulario para agregar productos
const formInventario = document.getElementById('formInventario');
if (formInventario) {
    formInventario.addEventListener('submit', function(e) {
        e.preventDefault(); 

        const nuevoProd = {
            id: Math.max(...StorageManager.getInventario().map(p => p.id), 0) + 1,
            nombre: document.getElementById('nombreInput').value,
            descripcion: document.getElementById('descripcionInput').value || '',
            imagen: imagenEnBase64 || '', // Usar Base64 en lugar del nombre
            stock: document.getElementById('stockInput').value || 0,
            precio: document.getElementById('precioInput').value,
            estado: EstadoHelper.calcularEstado(document.getElementById('stockInput').value)
        };

        let inventario = StorageManager.getInventario();
        inventario.push(nuevoProd);
        StorageManager.setInventario(inventario);

        const modalEl = document.getElementById('modalProducto');
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        modalInstance.hide();
        
        // Limpiar variables
        imagenEnBase64 = null;
        formInventario.reset();
        const previewEl = document.getElementById('previewImagen');
        if (previewEl) previewEl.innerHTML = '';
        
        cargarProductosAdmin();
        alert('Producto agregado correctamente');
    });
}

// Manejador de eventos del formulario para editar productos
const formEditarInventario = document.getElementById('formEditarInventario');
if (formEditarInventario) {
    formEditarInventario.addEventListener('submit', function(e) {
        e.preventDefault();
        
        let inventario = StorageManager.getInventario();
        
        inventario[indiceEdicionProducto] = {
            id: inventario[indiceEdicionProducto].id,
            nombre: document.getElementById('nombreEditInput').value,
            descripcion: document.getElementById('descripcionEditInput').value || '',
            imagen: imagenEditEnBase64 || inventario[indiceEdicionProducto].imagen, // Si se subió nueva, usar esa; si no, mantener la anterior
            stock: document.getElementById('stockEditInput').value || 0,
            precio: document.getElementById('precioEditInput').value,
            estado: EstadoHelper.calcularEstado(document.getElementById('stockEditInput').value)
        };
        
        StorageManager.setInventario(inventario);
        
        const modalEl = document.getElementById('modalEditarProducto');
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        modalInstance.hide();
        
        // Limpiar variables
        imagenEditEnBase64 = null;
        formEditarInventario.reset();
        const previewEl = document.getElementById('previewImagenEdit');
        if (previewEl) previewEl.innerHTML = '';
        
        cargarProductosAdmin();
        alert('Producto actualizado correctamente');
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
    document.getElementById('productosPanel').style.display = 'none';
    cargarClientes();
    document.querySelectorAll('.sidebar a').forEach(a => a.classList.remove('active'));
    e.target.closest('a').classList.add('active');
};

// ============ GESTIÓN DE PRODUCTOS (NUEVA VISTA) ============
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
    
    // Calcular estadísticas
    const totalActivos = inventario.filter(p => p.estado === 'Activo').length;
    const valorTotal = inventario.reduce((sum, p) => sum + (Number(p.precio) * Number(p.stock)), 0);
    
    document.getElementById('totalProductos').textContent = inventario.length;
    document.getElementById('productosActivos').textContent = totalActivos;
    document.getElementById('valorInventario').textContent = `$${valorTotal.toLocaleString()}`;
    
    // Llenar tabla
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
    
    // Si hay imagen, crear HTML con imagen; si no, solo texto
    let imagenHTML = '';
    if (prod.imagen) {
        imagenHTML = `\n🖼️ Imagen: [Se muestra una imagen en Base64]\n`;
    }
    
    alert(`DETALLES DEL PRODUCTO\n\n📦 Nombre: ${prod.nombre}\n🔢 ID: ${prod.id}\n📊 Stock: ${prod.stock} unidades\n💵 Precio: $${Number(prod.precio).toLocaleString()}\n🎯 Estado: ${prod.estado}\n📈 Valor Total: $${costoTotal}\n📝 Descripción: ${descripcion}${imagenHTML}`);
};

window.abrirModalEditarProductoAdmin = function(index) {
    indiceEdicionProducto = index;
    imagenEditEnBase64 = null; // Resetear la variable
    let inventario = StorageManager.getInventario();
    const producto = inventario[index];
    
    document.getElementById('nombreEditInput').value = producto.nombre;
    document.getElementById('descripcionEditInput').value = producto.descripcion || '';
    document.getElementById('stockEditInput').value = producto.stock;
    document.getElementById('precioEditInput').value = producto.precio;
    document.getElementById('estadoEditInput').value = producto.estado;
    
    // Mostrar imagen actual en preview si existe
    const previewEl = document.getElementById('previewImagenEdit');
    if (previewEl && producto.imagen) {
        previewEl.innerHTML = `<img src="${producto.imagen}" style="max-width: 100%; height: 150px; object-fit: cover; border-radius: 8px;" alt="Imagen actual">`;
    } else if (previewEl) {
        previewEl.innerHTML = '<small class="text-muted">No hay imagen</small>';
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
    // 1. Inicializar usuario admin si es la primera vez
    inicializarAdmin();
    
    // 2. Auto-inicializar inventario con datos iniciales (nunca será vacío gracias a StorageManager)
    StorageManager.getInventario(); // Esto garantiza que siempre hay datos
    
    // 3. Cargar datos en las vistas
    cargarClientes();
    cargarProductosAdmin();
    
    // 4. Inicializar controles de estado automático
    inicializarControlesEstado();
    
    // 5. Inicializar listeners para file inputs de imagen
    const imagenInput = document.getElementById('imagenInput');
    if (imagenInput) {
        imagenInput.addEventListener('change', async function(e) {
            const file = e.target.files[0];
            if (file) {
                // Mostrar preview
                const reader = new FileReader();
                reader.onload = function(event) {
                    const preview = document.getElementById('previewImagen');
                    if (preview) {
                        preview.innerHTML = `<img src="${event.target.result}" style="max-width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin-top: 8px;" alt="Preview">`;
                    }
                };
                reader.readAsDataURL(file);
                
                // Convertir a Base64 y guardar
                imagenEnBase64 = await convertirImagenABase64(file);
            }
        });
    }
    
    const imagenEditInput = document.getElementById('imagenEditInput');
    if (imagenEditInput) {
        imagenEditInput.addEventListener('change', async function(e) {
            const file = e.target.files[0];
            if (file) {
                // Mostrar preview
                const reader = new FileReader();
                reader.onload = function(event) {
                    const preview = document.getElementById('previewImagenEdit');
                    if (preview) {
                        preview.innerHTML = `<img src="${event.target.result}" style="max-width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin-top: 8px;" alt="Preview">`;
                    }
                };
                reader.readAsDataURL(file);
                
                // Convertir a Base64 y guardar
                imagenEditEnBase64 = await convertirImagenABase64(file);
            }
        });
    }
    
    console.log('✅ Admin Panel Iniciado - Datos disponibles en StorageManager');
    console.log('📦 Inventario:', StorageManager.getInventario());
});

// Función auxiliar para inicializar controles de estado automático
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