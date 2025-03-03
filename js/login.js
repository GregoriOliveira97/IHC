// Executa quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Verifica se já existe um usuário logado
    const usuarioLogado = localStorage.getItem('usuarioLogado');
    if (usuarioLogado) {
        // Redireciona para o painel administrativo
        window.location.href = 'admin.html';
        return;
    }
    
    // Inicializa os gestores de demonstração se não existirem
    inicializarGestores();
    
    // Evento para o botão de login
    document.getElementById('btn-login').addEventListener('click', function() {
        const email = document.getElementById('email').value.trim();
        const senha = document.getElementById('senha').value;
        
        if (!email || !senha) {
            mostrarErro('Por favor, preencha todos os campos.');
            return;
        }
        
        // Verifica as credenciais
        if (verificarCredenciais(email, senha)) {
            // Login bem-sucedido
            localStorage.setItem('usuarioLogado', email);
            window.location.href = 'admin.html';
        } else {
            // Login falhou
            mostrarErro('Email ou senha incorretos. Tente novamente.');
        }
    });
    
    // Função para inicializar os gestores de demonstração
    function inicializarGestores() {
        const gestores = recuperarDadosLocalStorage('gestores');
        
        if (!gestores || gestores.length === 0) {
            // Cria gestores padrão para demonstração
            const gestoresPadrao = [
                {
                    nome: 'Administrador',
                    email: 'admin@sosprotecao.org',
                    senha: 'admin123',
                    cargo: 'Administrador'
                },
                {
                    nome: 'Maria Silva',
                    email: 'maria@sosprotecao.org',
                    senha: 'maria123',
                    cargo: 'Assistente Social'
                },
                {
                    nome: 'João Santos',
                    email: 'joao@sosprotecao.org',
                    senha: 'joao123',
                    cargo: 'Coordenador'
                }
            ];
            
            // Salva no localStorage
            localStorage.setItem('gestores', JSON.stringify(gestoresPadrao));
        }
    }
    
    // Função para verificar as credenciais
    function verificarCredenciais(email, senha) {
        const gestores = recuperarDadosLocalStorage('gestores');
        
        if (!gestores) return false;
        
        // Procura por um gestor com o email e senha correspondentes
        const gestorEncontrado = gestores.find(gestor => 
            gestor.email === email && gestor.senha === senha
        );
        
        return !!gestorEncontrado;
    }
    
    // Função para mostrar mensagem de erro
    function mostrarErro(mensagem) {
        const erroElement = document.getElementById('erro-login');
        erroElement.textContent = mensagem;
        erroElement.style.display = 'block';
        
        // Esconde após 5 segundos
        setTimeout(() => {
            erroElement.style.display = 'none';
        }, 5000);
    }
});