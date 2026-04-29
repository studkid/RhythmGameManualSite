function connect() {
    var host = document.getElementById('hostname').value;
    var port = document.getElementById('port').value;
    var game = document.getElementById('game').value;
    var slot = document.getElementById('slot').value;
    var pass = document.getElementById('password').value;

    sessionStorage.setItem('host', host);
    sessionStorage.setItem('port', port);
    sessionStorage.setItem('game', game);
    sessionStorage.setItem('slot', slot);
    sessionStorage.setItem('pass', pass);

    window.location.href = "./client.html"
}