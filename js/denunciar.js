// Executa quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Inicialização: data atual no campo de data da ocorrência
    const hoje = new Date();
    const dataFormatada = hoje.toISOString().split('T')[0];
    document.getElementById('data-ocorrencia').value = dataFormatada;
    
    // Toggle para mostrar dados do denunciante
    document.querySelectorAll('input[name="tipo-denuncia"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const dadosDenunciante = document.getElementById('dados-denunciante');
            if (this.value === 'identificada') {
                dadosDenunciante.classList.remove('hidden');
            } else {
                dadosDenunciante.classList.add('hidden');
            }
        });
    });
    
    // Toggle para mostrar campo "outro tipo"
    document.getElementById('tipo-vulnerabilidade').addEventListener('change', function() {
        const outroTipo = document.getElementById('outro-tipo');
        if (this.value === 'outro') {
            outroTipo.classList.remove('hidden');
        } else {
            outroTipo.classList.add('hidden');
        }
    });
    
    // Envio do formulário de denúncia
    document.getElementById('enviar-denuncia').addEventListener('click', function() {
        // Validação básica do formulário
        const descricao = document.getElementById('descricao').value;
        const localizacao = document.getElementById('localizacao').value;
        const dataOcorrencia = document.getElementById('data-ocorrencia').value;
        
        if (!descricao || !localizacao || !dataOcorrencia) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        
        // Coletar todos os dados do formulário
        const tipoDenuncia = document.querySelector('input[name="tipo-denuncia"]:checked').value;
        const tipoVulnerabilidade = document.getElementById('tipo-vulnerabilidade').value;
        
        let outroTipoTexto = '';
        if (tipoVulnerabilidade === 'outro') {
            outroTipoTexto = document.getElementById('outro-especificar').value;
        }
        
        const horaOcorrencia = document.getElementById('hora-ocorrencia').value;
        const informacoesExtras = document.getElementById('informacoes-extras').value;
        
        // Dados do denunciante (se aplicável)
        let nome = '';
        let contato = '';
        if (tipoDenuncia === 'identificada') {
            nome = document.getElementById('nome').value;
            contato = document.getElementById('contato').value;
        }
        
        // Gera um novo protocolo
        const protocolo = gerarProtocolo();
        
        // Cria objeto com os dados da denúncia
        const denuncia = {
            protocolo: protocolo,
            tipoDenuncia: tipoDenuncia,
            nome: nome,
            contato: contato,
            tipoVulnerabilidade: tipoVulnerabilidade,
            outroTipoTexto: outroTipoTexto,
            descricao: descricao,
            localizacao: localizacao,
            dataOcorrencia: dataOcorrencia,
            horaOcorrencia: horaOcorrencia,
            informacoesExtras: informacoesExtras,
            dataRegistro: new Date().toISOString(),
            status: 'registrada',
            historico: [
                {
                    data: new Date().toISOString(),
                    descricao: 'Denúncia registrada no sistema.'
                }
            ]
        };
        
        // Salva a denúncia no localStorage
        const denuncias = recuperarDadosLocalStorage('denuncias') || [];
        denuncias.push(denuncia);
        salvarDadosLocalStorage('denuncias', denuncias);
        
        // Salva o protocolo atual para a página de confirmação
        salvarDadosLocalStorage('protocolo_atual', protocolo);
        
        // Redireciona para a página de confirmação
        window.location.href = 'confirmacao.html';
    });
});