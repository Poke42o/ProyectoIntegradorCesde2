const datosIniciales = [
    { id: 101, nombre: "Semilla Sativa X", stock: 50, precio: 20000, estado: "Activo" },
    { id: 102, nombre: "Semilla Indica Y", stock: 5, precio: 25000, estado: "Poco Stock" },
    { id: 103, nombre: "Híbrida Especial", stock: 0, precio: 30000, estado: "Inactivo" }
];

function cargarTabla() {
    const cuerpoTabla = document.getElementById('tablaProductos');
    if (!cuerpoTabla) return; 

    cuerpoTabla.innerHTML = ''; 

    let inventario = JSON.parse(localStorage.getItem('miInventario'));
    if (!inventario || inventario.length === 0) {
        inventario = datosIniciales;
        localStorage.setItem('miInventario', JSON.stringify(inventario));
    }

    inventario.forEach((prod, index) => {
        let badgeColor = 'bg-success';
        if(prod.estado === 'Poco Stock') badgeColor = 'bg-warning text-dark';
        if(prod.estado === 'Inactivo') badgeColor = 'bg-secondary';

        const fila = `
            <tr>
                <td>#${prod.id}</td>
                <td class="fw-bold">${prod.nombre}</td>
                <td>${prod.stock} un.</td>
                <td>$${Number(prod.precio).toLocaleString()}</td>
                <td><span class="badge ${badgeColor}">${prod.estado}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" onclick="eliminarProducto(${index})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        cuerpoTabla.innerHTML += fila;
    });
}

const formInventario = document.getElementById('formInventario');
if (formInventario) {
    formInventario.addEventListener('submit', function(e) {
        e.preventDefault(); 

        const nuevoProd = {
            id: Math.floor(Math.random() * 1000) + 100, 
            nombre: document.getElementById('nombreInput').value,
            stock: document.getElementById('stockInput').value,
            precio: document.getElementById('precioInput').value,
            estado: document.getElementById('estadoInput').value
        };

        let inventario = JSON.parse(localStorage.getItem('miInventario')) || [];
        inventario.push(nuevoProd);
        localStorage.setItem('miInventario', JSON.stringify(inventario));

        const modalEl = document.getElementById('modalProducto');
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        modalInstance.hide();
        
        document.getElementById('formInventario').reset();
        cargarTabla();
        alert('Producto agregado correctamente');
    });
}

window.eliminarProducto = function(index) {
    if(confirm('¿Estás seguro de borrar este producto del inventario?')) {
        let inventario = JSON.parse(localStorage.getItem('miInventario'));
        inventario.splice(index, 1);
        localStorage.setItem('miInventario', JSON.stringify(inventario));
        cargarTabla();
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

document.addEventListener('DOMContentLoaded', cargarTabla);