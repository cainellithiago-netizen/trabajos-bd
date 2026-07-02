// Sistema del foro - Datos y almacenamiento
// Guarda todo en localStorage para que persista entre sesiones

class ForoData {
    constructor() {
        this.usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
        this.posts = JSON.parse(localStorage.getItem('posts')) || [];
        this.comentarios = JSON.parse(localStorage.getItem('comentarios')) || [];
        this.usuarioActivo = JSON.parse(localStorage.getItem('usuarioActivo')) || null;
        this.inicializarDatos();
    }

    // Si es la primera vez, cargamos usuarios por defecto
    inicializarDatos() {
        if (this.usuarios.length === 0) {
            this.usuarios = [
                { id: 1, nombre: 'Thiago', email: 'thiago@mail.com', password: '123', avatar: '👤', posteos: 15, activo: 'Hace 2 horas' },
                { id: 2, nombre: 'Nahuel', email: 'nahuel@mail.com', password: '123', avatar: '👤', posteos: 8, activo: 'Hace 1 día' },
                { id: 3, nombre: 'Cainelli', email: 'cainelli@mail.com', password: '123', avatar: '👤', posteos: 23, activo: 'Hace 5 minutos' },
                { id: 4, nombre: 'Juan', email: 'juan@mail.com', password: '123', avatar: '👤', posteos: 3, activo: 'Hace 5 minutos' },
                { id: 5, nombre: 'Lucas', email: 'lucas@mail.com', password: '123', avatar: '👤', posteos: 12, activo: 'Hace 3 horas' }
            ];
            this.guardarDatos();
        }
    }

    // Guarda todo los datos en localStorage
    guardarDatos() {
        localStorage.setItem('usuarios', JSON.stringify(this.usuarios));
        localStorage.setItem('posts', JSON.stringify(this.posts));
        localStorage.setItem('comentarios', JSON.stringify(this.comentarios));
        localStorage.setItem('usuarioActivo', JSON.stringify(this.usuarioActivo));
    }

    // Agregar usuario nuevo
    agregarUsuario(nombre, email, password) {
        const nuevoUsuario = {
            id: Date.now(),
            nombre,
            email,
            password,
            avatar: '👤',
            posteos: 0,
            activo: 'Ahora'
        };
        this.usuarios.push(nuevoUsuario);
        this.guardarDatos();
        return nuevoUsuario;
    }

    // Verifica que email y password coincidan
    validarLogin(email, password) {
        return this.usuarios.find(u => u.email === email && u.password === password);
    }

    // Crea un post nuevo y lo agrega arriba
    agregarPost(contenido, imagen = null) {
        const nuevoPost = {
            id: Date.now(),
            usuarioId: this.usuarioActivo.id,
            usuario: this.usuarioActivo.nombre,
            contenido,
            imagen,
            fecha: new Date().toLocaleString('es-ES'),
            likes: 0,
            dislikes: 0,
            liked: false
        };
        this.posts.unshift(nuevoPost);
        this.usuarioActivo.posteos++;
        this.guardarDatos();
        return nuevoPost;
    }

    // Agregar un comentario a un post
    agregarComentario(postId, contenido) {
        const nuevoComentario = {
            id: Date.now(),
            postId,
            usuarioId: this.usuarioActivo.id,
            usuario: this.usuarioActivo.nombre,
            contenido,
            fecha: new Date().toLocaleString('es-ES')
        };
        this.comentarios.push(nuevoComentario);
        this.guardarDatos();
        return nuevoComentario;
    }

    // Traer todos los comentarios de un post
    obtenerComentarios(postId) {
        return this.comentarios.filter(c => c.postId === postId);
    }
}

// Instancia global que usamos en todo el archivo
const foro = new ForoData();

// Autenticación - Login y control de sesión
// Maneja el login, logout y la visibilidad de secciones

class Autenticacion {
    constructor() {
        this.formularioLogin = document.querySelector('#login form');
        this.formularioPost = document.querySelector('#inicio form');
        this.inicializarEventos();
        this.actualizarEstadoUI();
    }

