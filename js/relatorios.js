// Executa quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Dados de demonstração para os relatórios
    const dadosDemonstracao = {
        total: 126,
        porStatus: {
            'registrada': 36,
            'em-analise': 28,
            'em-investigacao': 32,
            'encaminhada': 15,
            'concluida': 12,
            'arquivada': 3
        },
        porTipo: {
            'abuso': 32,
            'negligencia': 47,
            'trabalho-infantil': 15,
            'abandono': 18,
            'violencia-domestica': 29,
            'outro': 5
        },
        tempoAnalise: 2.5, // Dias
        tempoConclusao: 18.7, // Dias
        pendentes7dias: 24,
        porRegiao: {
            'Centro': 38,
            'Norte': 24,
            'Sul': 20,
            'Leste': 26,
            'Oeste': 18
        }
    };
    
    // Inicializa as abas
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Remove a classe active de todas as abas e conteúdos
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Adiciona a classe active na aba clicada e no conteúdo correspondente
            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Carrega os dados reais do localStorage (ou usa os de demonstração)
    function carregarDados() {
        const denuncias = recuperarDadosLocalStorage('denuncias');
        
        if (!denuncias || denuncias.length === 0) {
            // Usa os dados de demonstração
            renderizarDados(dadosDemonstracao);
        } else {
            // Processa os dados reais
            const dados = processarDadosReais(denuncias);
            renderizarDados(dados);
        }
    }
    
    // Processa os dados reais das denúncias
    function processarDadosReais(denuncias) {
        const dados = {
            total: denuncias.length,
            porStatus: {},
            porTipo: {},
            tempoAnalise: 0,
            tempoConclusao: 0,
            pendentes7dias: 0,
            porRegiao: {}
        };
        
        // Inicializa contadores
        const statusPossiveis = ['registrada', 'em-analise', 'em-investigacao', 'encaminhada', 'concluida', 'arquivada'];
        const tiposPossiveis = ['abuso', 'negligencia', 'trabalho-infantil', 'abandono', 'violencia-domestica', 'outro'];
        
        statusPossiveis.forEach(s => dados.porStatus[s] = 0);
        tiposPossiveis.forEach(t => dados.porTipo[t] = 0);
        
        // Conta denúncias por status e tipo
        denuncias.forEach(denuncia => {
            // Conta por status
            const status = denuncia.status || 'registrada';
            dados.porStatus[status] = (dados.porStatus[status] || 0) + 1;
            
            // Conta por tipo
            const tipo = denuncia.tipoVulnerabilidade || 'outro';
            dados.porTipo[tipo] = (dados.porTipo[tipo] || 0) + 1;
            
            // Agrupa por região (simplificado - usa a primeira palavra da localização)
            const localizacao = denuncia.localizacao || '';
            const regiao = localizacao.split(' ')[0];
            if (regiao) {
                dados.porRegiao[regiao] = (dados.porRegiao[regiao] || 0) + 1;
            }
            
            // Verifica se está pendente há mais de 7 dias
            if (status !== 'concluida' && status !== 'arquivada') {
                const dataRegistro = new Date(denuncia.dataRegistro);
                const hoje = new Date();
                const diferencaDias = Math.floor((hoje - dataRegistro) / (1000 * 60 * 60 * 24));
                
                if (diferencaDias > 7) {
                    dados.pendentes7dias++;
                }
            }
        });
        
        // Simplificação: valores fixos para demonstração
        dados.tempoAnalise = 3.2; // Dias
        dados.tempoConclusao = 15.6; // Dias
        
        return dados;
    }
    
    // Renderiza os dados nos gráficos e tabelas
    function renderizarDados(dados) {
        // Resumo Geral
        const totalResumo = document.getElementById('total-resumo');
        totalResumo.innerHTML = `
            <h3>Total de Denúncias: ${dados.total}</h3>
            <div style="margin-top: 20px;">
                <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                    <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; flex: 1; min-width: 200px;">
                        <h4>Em Processamento</h4>
                        <p style="font-size: 24px; margin-top: 10px;">
                            ${dados.porStatus['registrada'] + dados.porStatus['em-analise'] + 
                              dados.porStatus['em-investigacao'] + dados.porStatus['encaminhada']}
                        </p>
                    </div>
                    <div style="background-color: #e8f5e9; padding: 15px; border-radius: 8px; flex: 1; min-width: 200px;">
                        <h4>Concluídas</h4>
                        <p style="font-size: 24px; margin-top: 10px;">${dados.porStatus['concluida']}</p>
                    </div>
                    <div style="background-color: #fff3e0; padding: 15px; border-radius: 8px; flex: 1; min-width: 200px;">
                        <h4>Arquivadas</h4>
                        <p style="font-size: 24px; margin-top: 10px;">${dados.porStatus['arquivada']}</p>
                    </div>
                </div>
            </div>
        `;
        
        // Gráfico por Status
        const graficoStatus = document.getElementById('grafico-status');
        graficoStatus.innerHTML = '';
        
        const cores = {
            'registrada': '#bbdefb',
            'em-analise': '#90caf9',
            'em-investigacao': '#42a5f5',
            'encaminhada': '#1e88e5',
            'concluida': '#43a047',
            'arquivada': '#fb8c00'
        };
        
        const statusTraduzido = {
            'registrada': 'Registrada',
            'em-analise': 'Em Análise',
            'em-investigacao': 'Em Investigação',
            'encaminhada': 'Encaminhada',
            'concluida': 'Concluída',
            'arquivada': 'Arquivada'
        };
        
        const totalDenuncias = dados.total;
        
        // Cria as barras do gráfico
        Object.keys(dados.porStatus).forEach(status => {
            const quantidade = dados.porStatus[status];
            const porcentagem = (quantidade / totalDenuncias * 100).toFixed(1);
            const altura = Math.max(quantidade / totalDenuncias * 200, 30); // Altura mínima de 30px
            
            const barra = document.createElement('div');
            barra.style.width = '80px';
            barra.style.height = `${altura}px`;
            barra.style.backgroundColor = cores[status];
            barra.style.margin = '0 5px';
            barra.style.position = 'relative';
            barra.style.borderRadius = '4px 4px 0 0';
            
            const label = document.createElement('div');
            label.style.position = 'absolute';
            label.style.bottom = '-25px';
            label.style.width = '100%';
            label.style.textAlign = 'center';
            label.style.fontSize = '12px';
            label.textContent = statusTraduzido[status];
            
            const valor = document.createElement('div');
            valor.style.position = 'absolute';
            valor.style.width = '100%';
            valor.style.textAlign = 'center';
            valor.style.top = '-20px';
            valor.style.fontSize = '14px';
            valor.style.fontWeight = 'bold';
            valor.textContent = quantidade;
            
            barra.appendChild(label);
            barra.appendChild(valor);
            graficoStatus.appendChild(barra);
        });
        
        // Tabela de Tipos de Vulnerabilidade
        const tabelaTipos = document.getElementById('tabela-tipos').querySelector('tbody');
        tabelaTipos.innerHTML = '';
        
        const tiposTraduzidos = {
            'abuso': 'Abuso físico ou psicológico',
            'negligencia': 'Negligência',
            'trabalho-infantil': 'Trabalho infantil',
            'abandono': 'Abandono',
            'violencia-domestica': 'Violência doméstica',
            'outro': 'Outro'
        };
        
        Object.keys(dados.porTipo).forEach(tipo => {
            const quantidade = dados.porTipo[tipo];
            const porcentagem = (quantidade / totalDenuncias * 100).toFixed(1);
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${tiposTraduzidos[tipo]}</td>
                <td>${quantidade}</td>
                <td>${porcentagem}%</td>
            `;
            
            tabelaTipos.appendChild(tr);
        });
        
        // Métricas de tempo
        document.getElementById('tempo-primeira-analise').textContent = `${dados.tempoAnalise} dias`;
        document.getElementById('tempo-conclusao').textContent = `${dados.tempoConclusao} dias`;
        document.getElementById('pendentes-7dias').textContent = `${dados.pendentes7dias} denúncias`;
        
       
    }
    
    // Carrega os dados ao inicializar
    carregarDados();
});