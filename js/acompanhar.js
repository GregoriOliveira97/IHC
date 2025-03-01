// Executa quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Verifica se há um protocolo na URL (para redirecionamento da página de confirmação)
    const urlParams = new URLSearchParams(window.location.search);
    const protocoloParam = urlParams.get('protocolo');
    
    if (protocoloParam) {
        document.getElementById('protocolo').value = protocoloParam;
    }
    
    // Evento para consultar denúncia
    document.getElementById('consultar-denuncia').addEventListener('click', function() {
        const protocolo = document.getElementById('protocolo').value.trim();
        
        if (!protocolo) {
            alert('Por favor, insira o número de protocolo.');
            return;
        }
        
        // Recupera as denúncias do localStorage
        const denuncias = recuperarDadosLocalStorage('denuncias') || [];
        
        // Busca a denúncia pelo protocolo
        const denuncia = denuncias.find(d => d.protocolo === protocolo);
        
        if (!denuncia) {
            alert('Denúncia não encontrada. Verifique o número de protocolo.');
            return;
        }
        
        // Preenche os resultados
        document.getElementById('protocolo-resultado').textContent = denuncia.protocolo;
        document.getElementById('tipo-resultado').textContent = 
            denuncia.tipoVulnerabilidade === 'outro' ? denuncia.outroTipoTexto : 
            traduzirTipo(denuncia.tipoVulnerabilidade);
        
        const dataRegistro = new Date(denuncia.dataRegistro);
        document.getElementById('data-registro-resultado').textContent = formatarData(dataRegistro);
        
        document.getElementById('status-resultado').innerHTML = 
            `<span class="status status-${denuncia.status}">${traduzirStatus(denuncia.status)}</span>`;
        
        // Última atualização
        if (denuncia.historico && denuncia.historico.length > 0) {
            const ultimaAtualizacao = new Date(denuncia.historico[denuncia.historico.length - 1].data);
            document.getElementById('ultima-atualizacao-resultado').textContent = formatarData(ultimaAtualizacao);
        } else {
            document.getElementById('ultima-atualizacao-resultado').textContent = "Sem atualizações";
        }
        
        // Preenche o histórico
        const historicoLista = document.getElementById('historico-lista');
        historicoLista.innerHTML = '';
        
        if (denuncia.historico && denuncia.historico.length > 0) {
            denuncia.historico.forEach(item => {
                const data = new Date(item.data);
                const li = document.createElement('li');
                li.style.padding = '10px 0';
                li.style.borderBottom = '1px solid #eee';
                li.innerHTML = `<strong>${formatarData(data)}</strong>: ${item.descricao}`;
                historicoLista.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.textContent = "Nenhum histórico disponível.";
            historicoLista.appendChild(li);
        }
        
        // Mostra o resultado
        document.getElementById('resultado-consulta').classList.remove('hidden');
    });
    
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
});