    inicializarEventos() {
        if (this.formularioLogin) {
            this.formularioLogin.addEventListener('submit', (e) => this.manejarLogin(e));
        }

        if (this.formularioPost) {
            this.formularioPost.addEventListener('submit', (e) => this.manejarCrearPost(e));
        }
    }

    // Cuando envía el formulario de login
    manejarLogin(evento) {
        evento.preventDefault();

        const email = document.getElementById('email').value;
        const usuario = document.getElementById('usuario').value;
        const password = document.getElementById('password').value;

        if (!email || !usuario || !password) {
            alert('Completa todos los campos');
            return;
        }

        const usuarioValido = foro.validarLogin(email, password);

        if (usuarioValido) {
            foro.usuarioActivo = usuarioValido;
            foro.guardarDatos();
            this.mostrarMensajeExito(`Bienvenido, ${usuarioValido.nombre}`);
            this.formularioLogin.reset();
            this.actualizarEstadoUI();
        } else {
            alert('Email o contraseña incorrectos');
        }
    }

    // Cuando crea un post nuevo
    manejarCrearPost(evento) {
        evento.preventDefault();

        if (!foro.usuarioActivo) {
            alert('Inicia sesión para publicar');
            return;
        }

        const contenido = document.getElementById('post').value;

        if (!contenido.trim()) {
            alert('Escribe algo antes de publicar');
            return;
        }

        foro.agregarPost(contenido);
        this.mostrarMensajeExito('Publicación creada');
        this.formularioPost.reset();
        ui.renderizarPosts();
    }

