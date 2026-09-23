/**
 * app.js — Lógica del sitio (Fetch + Dialogs)
 * Tarea Sesión 7 · Desarrollo Web · UMG
 *
 * TODO: implementa las funciones marcadas. La API exige el header
 * `x-api-key` en las operaciones de escritura (POST, PUT, DELETE).
 */
const API = '/alumnos';
const API_KEY = 'umg-2026'; // debe coincidir con config.env

// Helper ya resuelto: cabeceras para las peticiones
const cabeceras = (conJson = true) => ({
    ...(conJson ? { 'Content-Type': 'application/json' } : {}),
    'x-api-key': API_KEY,
});

// Referencias del DOM (ya resueltas)
const tabla = document.querySelector('#tablaAlumnos tbody');
const mensaje = document.querySelector('#mensaje');
const dialogoForm = document.querySelector('#dialogoForm');
const dialogoEliminar = document.querySelector('#dialogoEliminar');
const form = document.querySelector('#formAlumno');
const tituloForm = document.querySelector('#tituloForm');
const nombreEliminar = document.querySelector('#nombreEliminar');

let idEnEdicion = null;        // null = crear | string = editar
let idAEliminar = null;

/**
 * TODO: GET /alumnos y pinta las filas en la tabla.
 * Cada fila debe incluir botones "Editar" y "Eliminar".
 */
async function cargarAlumnos() {
    const res = await fetch(API);
    const alumnos = await res.json();

    tabla.innerHTML = '';

    alumnos.forEach((alumno, indice) => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
        <td>${indice + 1}</td>
        <td>${alumno.nombre}</td>
        <td>${alumno.apellido}</td>
        <td>${alumno.email}</td>
        <td>${alumno.edad ?? ''}</td>
        <td>
            <button type="button" class="btn-editar">Editar</button>
            <button type="button" class="btn-eliminar">Eliminar</button>
        </td>`;

        fila.querySelector('.btn-editar').addEventListener('click', () => abrirDialogoEditar(alumno.id));
        fila.querySelector('.btn-eliminar').addEventListener('click', () => eliminarAlumno(alumno.id));

        tabla.appendChild(fila);
    });
}

/**
 * TODO: limpia el formulario, pone el título "Nuevo alumno",
 * idEnEdicion = null y abre dialogoForm con showModal().
 */
function abrirDialogoNuevo() {
    form.reset();
    idEnEdicion = null;
    tituloForm.textContent = 'Nuevo alumno';
    dialogoForm.showModal();
}

/**
 * TODO: precarga los datos del alumno en el formulario,
 * guarda su id en idEnEdicion, cambia el título a "Editar alumno"
 * y abre dialogoForm.
 */
async function abrirDialogoEditar(id) {
    const res = await fetch(`${API}/${id}`);
    const alumno = await res.json();

    document.querySelector('#nombre').value = alumno.nombre;
    document.querySelector('#apellido').value = alumno.apellido;
    document.querySelector('#email').value = alumno.email;
    document.querySelector('#edad').value = alumno.edad ?? '';

    idEnEdicion = id;
    tituloForm.textContent = 'Editar alumno';
    dialogoForm.showModal();
}

/**
 * TODO: lee los campos del formulario y llama a la API.
 *   - Si idEnEdicion es null → POST /alumnos            (201)
 *   - Si hay id             → PUT /alumnos/:id          (200)
 * Usa cabeceras() y JSON.stringify(). Al terminar: cierra el dialog,
 * recarga la lista y muestra un mensaje.
 */
async function guardarAlumno(event) {
    event.preventDefault();

    const datos = {
        nombre: document.querySelector('#nombre').value,
        apellido: document.querySelector('#apellido').value,
        email: document.querySelector('#email').value,
        edad: Number(document.querySelector('#edad').value) || undefined,
    };

    try {
        const res = idEnEdicion
            ? await fetch(`${API}/${idEnEdicion}`, {
                  method: 'PUT',
                  headers: cabeceras(),
                  body: JSON.stringify(datos),
              })
            : await fetch(API, {
                  method: 'POST',
                  headers: cabeceras(),
                  body: JSON.stringify(datos),
              });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Ocurrió un error');
        }

        dialogoForm.close();
        await cargarAlumnos();
        mostrarMensaje(idEnEdicion ? 'Alumno actualizado' : 'Alumno creado', 'ok');
    } catch (error) {
        mostrarMensaje(error.message, 'error');
    }
}

/**
 * TODO: abre dialogoEliminar guardando el id, y al confirmar hace
 * DELETE /alumnos/:id con cabeceras(false). Luego recarga y avisa.
 */
function eliminarAlumno(id) {
    idAEliminar = id;

    const fila = [...tabla.querySelectorAll('tr')].find((tr) =>
        tr.querySelector('.btn-eliminar')?.dataset?.id === id);

    nombreEliminar.textContent = fila ? fila.children[1].textContent : 'este alumno';
    dialogoEliminar.showModal();
}

async function confirmarEliminar() {
    try {
        const res = await fetch(`${API}/${idAEliminar}`, {
            method: 'DELETE',
            headers: cabeceras(false),
        });

        if (!res.ok) {
            throw new Error('No se pudo eliminar');
        }

        dialogoEliminar.close();
        await cargarAlumnos();
        mostrarMensaje('Alumno eliminado', 'ok');
    } catch (error) {
        mostrarMensaje(error.message, 'error');
    }
}

/**
 * TODO: helper para mostrar mensajes (error en rojo, éxito en verde).
 */
function mostrarMensaje(texto, tipo = 'ok') {
    mensaje.textContent = texto;
    mensaje.className = tipo;
}

// ============================================================
// Conexión de eventos (TODO: completa lo que falte)
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#btnNuevo').addEventListener('click', abrirDialogoNuevo);
    form.addEventListener('submit', guardarAlumno);
    document.querySelector('#btnCancelar').addEventListener('click', () => dialogoForm.close());
    document.querySelector('#btnCancelarEliminar').addEventListener('click', () => dialogoEliminar.close());
    document.querySelector('#btnConfirmarEliminar').addEventListener('click', confirmarEliminar);

    cargarAlumnos();
});