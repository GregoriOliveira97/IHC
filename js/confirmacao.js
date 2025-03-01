// Executa quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Recupera o protocolo atual do localStorage
    const protocolo = recuperarDadosLocalStorage('protocolo_atual');
    
    // Se encontrou o protocolo, atualiza na tela
    if (protocolo) {
        document.getElementById('protocolo-gerado').textContent = protocolo;
    }
});