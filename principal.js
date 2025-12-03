/* ============================================
   SISTEMA LEGALIZAR - Versão Ultra Simplificada
   ============================================ */

// Variáveis globais
let empresas = [];
let licencas = [];

// ============================================
// DADOS
// ============================================

function carregarDados() {
  let emp = localStorage.getItem('empresas');
  if (emp) empresas = JSON.parse(emp);
  
  let lic = localStorage.getItem('licencas');
  if (lic) licencas = JSON.parse(lic);
}

function salvarDados() {
  localStorage.setItem('empresas', JSON.stringify(empresas));
  localStorage.setItem('licencas', JSON.stringify(licencas));
}

// ============================================
// FORMATAÇÃO
// ============================================

function formatarCPF(v) {
  let n = v.replace(/\D/g, '');
  if (n.length > 11) n = n.substring(0, 11);
  if (n.length > 0) return n.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  return v;
}

function formatarCNPJ(v) {
  let n = v.replace(/\D/g, '');
  if (n.length > 14) n = n.substring(0, 14);
  if (n.length > 0) return n.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  return v;
}

function formatarTelefone(v) {
  let n = v.replace(/\D/g, '');
  if (n.length > 11) n = n.substring(0, 11);
  if (n.length === 11) return n.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  if (n.length === 10) return n.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  return v;
}

function formatarData(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('pt-BR');
}

// ============================================
// MÁSCARAS
// ============================================

function configurarMascaras() {
  let cpf = document.getElementById('cpf');
  if (cpf) cpf.addEventListener('input', () => cpf.value = formatarCPF(cpf.value));
  
  let cnpj = document.getElementById('cnpj');
  if (cnpj) cnpj.addEventListener('input', () => cnpj.value = formatarCNPJ(cnpj.value));
  
  let tel = document.getElementById('telefone');
  if (tel) tel.addEventListener('input', () => tel.value = formatarTelefone(tel.value));
}

// ============================================
// CADASTROS
// ============================================

function cadastrarEmpresa(e) {
  e.preventDefault();
  let nome = document.getElementById('nomeEmpresa').value;
  let cpf = document.getElementById('cpf').value.replace(/\D/g, '');
  let cnpj = document.getElementById('cnpj').value.replace(/\D/g, '');
  let tel = document.getElementById('telefone').value.replace(/\D/g, '');
  
  empresas.push({
    id: Date.now().toString(),
    nome: nome,
    cpf: cpf,
    cnpj: cnpj,
    telefone: tel,
    dataCadastro: new Date().toISOString()
  });
  
  salvarDados();
  document.getElementById('formEmpresa').reset();
  atualizarSelectEmpresas();
  mostrarEmpresas();
  atualizarDashboard();
  alert('Empresa cadastrada!');
}

function cadastrarLicenca(e) {
  e.preventDefault();
  let empresaId = document.getElementById('empresaId').value;
  let tipo = document.getElementById('tipoLicenca').value;
  let emissao = document.getElementById('dataEmissao').value;
  let validade = document.getElementById('dataValidade').value;
  
  let nomeEmpresa = null;
  if (empresaId) {
    for (let i = 0; i < empresas.length; i++) {
      if (empresas[i].id === empresaId) {
        nomeEmpresa = empresas[i].nome;
        break;
      }
    }
  }
  
  licencas.push({
    id: Date.now().toString(),
    empresaId: empresaId || null,
    empresaNome: nomeEmpresa,
    tipo: tipo,
    dataEmissao: emissao,
    dataValidade: validade,
    dataCadastro: new Date().toISOString()
  });
  
  salvarDados();
  document.getElementById('formLicenca').reset();
  mostrarLicencas();
  atualizarDashboard();
  alert('Licença cadastrada!');
}

// ============================================
// EXIBIÇÃO
// ============================================

function atualizarSelectEmpresas() {
  let sel = document.getElementById('empresaId');
  if (!sel) return;
  sel.innerHTML = '<option value="">Selecione uma empresa</option>';
  for (let i = 0; i < empresas.length; i++) {
    let op = document.createElement('option');
    op.value = empresas[i].id;
    op.textContent = empresas[i].nome;
    sel.appendChild(op);
  }
}

