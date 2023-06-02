let usuario = null;
let socket = null;

//referencias HTML

const txtUid = document.querySelector('#txtUid');
const txtMensaje = document.querySelector('#txtMensaje');
const ulUsuarios = document.querySelector('#ulUsuarios');
const ulMensajes = document.querySelector('#ulMensajes');
const btnSalir = document.querySelector('#btnSalir');

//Tomar el token del localStorage y validarlo con la ruta del backend. Se recibe un nuevo token por parte del backend y ese nuevo token es el que se setea en el LS
const conectarSocket = async () => {
	socket = io({
		extraHeaders: {
			'x-token': localStorage.getItem('token'),
		},
	});

	socket.on('connect', () => {
		console.log('Socket online');
	});

	socket.on('disconnect', () => {
		console.log('Socket offline');
	});

	socket.on('recibir-mensajes', dibujarMensajes);

	socket.on('usuarios-activos', dibujarUsuarios);

	socket.on('mensaje-privado', dibujarAlerta);
};

const dibujarAlerta = ({ de, mensaje }) => {
	const mensajeAlert = `Mensaje privado de ${de}: 
	${mensaje}`;

	return alert(mensajeAlert);
};

const dibujarMensajes = (mensajes = []) => {
	let mensajeHtml = '';

	mensajes.forEach(({ nombre, mensaje }) => {
		mensajeHtml += `
<li>
				<p>
					<span class="text-primary">${nombre}: </span>
					<span>${mensaje}</span>
				</p>
			</li>
`;
	});
	ulMensajes.innerHTML = mensajeHtml;
};

const dibujarUsuarios = (usuarios = []) => {
	let usersHtml = '';
	usuarios.forEach(({ nombre, uid }) => {
		usersHtml += `
			<li>
				<p>
					<h5 class="text-success">${nombre}</h5>
					<span class="fs-6 text-muted">${uid}</span>
				</p>
			</li>
	`;
	});
	ulUsuarios.innerHTML = usersHtml;
};

const validarJWT = async () => {
	let token = localStorage.getItem('token') || '';
	if (token.length <= 5) {
		window.location = 'index.html';
		throw new Error('El token suministrado es erroneo');
	}

	const resp = await fetch('http://localhost:8080/api/auth', {
		headers: { 'x-token': token },
	});
	const { usuario: userDB, token: tokenDB } = await resp.json();
	localStorage.setItem('token', tokenDB);
	usuario = userDB;
	document.title = `Bienvenido ${usuario.nombre}`;

	await conectarSocket();
};

txtMensaje.addEventListener('keyup', ({ keyCode }) => {
	const mensaje = txtMensaje.value.trim();
	const uid = txtUid.value.trim() || '';

	if (keyCode !== 13) {
		return;
	}
	if (mensaje.length === 0) {
		return;
	}
	socket.emit('enviar-mensaje', { mensaje, uid });
	txtMensaje.value = '';
});

const main = async () => {
	await validarJWT();
};

main();

//const socket = io();
