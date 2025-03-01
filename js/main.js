// Função para formatar datas
function formatarData(data) {
    const dia = data.getDate().toString().padStart(2, '0');
    const mes = (data.getMonth() + 1).toString().padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
}

// Geração de número de protocolo aleatório
function gerarProtocolo() {
    const ano = new Date().getFullYear();
    const num1 = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const num2 = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${ano}-${num1}-${num2}`;
}

// Função para salvar dados no localStorage
function salvarDadosLocalStorage(chave, dados) {
    localStorage.setItem(chave, JSON.stringify(dados));
}

// Função para recuperar dados do localStorage
function recuperarDadosLocalStorage(chave) {
    const dados = localStorage.getItem(chave);
    return dados ? JSON.parse(dados) : null;
}

// Atualiza o menu ativo
function atualizarMenuAtivo() {
    const pagina = window.location.pathname.split('/').pop().replace('.html', '');
    
    document.querySelectorAll('nav ul li a').forEach(link => {
        link.classList.remove('active');
        
        const linkPagina = link.getAttribute('href').replace('.html', '');
        if (linkPagina === pagina || (pagina === '' && linkPagina === 'index')) {
            link.classList.add('active');
        }
    });
}

// Executa quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    atualizarMenuAtivo();
});