function atualizarDashboard() {
  document.getElementById('totalEmpresas').textContent = empresas.length;
  document.getElementById('totalLicencas').textContent = licencas.length;
  
  let hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  let ativas = 0, vencidas = 0, proximas = 0;
  
  for (let i = 0; i < licencas.length; i++) {
    let dv = new Date(licencas[i].dataValidade);
    dv.setHours(0, 0, 0, 0);
    if (dv < hoje) vencidas++;
    else {
      let dias = Math.ceil((dv - hoje) / (1000 * 60 * 60 * 24));
      if (dias <= 30) proximas++;
      else ativas++;
    }
  }
  
  document.getElementById('licencasAtivas').textContent = ativas;
  document.getElementById('licencasVencidas').textContent = vencidas;
  document.getElementById('licencasProximas').textContent = proximas;
  mostrarAlertas();
}

function mostrarAlertas() {
  let cont = document.getElementById('alertasContainer');
  if (!cont) return;
  cont.innerHTML = '';
  
  let hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  let aviso = new Date();
  aviso.setDate(aviso.getDate() + 30);
  
  for (let i = 0; i < licencas.length; i++) {
    let dv = new Date(licencas[i].dataValidade);
    dv.setHours(0, 0, 0, 0);
    
    if (dv < hoje) {
      let d = document.createElement('div');
      d.className = 'alerta alerta-vencida';
      d.innerHTML = '<div class="alerta-icon">⚠️</div><div class="alerta-content"><strong>' + 
                   (licencas[i].empresaNome || 'Sem empresa') + '</strong><p>Licença ' + 
                   licencas[i].tipo + ' vencida em ' + formatarData(licencas[i].dataValidade) + '</p></div>';
      cont.appendChild(d);
    } else if (dv <= aviso) {
      let dias = Math.ceil((dv - hoje) / (1000 * 60 * 60 * 24));
      let d = document.createElement('div');
      d.className = 'alerta alerta-proxima';
      d.innerHTML = '<div class="alerta-icon">🔔</div><div class="alerta-content"><strong>' + 
                   (licencas[i].empresaNome || 'Sem empresa') + '</strong><p>Licença ' + 
                   licencas[i].tipo + ' vence em ' + dias + ' dias</p></div>';
      cont.appendChild(d);
    }
  }
  
  if (cont.innerHTML === '') {
    cont.innerHTML = '<p class="sem-alertas">Nenhum alerta no momento.</p>';
  }
}

function mostrarEmpresas() {
  let cont = document.getElementById('listaEmpresas');
  if (!cont) return;
  
  let busca = '';
  let campo = document.getElementById('buscaEmpresa');
  if (campo) busca = campo.value.toLowerCase();
  
  let html = '';
  let achou = false;
  
  for (let i = 0; i < empresas.length; i++) {
    let emp = empresas[i];
    let nome = emp.nome.toLowerCase();
    if (busca === '' || nome.indexOf(busca) !== -1 || emp.cpf.indexOf(busca) !== -1 || emp.cnpj.indexOf(busca) !== -1) {
      achou = true;
      html += '<tr><td>' + emp.nome + '</td><td>' + formatarCPF(emp.cpf) + '</td><td>' + 
              formatarCNPJ(emp.cnpj) + '</td><td>' + formatarTelefone(emp.telefone) + '</td><td>' + 
              formatarData(emp.dataCadastro) + '</td><td><button class="btn-action btn-ver" onclick="verEmpresa(\'' + 
              emp.id + '\')">Ver</button><button class="btn-action btn-excluir" onclick="excluirEmpresa(\'' + 
              emp.id + '\')">Excluir</button></td></tr>';
    }
  }
  
  cont.innerHTML = achou ? html : '<tr><td colspan="6" class="sem-dados">Nenhuma empresa encontrada.</td></tr>';
}

