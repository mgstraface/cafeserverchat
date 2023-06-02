const { Socket } = require('socket.io');
const { comprobarJWT } = require('../helpers');
const { ChatMensajes } = require('../models');

const chatmensajes = new ChatMensajes();

const socketController = async (socket = new Socket(), io) => {
	const token = socket.handshake.headers['x-token'];
	const usuario = await comprobarJWT(token);

	if (!usuario) {
		return socket.disconnect();
	}
	// Conectar el usuario mediante el método de la clase chatMensajes
	chatmensajes.conectarUsuario(usuario);
	io.emit('usuarios-activos', chatmensajes.usuariosArr);
	socket.emit('recibir-mensajes', chatmensajes.ultimos10);

	//Conectarlo a una sala especial para poder recibir los mensajes privados

	socket.join(usuario.id); // va a estar en 3 salas (sala global, socket.id que es muy volatil, usuario.id)

	// Limpiar cuando un usuario se desconecta
	socket.on('disconnect', () => {
		chatmensajes.desconectarUsuario(usuario.id);
		io.emit('usuarios-activos', chatmensajes.usuariosArr);
	});

	socket.on('enviar-mensaje', ({ uid, mensaje }) => {
		uid
			? socket.to(uid).emit('mensaje-privado', { de: usuario.nombre, mensaje })
			: chatmensajes.enviarMensaje(usuario.id, usuario.nombre, mensaje);
		io.emit('recibir-mensajes', chatmensajes.ultimos10);
	});
};

module.exports = {
	socketController,
};