    // Notificación que aparece y desaparece sola
    mostrarMensajeExito(mensaje) {
        const div = document.createElement('div');
        div.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #00d9ff, #ff00ff);
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            z-index: 9999;
            font-weight: bold;
            animation: slideIn 0.3s ease;
        `;
        div.textContent = mensaje;
        document.body.appendChild(div);

        setTimeout(() => div.remove(), 3000);
    }

    // Muestra login o panel del usuario según esté autenticado
    actualizarEstadoUI() {
        const seccionLogin = document.getElementById('login');
        const seccionInicio = document.getElementById('inicio');

        if (foro.usuarioActivo) {
            if (seccionLogin) seccionLogin.style.display = 'none';
            if (seccionInicio) {
                seccionInicio.style.display = 'block';
                this.mostrarInfoUsuario();
            }
        } else {
            if (seccionLogin) seccionLogin.style.display = 'block';
            if (seccionInicio) seccionInicio.style.display = 'none';
        }
    }

    // Muestra datos del usuario al lado del formulario
    mostrarInfoUsuario() {
        let infoDiv = document.getElementById('info-usuario');

        if (!infoDiv) {
            infoDiv = document.createElement('div');
            infoDiv.id = 'info-usuario';
            document.getElementById('inicio').insertAdjacentElement('afterbegin', infoDiv);
        }

        infoDiv.innerHTML = `
            <div style="background: rgba(0, 217, 255, 0.1); padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #00d9ff;">
                <p style="color: #00d9ff; font-weight: bold;">Usuario: <span style="color: #f5f1e8;">${foro.usuarioActivo.nombre}</span></p>
                <p style="color: #00d9ff; font-weight: bold;">Email: <span style="color: #f5f1e8;">${foro.usuarioActivo.email}</span></p>
                <button id="btn-logout" style="margin-top: 10px;">Cerrar Sesión</button>
            </div>
        `;

        document.getElementById('btn-logout').addEventListener('click', () => this.logout());
    }

    // Cerrar sesión
    logout() {
        foro.usuarioActivo = null;
        foro.guardarDatos();
        this.actualizarEstadoUI();
        this.mostrarMensajeExito('Sesión cerrada');
    }
}

// Interfaz - Renderizar posts, comentarios y tabla de usuarios
// Todo lo visual que se ve dinámicamente

class InterfazUsuario {
    constructor() {
        this.seccionForo = document.getElementById('foro');
        this.seccionAmigos = document.getElementById('amigos');
        this.renderizarPosts();
        this.renderizarUsuarios();
    }

    // Dibuja todos los posts
    renderizarPosts() {
        const contenedor = document.createElement('div');
        contenedor.id = 'posts-container';

        // Limpia posts anteriores que agregamos dinámicamente
        const postsAniguos = this.seccionForo.querySelectorAll('article');
        postsAniguos.forEach(p => {
            if (p.dataset.dinamico === 'true') p.remove();
        });

        if (foro.posts.length === 0) {
            contenedor.innerHTML = '<p style="text-align: center; color: #c9bfa8;">Aún no hay posts. Sé el primero.</p>';
            this.seccionForo.appendChild(contenedor);
            return;
        }

        foro.posts.forEach(post => {
            const article = this.crearElementoPost(post);
            this.seccionForo.appendChild(article);
        });
    }

    // Crea un post individual con botones y comentarios
    crearElementoPost(post) {
        const article = document.createElement('article');
        article.dataset.dinamico = 'true';
        article.dataset.postId = post.id;

        const comentarios = foro.obtenerComentarios(post.id);

        article.innerHTML = `
            <div style="background: rgba(37, 45, 71, 0.5); padding: 15px; border-radius: 8px; border-left: 3px solid #00d9ff;">
                <h3 style="color: #f5f1e8; margin-bottom: 5px;">Post #${post.id}</h3>
                <h4 style="color: #c9bfa8; margin-bottom: 10px;">Por ${post.usuario}</h4>
                <p style="color: #fafaf8; margin-bottom: 15px; line-height: 1.6;">${post.contenido}</p>
                <small style="color: #c9bfa8;">${post.fecha}</small>

                <div style="margin-top: 15px; display: flex; gap: 10px;">
                    <button class="btn-like" data-post-id="${post.id}" style="flex: 1; padding: 8px 12px; background: #00d9ff; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">
                        Like (${post.likes})
                    </button>
                    <button class="btn-dislike" data-post-id="${post.id}" style="flex: 1; padding: 8px 12px; background: #ff00ff; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">
                        Dislike (${post.dislikes})
                    </button>
                    <button class="btn-comentar" data-post-id="${post.id}" style="flex: 1; padding: 8px 12px; background: #f5f1e8; color: #0a0e27; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">
                        Comentar (${comentarios.length})
                    </button>
                </div>

                <div class="comentarios-section" data-post-id="${post.id}" style="margin-top: 20px; display: none;">
                    <h5 style="color: #00d9ff; margin-bottom: 10px;">Comentarios:</h5>
                    <div class="comentarios-lista" style="max-height: 200px; overflow-y: auto; margin-bottom: 15px;">
                        ${this.renderizarComentarios(comentarios)}
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <input type="text" class="input-comentario" data-post-id="${post.id}" placeholder="Escribe un comentario..." 
                               style="flex: 1; padding: 8px 12px; background: rgba(10, 14, 39, 0.6); color: white; border: 1px solid #00d9ff; border-radius: 6px;">
                        <button class="btn-enviar-comentario" data-post-id="${post.id}" style="padding: 8px 16px; background: #00d9ff; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">
                            Enviar
                        </button>
                    </div>
                </div>
            </div>
            <hr style="margin: 20px 0; opacity: 0.3;">
        `;

        // Agregar eventos a los botones
        article.querySelector('.btn-like').addEventListener('click', (e) => this.toggleLike(e));
        article.querySelector('.btn-dislike').addEventListener('click', (e) => this.toggleDislike(e));
        article.querySelector('.btn-comentar').addEventListener('click', (e) => this.toggleComentarios(e));
        article.querySelector('.btn-enviar-comentario').addEventListener('click', (e) => this.enviarComentario(e));

        return article;
    }

    // Dibuja los comentarios de un post
    renderizarComentarios(comentarios) {
        if (comentarios.length === 0) {
            return '<p style="color: #c9bfa8; text-align: center; padding: 10px;">Sin comentarios</p>';
        }

        return comentarios.map(c => `
            <div style="background: rgba(26, 31, 58, 0.6); padding: 10px; border-radius: 6px; margin-bottom: 8px; border-left: 2px solid #ff00ff;">
                <strong style="color: #00d9ff;">${c.usuario}:</strong>
                <p style="color: #fafaf8; margin-top: 5px;">${c.contenido}</p>
                <small style="color: #c9bfa8;">${c.fecha}</small>
            </div>
        `).join('');
    }

    // Muestra o esconde la sección de comentarios
    toggleComentarios(evento) {
        if (!foro.usuarioActivo) {
            alert('Inicia sesión para comentar');
            return;
        }

        const postId = evento.target.dataset.postId;
        const seccion = document.querySelector(`.comentarios-section[data-post-id="${postId}"]`);
        seccion.style.display = seccion.style.display === 'none' ? 'block' : 'none';
    }

    // Envía un comentario nuevo
    enviarComentario(evento) {
        const postId = evento.target.dataset.postId;
        const input = document.querySelector(`.input-comentario[data-post-id="${postId}"]`);
        const contenido = input.value;

        if (!contenido.trim()) {
            alert('Escribe algo');
            return;
        }

        foro.agregarComentario(parseInt(postId), contenido);
        input.value = '';
        this.actualizarComentarios(postId);
    }

    // Actualiza los comentarios sin recargar todo
    actualizarComentarios(postId) {
        const comentarios = foro.obtenerComentarios(parseInt(postId));
        const lista = document.querySelector(`.comentarios-section[data-post-id="${postId}"] .comentarios-lista`);
        lista.innerHTML = this.renderizarComentarios(comentarios);
    }

    // Click en like
    toggleLike(evento) {
        if (!foro.usuarioActivo) {
            alert('Inicia sesión');
            return;
        }

        const postId = parseInt(evento.target.dataset.postId);
        const post = foro.posts.find(p => p.id === postId);

        if (post) {
            post.liked ? post.likes-- : post.likes++;
            post.liked = !post.liked;
            foro.guardarDatos();
            evento.target.textContent = `Like (${post.likes})`;
        }
    }

    // Click en dislike
    toggleDislike(evento) {
        if (!foro.usuarioActivo) {
            alert('Inicia sesión');
            return;
        }

        const postId = parseInt(evento.target.dataset.postId);
        const post = foro.posts.find(p => p.id === postId);

        if (post) {
            post.dislikes++;
            foro.guardarDatos();
            evento.target.textContent = `Dislike (${post.dislikes})`;
        }
    }

    // Renderiza la tabla de usuarios
    renderizarUsuarios() {
        const tabla = this.seccionAmigos.querySelector('table');
        const tbody = tabla.querySelector('tbody') || tabla;

        // Limpia filas de usuarios anteriores
        tabla.querySelectorAll('tr').forEach((tr, i) => {
            if (i > 2) tr.remove();
        });

        foro.usuarios.forEach(usuario => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td style="padding: 10px; border-bottom: 1px solid #c9bfa8;">${usuario.nombre}</td>
                <td style="padding: 10px; border-bottom: 1px solid #c9bfa8;">${usuario.posteos}</td>
                <td style="padding: 10px; border-bottom: 1px solid #c9bfa8;">${usuario.activo}</td>
            `;
            tabla.appendChild(fila);
        });
    }
}

// Inicialización - Todo lo que hace correr el sistema

function inicializarApp() {
    // Agregamos animaciones CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        button {
            transition: all 0.3s ease;
        }

        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 217, 255, 0.3);
        }

        button:active {
            transform: translateY(0);
        }

        input, textarea {
            transition: all 0.3s ease;
        }

        input:focus, textarea:focus {
            transform: scale(1.02);
        }
    `;
    document.head.appendChild(style);

    // Inicializamos las clases principales
    const auth = new Autenticacion();
    window.ui = new InterfazUsuario();
}

// Cuando el HTML está listo, iniciamos todo
document.addEventListener('DOMContentLoaded', inicializarApp);

// Actualizar datos del usuario cada 5 segundos
setInterval(() => {
    if (foro.usuarioActivo) {
        const usuarioActualizado = foro.usuarios.find(u => u.id === foro.usuarioActivo.id);
        if (usuarioActualizado) {
            foro.usuarioActivo = usuarioActualizado;
        }
    }
}, 5000);