function mostrarLicencas() {
  let cont = document.getElementById('listaLicencas');
  if (!cont) return;
  
  let busca = '';
  let campo = document.getElementById('buscaLicenca');
  if (campo) busca = campo.value.toLowerCase();
  
  let filtro = 'todas';
  let filt = document.getElementById('filtroStatus');
  if (filt) filtro = filt.value;
  
  let hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  let aviso = new Date();
  aviso.setDate(aviso.getDate() + 30);
  
  let html = '';
  let achou = false;
  
  for (let i = 0; i < licencas.length; i++) {
    let lic = licencas[i];
    let tipo = lic.tipo.toLowerCase();
    let emp = lic.empresaNome ? lic.empresaNome.toLowerCase() : '';
    if (busca !== '' && tipo.indexOf(busca) === -1 && emp.indexOf(busca) === -1) continue;
    
    let dv = new Date(lic.dataValidade);
    dv.setHours(0, 0, 0, 0);
    let status = dv < hoje ? 'vencida' : (dv <= aviso ? 'proxima' : 'ativa');
    if (filtro !== 'todas' && filtro !== status) continue;
    
    achou = true;
    let statusTexto = status === 'vencida' ? 'Vencida' : (status === 'proxima' ? 'Próxima' : 'Ativa');
    html += '<tr><td>' + lic.tipo + '</td><td>' + (lic.empresaNome || 'Sem empresa') + '</td><td>' + 
            formatarData(lic.dataEmissao) + '</td><td>' + formatarData(lic.dataValidade) + '</td><td>' +
            '<span class="badge badge-' + status + '">' + statusTexto + '</span></td><td>' +
            '<button class="btn-action btn-ver" onclick="verLicenca(\'' + lic.id + '\')">Ver</button>' +
            '<button class="btn-action btn-excluir" onclick="excluirLicenca(\'' + lic.id + '\')">Excluir</button></td></tr>';
  }
  
  cont.innerHTML = achou ? html : '<tr><td colspan="6" class="sem-dados">Nenhuma licença encontrada.</td></tr>';
}

// ============================================
// AÇÕES
// ============================================

function verEmpresa(id) {
  for (let i = 0; i < empresas.length; i++) {
    if (empresas[i].id === id) {
      let emp = empresas[i];
      let total = 0;
      for (let j = 0; j < licencas.length; j++) {
        if (licencas[j].empresaId === id) total++;
      }
      alert('Empresa: ' + emp.nome + '\nCPF: ' + formatarCPF(emp.cpf) + '\nCNPJ: ' + 
            formatarCNPJ(emp.cnpj) + '\nTelefone: ' + formatarTelefone(emp.telefone) + '\nLicenças: ' + total);
      break;
    }
  }
}

function verLicenca(id) {
  for (let i = 0; i < licencas.length; i++) {
    if (licencas[i].id === id) {
      let lic = licencas[i];
      let dv = new Date(lic.dataValidade);
      let hoje = new Date();
      let dias = Math.ceil((dv - hoje) / (1000 * 60 * 60 * 24));
      alert('Tipo: ' + lic.tipo + '\nEmpresa: ' + (lic.empresaNome || 'Sem empresa') + '\nEmissão: ' + 
            formatarData(lic.dataEmissao) + '\nValidade: ' + formatarData(lic.dataValidade) + '\nDias restantes: ' + 
            (dias > 0 ? dias : 'Vencida'));
      break;
    }
  }
}

function excluirEmpresa(id) {
  if (!confirm('Excluir esta empresa?')) return;
  let novas = [];
  for (let i = 0; i < empresas.length; i++) {
    if (empresas[i].id !== id) novas.push(empresas[i]);
  }
  empresas = novas;
  novas = [];
  for (let i = 0; i < licencas.length; i++) {
    if (licencas[i].empresaId !== id) novas.push(licencas[i]);
  }
  licencas = novas;
  salvarDados();
  atualizarSelectEmpresas();
  mostrarEmpresas();
  mostrarLicencas();
  atualizarDashboard();
  alert('Empresa excluída!');
}

function excluirLicenca(id) {
  if (!confirm('Excluir esta licença?')) return;
  let novas = [];
  for (let i = 0; i < licencas.length; i++) {
    if (licencas[i].id !== id) novas.push(licencas[i]);
  }
  licencas = novas;
  salvarDados();
  mostrarLicencas();
  atualizarDashboard();
  alert('Licença excluída!');
}

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  carregarDados();
  configurarMascaras();
  
  let fe = document.getElementById('formEmpresa');
  if (fe) fe.addEventListener('submit', cadastrarEmpresa);
  
  let fl = document.getElementById('formLicenca');
  if (fl) fl.addEventListener('submit', cadastrarLicenca);
  
  let be = document.getElementById('buscaEmpresa');
  if (be) be.addEventListener('input', mostrarEmpresas);
  
  let bl = document.getElementById('buscaLicenca');
  if (bl) bl.addEventListener('input', mostrarLicencas);
  
  let fs = document.getElementById('filtroStatus');
  if (fs) fs.addEventListener('change', mostrarLicencas);
  
  atualizarSelectEmpresas();
  atualizarDashboard();
  mostrarEmpresas();
  mostrarLicencas();
});
