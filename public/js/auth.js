const miFormulario = document.querySelector('form');

miFormulario.addEventListener('submit', (e) => {
	e.preventDefault();
	const formData = {};
	//reviso los campos del form, y si tienen length, creo una propiedad con el name y el value como valor
	for (let el of miFormulario.elements) {
		if (el.name.length > 0) {
			formData[el.name] = el.value;
		}
	}
	fetch('http://localhost:8080/api/auth/login', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(formData),
	})
		.then((resp) => resp.json())
		.then(({ msg, token }) => {
			if (msg) {
				return console.error(msg);
			}
			localStorage.setItem('token', token);
			window.location = 'chat.html';
		})
		.catch((err) => {
			console.log(err);
		});
});

function handleCredentialResponse(response) {
	//Google Token: ID_TOKEN

	const body = { id_token: response.credential };

	fetch('http://localhost:8080/api/auth/google', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(body),
	})
		.then((resp) => resp.json())
		.then(({ token }) => {
			localStorage.setItem('token', token);
			window.location = 'chat.html';
		})
		.catch(console.warn);
}

const button = document.getElementById('google_signout');

button.onclick = () => {
	console.log(google.accounts.id);
	console.log('usuario desconectado');
	google.accounts.id.disableAutoSelect();
	google.accounts.id.revoke(localStorage.getItem('email'), (done) => {
		localStorage.clear();
		location.reload();
	});
};
