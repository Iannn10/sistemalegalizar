// Mostrar/ocultar senha
document.addEventListener('DOMContentLoaded', function() {
  let senha = document.getElementById('pass');
  let botao = document.getElementById('passwordToggle');
  
  if (botao && senha) {
    botao.addEventListener('click', function() {
      if (senha.type === 'password') {
        senha.type = 'text';
        botao.innerHTML = '👁️‍🗨️';
        botao.title = 'Ocultar senha';
      } else {
        senha.type = 'password';
        botao.innerHTML = '👁️';
        botao.title = 'Mostrar senha';
      }
    });
  }
});
