// Executa quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Verifica se existe um usuário logado
    const usuarioLogado = localStorage.getItem('usuarioLogado');
    if (!usuarioLogado) {
        // Redireciona para a página de login
        window.location.href = 'login.html';
        return;
    }
    
    // Exibe o nome do usuário logado
    document.getElementById('usuario-logado').textContent = `Usuário: ${usuarioLogado}`;
    
    // Evento para o botão de logout
    document.getElementById('btn-logout').addEventListener('click', function() {
        localStorage.removeItem('usuarioLogado');
        window.location.href = 'login.html';
    });
    
    // Variável para armazenar a denúncia atual do modal
    let denunciaAtual = null;
    
    // Carrega as denúncias iniciais
    carregarDenuncias();
    
    // Eventos para filtros
    document.getElementById('btn-aplicar-filtros').addEventListener('click', carregarDenuncias);
    
    // Evento para atualizar status da denúncia
    document.getElementById('btn-atualizar-status').addEventListener('click', atualizarStatusDenuncia);
    
    // Evento para fechar o modal
    document.getElementById('fechar-modal').addEventListener('click', function() {
        document.getElementById('modal-denuncia').style.display = 'none';
    });
    
    // Evento de clique fora do modal para fechá-lo
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('modal-denuncia');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Função para carregar denúncias com base nos filtros
    function carregarDenuncias() {
        const filtroStatus = document.getElementById('filtro-status').value;
        const filtroTipo = document.getElementById('filtro-tipo').value;
        const filtroProtocolo = document.getElementById('filtro-protocolo').value.trim();
        
        // Recupera todas as denúncias do localStorage
        const denuncias = recuperarDadosLocalStorage('denuncias') || [];
        
        // Filtra as denúncias conforme os critérios
        const denunciasFiltradas = denuncias.filter(denuncia => {
            // Filtro por protocolo (se especificado)
            if (filtroProtocolo && !denuncia.protocolo.includes(filtroProtocolo)) {
                return false;
            }
            
            // Filtro por status (se não for "todos")
            if (filtroStatus !== 'todos' && denuncia.status !== filtroStatus) {
                return false;
            }
            
            // Filtro por tipo (se não for "todos")
            if (filtroTipo !== 'todos' && denuncia.tipoVulnerabilidade !== filtroTipo) {
                return false;
            }
            
            return true;
        });
        
        // Ordena pela data mais recente primeiro
        denunciasFiltradas.sort((a, b) => new Date(b.dataRegistro) - new Date(a.dataRegistro));
        
        // Renderiza a tabela de denúncias
        renderizarTabelaDenuncias(denunciasFiltradas);
    }
    
    // Função para renderizar a tabela de denúncias
    function renderizarTabelaDenuncias(denuncias) {
        const listaDenuncias = document.getElementById('lista-denuncias');
        const semDenuncias = document.getElementById('sem-denuncias');
        
        // Limpa a tabela
        listaDenuncias.innerHTML = '';
        
        if (denuncias.length === 0) {
            // Mostra mensagem de "sem denúncias"
            semDenuncias.classList.remove('hidden');
            return;
        }
        
        // Esconde mensagem de "sem denúncias"
        semDenuncias.classList.add('hidden');
        
        // Preenche a tabela com as denúncias
        denuncias.forEach(denuncia => {
            const tr = document.createElement('tr');
            
            // Formata as datas
            const dataRegistro = formatarData(new Date(denuncia.dataRegistro));
            
            // Determina a última atualização
            let ultimaAtualizacao = "Sem atualizações";
            if (denuncia.historico && denuncia.historico.length > 0) {
                const dataUltimaAtualizacao = new Date(denuncia.historico[denuncia.historico.length - 1].data);
                ultimaAtualizacao = formatarData(dataUltimaAtualizacao);
            }
            
            // Traduz o tipo de vulnerabilidade
            const tipoTraduzido = traduzirTipo(denuncia.tipoVulnerabilidade);
            
            // Traduz o status
            const statusTraduzido = traduzirStatus(denuncia.status);
            
            // Cria a linha da tabela
            tr.innerHTML = `
                <td>${denuncia.protocolo}</td>
                <td>${dataRegistro}</td>
                <td>${tipoTraduzido}</td>
                <td><span class="status status-${denuncia.status}">${statusTraduzido}</span></td>
                <td>${ultimaAtualizacao}</td>
                <td>
                    <button class="acao-btn btn-visualizar" data-protocolo="${denuncia.protocolo}">
                        Visualizar
                    </button>
                </td>
            `;
            
            listaDenuncias.appendChild(tr);
        });
        
        // Adiciona eventos aos botões de visualizar
        document.querySelectorAll('.btn-visualizar').forEach(botao => {
            botao.addEventListener('click', function() {
                const protocolo = this.getAttribute('data-protocolo');
                abrirModalDenuncia(protocolo);
            });
        });
    }
    
    // Função para abrir o modal com detalhes da denúncia
    function abrirModalDenuncia(protocolo) {
        // Recupera todas as denúncias
        const denuncias = recuperarDadosLocalStorage('denuncias') || [];
        
        // Encontra a denúncia pelo protocolo
        const denuncia = denuncias.find(d => d.protocolo === protocolo);
        
        if (!denuncia) {
            alert('Denúncia não encontrada!');
            return;
        }
        
        // Armazena a denúncia atual para uso no botão de atualização
        denunciaAtual = denuncia;
        
        // Preenche os dados da denúncia no modal
        document.getElementById('modal-protocolo').textContent = denuncia.protocolo;
        document.getElementById('modal-data-registro').textContent = formatarData(new Date(denuncia.dataRegistro));
        document.getElementById('modal-status').innerHTML = 
            `<span class="status status-${denuncia.status}">${traduzirStatus(denuncia.status)}</span>`;
        document.getElementById('modal-tipo').textContent = 
            denuncia.tipoVulnerabilidade === 'outro' ? denuncia.outroTipoTexto : 
            traduzirTipo(denuncia.tipoVulnerabilidade);
        document.getElementById('modal-descricao').textContent = denuncia.descricao || 'Não fornecida';
        document.getElementById('modal-localizacao').textContent = denuncia.localizacao || 'Não fornecida';
        document.getElementById('modal-vulneravel').textContent = denuncia.nomeVulneravel || 'Não identificado';
        
        // Informações do denunciante
        const denuncianteContainer = document.getElementById('modal-denunciante-container');
        if (denuncia.anonimo) {
            denuncianteContainer.style.display = 'none';
        } else {
            denuncianteContainer.style.display = 'block';
            document.getElementById('modal-denunciante').textContent = denuncia.nomeDenunciante || 'Não fornecido';
            document.getElementById('modal-contato').textContent = denuncia.contatoDenunciante || 'Não fornecido';
        }
        
        // Preenche o histórico
        const historicoLista = document.getElementById('modal-historico');
        historicoLista.innerHTML = '';
        
        if (denuncia.historico && denuncia.historico.length > 0) {
            denuncia.historico.forEach(item => {
                const data = new Date(item.data);
                const li = document.createElement('li');
                li.innerHTML = `<strong>${formatarData(data)}</strong>: ${item.descricao}`;
                historicoLista.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.textContent = "Nenhum histórico disponível.";
            historicoLista.appendChild(li);
        }
        
        // Define o status atual no select
        document.getElementById('novo-status').value = denuncia.status;
        
        // Exibe o modal
        document.getElementById('modal-denuncia').style.display = 'block';
    }
    
    // Função para atualizar o status de uma denúncia
    function atualizarStatusDenuncia() {
        if (!denunciaAtual) {
            alert('Erro: Nenhuma denúncia selecionada!');
            return;
        }
        
        const novoStatus = document.getElementById('novo-status').value;
        const observacao = document.getElementById('observacao').value.trim();
        
        if (!observacao) {
            alert('Por favor, adicione uma observação para a atualização.');
            return;
        }
        
        // Recupera todas as denúncias
        const denuncias = recuperarDadosLocalStorage('denuncias') || [];
        
        // Encontra o índice da denúncia atual
        const index = denuncias.findIndex(d => d.protocolo === denunciaAtual.protocolo);
        
        if (index === -1) {
            alert('Erro: Denúncia não encontrada!');
            return;
        }
        
        // Atualiza o status
        denuncias[index].status = novoStatus;
        
        // Cria um novo item de histórico
        const novoHistorico = {
            data: new Date().toISOString(),
            descricao: `Status alterado para "${traduzirStatus(novoStatus)}". Observação: ${observacao}`,
            usuarioResponsavel: localStorage.getItem('usuarioLogado')
        };
        
        // Adiciona o novo histórico
        if (!denuncias[index].historico) {
            denuncias[index].historico = [];
        }
        
        denuncias[index].historico.push(novoHistorico);
        
        // Salva as alterações no localStorage
        localStorage.setItem('denuncias', JSON.stringify(denuncias));
        
        // Atualiza a visualização
        alert('Status atualizado com sucesso!');
        
        // Atualiza a denúncia atual
        denunciaAtual = denuncias[index];
        
        // Fecha o modal e recarrega a lista
        document.getElementById('modal-denuncia').style.display = 'none';
        carregarDenuncias();
    }
    
    // Função para traduzir o tipo de vulnerabilidade
    function traduzirTipo(tipo) {
        const tipos = {
            'abuso': 'Abuso físico ou psicológico',
            'negligencia': 'Negligência',
            'trabalho-infantil': 'Trabalho infantil',
            'abandono': 'Abandono',
            'violencia-domestica': 'Violência doméstica',
            'outro': 'Outro'
        };
        
        return tipos[tipo] || tipo;
    }
    
    // Função para traduzir o status
    function traduzirStatus(status) {
        const statusMap = {
            'registrada': 'Registrada',
            'em-analise': 'Em Análise',
            'em-investigacao': 'Em Investigação',
            'encaminhada': 'Encaminhada',
            'concluida': 'Concluída',
            'arquivada': 'Arquivada'
        };
        return statusMap[status] || status;
    }
    
    // Função para formatar data
    function formatarData(data) {
        if (!(data instanceof Date) || isNaN(data)) {
            return 'Data inválida';
        }
        
        return data.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
});

// Função para recuperar dados do localStorage
function recuperarDadosLocalStorage(chave) {
    const dados = localStorage.getItem(chave);
    
    if (!dados) {
        return null;
    }
    
    try {
        return JSON.parse(dados);
    } catch (erro) {
        console.error(`Erro ao analisar dados do localStorage (${chave}):`, erro);
        return null;
    }
}

// Adiciona estilo CSS para os status
document.addEventListener('DOMContentLoaded', function() {
    // Cria um elemento de estilo
    const estiloStatus = document.createElement('style');
    
    // Define os estilos para cada tipo de status
    estiloStatus.textContent = `
        .status {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            text-align: center;
        }
        
        .status-registrada {
            background-color: #e3f2fd;
            color: #1565c0;
        }
        
        .status-em-analise {
            background-color: #fff8e1;
            color: #f57f17;
        }
        
        .status-em-investigacao {
            background-color: #ede7f6;
            color: #5e35b1;
        }
        
        .status-encaminhada {
            background-color: #e8f5e9;
            color: #2e7d32;
        }
        
        .status-concluida {
            background-color: #e8f5e9;
            color: #2e7d32;
        }
        
        .status-arquivada {
            background-color: #fafafa;
            color: #757575;
        }
        
        .hidden {
            display: none;
        }
    `;
    
    // Adiciona o estilo ao cabeçalho
    document.head.appendChild(estiloStatus);
});

// Função para gerar um protocolo de acompanhamento de demonstração
function gerarProtocoloDemonstracao() {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let protocolo = '';
    
    // Gera 10 caracteres aleatórios
    for (let i = 0; i < 10; i++) {
        const indice = Math.floor(Math.random() * caracteres.length);
        protocolo += caracteres.charAt(indice);
    }
    
    return protocolo;
}

// Função para adicionar denúncias de demonstração (caso não existam)
function adicionarDenunciasDemonstracao() {
    const denuncias = recuperarDadosLocalStorage('denuncias');
    
    // Só adiciona denúncias de demonstração se não existirem
    if (!denuncias || denuncias.length === 0) {
        const denunciasDemonstracao = [
            {
                protocolo: 'DEM20250301',
                dataRegistro: new Date('2025-03-01T10:15:00').toISOString(),
                tipoVulnerabilidade: 'negligencia',
                descricao: 'Criança aparentemente sem supervisão adequada durante longos períodos.',
                localizacao: 'Rua das Flores, 123, Bairro Centro',
                nomeVulneravel: 'Criança (aprox. 7 anos)',
                anonimo: true,
                status: 'registrada',
                historico: [
                    {
                        data: new Date('2025-03-01T10:15:00').toISOString(),
                        descricao: 'Denúncia registrada no sistema.',
                        usuarioResponsavel: 'Sistema'
                    }
                ]
            },
            {
                protocolo: 'DEM20250227',
                dataRegistro: new Date('2025-02-27T15:30:00').toISOString(),
                tipoVulnerabilidade: 'violencia-domestica',
                descricao: 'Relatos de gritos e discussões frequentes, com possível violência contra idoso.',
                localizacao: 'Avenida Principal, 456, Apto 302, Bairro Jardim',
                nomeVulneravel: 'Idoso (aprox. 75 anos)',
                nomeDenunciante: 'Maria da Silva',
                contatoDenunciante: 'maria.silva@email.com',
                anonimo: false,
                status: 'em-analise',
                historico: [
                    {
                        data: new Date('2025-02-27T15:30:00').toISOString(),
                        descricao: 'Denúncia registrada no sistema.',
                        usuarioResponsavel: 'Sistema'
                    },
                    {
                        data: new Date('2025-02-28T09:45:00').toISOString(),
                        descricao: 'Status alterado para "Em Análise". Observação: Caso encaminhado para avaliação inicial.',
                        usuarioResponsavel: 'joao@sosprotecao.org'
                    }
                ]
            },
            {
                protocolo: 'DEM20250224',
                dataRegistro: new Date('2025-02-24T08:10:00').toISOString(),
                tipoVulnerabilidade: 'trabalho-infantil',
                descricao: 'Crianças trabalhando na feira local, aparentemente vendendo produtos durante horário escolar.',
                localizacao: 'Feira Municipal, Rua do Comércio, Bairro Mercado',
                nomeVulneravel: 'Múltiplas crianças (entre 8-12 anos)',
                anonimo: true,
                status: 'em-investigacao',
                historico: [
                    {
                        data: new Date('2025-02-24T08:10:00').toISOString(),
                        descricao: 'Denúncia registrada no sistema.',
                        usuarioResponsavel: 'Sistema'
                    },
                    {
                        data: new Date('2025-02-24T14:20:00').toISOString(),
                        descricao: 'Status alterado para "Em Análise". Observação: Denúncia requer verificação in loco.',
                        usuarioResponsavel: 'maria@sosprotecao.org'
                    },
                    {
                        data: new Date('2025-02-26T10:30:00').toISOString(),
                        descricao: 'Status alterado para "Em Investigação". Observação: Equipe designada para visita ao local na próxima feira (dia 28/02).',
                        usuarioResponsavel: 'joao@sosprotecao.org'
                    }
                ]
            },
            {
                protocolo: 'DEM20250220',
                dataRegistro: new Date('2025-02-20T17:45:00').toISOString(),
                tipoVulnerabilidade: 'abuso',
                descricao: 'Adolescente com sinais de abuso físico observados na escola. Marcas nos braços e comportamento retraído.',
                localizacao: 'Escola Municipal João Paulo, Bairro Esperança',
                nomeVulneravel: 'Adolescente, 14 anos',
                nomeDenunciante: 'Conselho Tutelar',
                contatoDenunciante: 'conselho@tutelar.org',
                anonimo: false,
                status: 'encaminhada',
                historico: [
                    {
                        data: new Date('2025-02-20T17:45:00').toISOString(),
                        descricao: 'Denúncia registrada no sistema.',
                        usuarioResponsavel: 'Sistema'
                    },
                    {
                        data: new Date('2025-02-21T08:30:00').toISOString(),
                        descricao: 'Status alterado para "Em Análise". Observação: Caso prioritário devido à natureza da denúncia.',
                        usuarioResponsavel: 'maria@sosprotecao.org'
                    },
                    {
                        data: new Date('2025-02-21T15:10:00').toISOString(),
                        descricao: 'Status alterado para "Em Investigação". Observação: Contato feito com a escola para mais informações.',
                        usuarioResponsavel: 'joao@sosprotecao.org'
                    },
                    {
                        data: new Date('2025-02-22T14:25:00').toISOString(),
                        descricao: 'Status alterado para "Encaminhada". Observação: Caso encaminhado ao CREAS e Ministério Público para medidas de proteção.',
                        usuarioResponsavel: 'admin@sosprotecao.org'
                    }
                ]
            },
            {
                protocolo: 'DEM20250215',
                dataRegistro: new Date('2025-02-15T09:20:00').toISOString(),
                tipoVulnerabilidade: 'outro',
                outroTipoTexto: 'Idoso em situação de rua',
                descricao: 'Idoso em situação de vulnerabilidade, vivendo nas ruas do centro da cidade, aparentemente com problemas de saúde mental.',
                localizacao: 'Praça Central, próximo à Igreja Matriz',
                nomeVulneravel: 'Idoso não identificado (aprox. 70 anos)',
                anonimo: true,
                status: 'concluida',
                historico: [
                    {
                        data: new Date('2025-02-15T09:20:00').toISOString(),
                        descricao: 'Denúncia registrada no sistema.',
                        usuarioResponsavel: 'Sistema'
                    },
                    {
                        data: new Date('2025-02-15T11:30:00').toISOString(),
                        descricao: 'Status alterado para "Em Análise". Observação: Equipe de abordagem de rua notificada.',
                        usuarioResponsavel: 'joao@sosprotecao.org'
                    },
                    {
                        data: new Date('2025-02-16T14:45:00').toISOString(),
                        descricao: 'Status alterado para "Em Investigação". Observação: Equipe realizou abordagem e identificou o idoso como Sr. José da Silva, 68 anos.',
                        usuarioResponsavel: 'maria@sosprotecao.org'
                    },
                    {
                        data: new Date('2025-02-18T10:15:00').toISOString(),
                        descricao: 'Status alterado para "Encaminhada". Observação: Idoso encaminhado ao Centro de Referência para acolhimento e cuidados de saúde.',
                        usuarioResponsavel: 'joao@sosprotecao.org'
                    },
                    {
                        data: new Date('2025-02-25T16:30:00').toISOString(),
                        descricao: 'Status alterado para "Concluída". Observação: Idoso acolhido na instituição Casa do Idoso com todos os cuidados necessários garantidos.',
                        usuarioResponsavel: 'admin@sosprotecao.org'
                    }
                ]
            }
        ];
        
        // Salva as denúncias no localStorage
        localStorage.setItem('denuncias', JSON.stringify(denunciasDemonstracao));
    }
}

// Adiciona denúncias de demonstração ao carregar o painel
document.addEventListener('DOMContentLoaded', function() {
    // Verifica se o usuário está logado
    if (localStorage.getItem('usuarioLogado')) {
        adicionarDenunciasDemonstracao();
    }
});