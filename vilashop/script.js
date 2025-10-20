// script.js COMPLETO E CORRIGIDO

// -------------------- ELEMENTOS DO DOM --------------------
const carrinhoBtn = document.getElementById('carrinho-btn');
const carrinhoSidebar = document.getElementById('carrinho-sidebar');
const fecharCarrinhoBtn = document.getElementById('fechar-carrinho');
const carrinhoItens = document.getElementById('carrinho-itens');
const subtotalValor = document.getElementById('subtotal-valor');
const totalValor = document.getElementById('total-valor');
const finalizarCompraBtn = document.getElementById('finalizar-compra');

const checkoutSection = document.getElementById('checkout-section');
const checkoutSteps = document.querySelectorAll('.checkout-step');
const btnProximo = document.querySelectorAll('.btn-proximo');
const opcoesPagamento = document.querySelectorAll('.opcao-pagamento');

const paymentOverlay = document.getElementById('payment-overlay');
const closeOverlay = document.getElementById('close-overlay');
const pixScreen = document.getElementById('pix-screen');
const cardScreen = document.getElementById('card-screen');
const successScreen = document.getElementById('success-screen');
const confirmPix = document.getElementById('confirm-pix');
const payCard = document.getElementById('pay-card');
const finishBtn = document.getElementById('finish-btn');

const resumoItens = document.getElementById('resumo-itens');
const totalProdutos = document.getElementById('total-produtos');
const totalDesconto = document.getElementById('total-desconto');
const totalGeral = document.getElementById('total-geral');
const aplicarCupom = document.getElementById('aplicar-cupom');
const codigoCupom = document.getElementById('codigo-cupom');

// Modal de seleção de sabor
const saborModal = document.createElement('div');
saborModal.id = 'sabor-modal';
saborModal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.8);
    display: none;
    justify-content: center;
    align-items: center;
    z-index: 2000;
`;

saborModal.innerHTML = `
    <div class="modal-content" style="background: #1a1a1a; padding: 2rem; border-radius: 12px; max-width: 500px; width: 90%; border: 2px solid #333;">
        <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <h3 style="color: #ff6b6b;">Escolha o Sabor</h3>
            <button id="fechar-sabor" style="background: none; border: none; color: #fff; font-size: 1.5rem; cursor: pointer;">✕</button>
        </div>
        <div class="modal-body">
            <div id="sabor-produto-info" style="text-align: center; margin-bottom: 1.5rem;">
                <img id="sabor-produto-img" src="" style="width: 80px; height: 80px; border-radius: 8px; margin-bottom: 0.5rem;">
                <h4 id="sabor-produto-nome" style="color: #fff; margin-bottom: 0.5rem;"></h4>
                <p id="sabor-produto-preco" style="color: #ff6b6b; font-weight: bold;"></p>
            </div>
            <div id="sabores-lista" style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 1.5rem;"></div>
            <button id="confirmar-sabor" style="background: #ff6b6b; color: white; border: none; padding: 1rem; border-radius: 8px; cursor: pointer; font-weight: bold; width: 100%;">Confirmar Sabor</button>
        </div>
    </div>
`;

document.body.appendChild(saborModal);

// -------------------- VARIÁVEIS GLOBAIS --------------------
let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
let cupomAplicado = false;
let descontoCupom = 0;
let produtoSelecionado = null;
let saborSelecionado = null;

// -------------------- INICIALIZAÇÃO --------------------
document.addEventListener('DOMContentLoaded', () => {
    atualizarCarrinho();
    inicializarEventListeners();
    configurarPesquisa();
    configurarPaginacao();
});

function inicializarEventListeners() {
    // Carrinho
    carrinhoBtn.addEventListener('click', abrirCarrinho);
    fecharCarrinhoBtn.addEventListener('click', fecharCarrinho);
    finalizarCompraBtn.addEventListener('click', iniciarCheckout);
    
    // Checkout
    btnProximo.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const nextStep = e.target.dataset.next;
            avancarEtapa(nextStep);
        });
    });
    
    // Pagamento
    opcoesPagamento.forEach(opcao => {
        opcao.addEventListener('click', (e) => {
            selecionarPagamento(e.target.closest('.opcao-pagamento').dataset.metodo);
        });
    });
    
    // Overlay de pagamento
    closeOverlay.addEventListener('click', fecharOverlay);
    confirmPix.addEventListener('click', finalizarPagamentoPix);
    payCard.addEventListener('click', finalizarPagamentoCartao);
    finishBtn.addEventListener('click', () => {
        fecharOverlay();
        limparCarrinho();
        window.location.href = '#produtos';
    });
    
    // Cupom
    aplicarCupom.addEventListener('click', aplicarCupomDesconto);
    
    // Botões comprar - AGORA ABRE MODAL DE SABOR
    document.querySelectorAll('.btn-comprar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const itemData = JSON.parse(e.target.dataset.item);
            abrirModalSabor(itemData);
        });
    });
    
    // Modal de sabor
    document.getElementById('fechar-sabor').addEventListener('click', fecharModalSabor);
    document.getElementById('confirmar-sabor').addEventListener('click', confirmarSabor);
    
    // Fechar modal ao clicar fora
    saborModal.addEventListener('click', (e) => {
        if (e.target === saborModal) {
            fecharModalSabor();
        }
    });
}

// ================= PAGINAÇÃO =================
function configurarPaginacao() {
    const paginaBtns = document.querySelectorAll('.pagina-btn');
    const produtos = document.querySelectorAll('.produto-card');
    
    // Mostrar apenas produtos da página 1 inicialmente
    mostrarPagina(1);
    
    // Adicionar event listeners aos botões de página
    paginaBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const pagina = parseInt(e.target.dataset.pagina);
            mostrarPagina(pagina);
            
            // Atualizar botões ativos
            paginaBtns.forEach(b => b.classList.remove('ativa'));
            e.target.classList.add('ativa');
        });
    });
}

function mostrarPagina(pagina) {
    const produtos = document.querySelectorAll('.produto-card');
    
    produtos.forEach(produto => {
        const produtoPagina = parseInt(produto.dataset.page);
        if (produtoPagina === pagina) {
            produto.style.display = 'block';
        } else {
            produto.style.display = 'none';
        }
    });
}

// -------------------- MODAL DE SELEÇÃO DE SABOR --------------------
function abrirModalSabor(itemData) {
    produtoSelecionado = itemData;
    saborSelecionado = null;
    
    // Preencher informações do produto
    document.getElementById('sabor-produto-img').src = itemData.imagem;
    document.getElementById('sabor-produto-nome').textContent = itemData.nome;
    document.getElementById('sabor-produto-preco').textContent = `R$ ${itemData.preco.toFixed(2)}`;
    
    // Preencher sabores disponíveis (pegando do data-item ou usando padrão)
    const saboresLista = document.getElementById('sabores-lista');
    saboresLista.innerHTML = '';
    
    const sabores = itemData.sabores || [
        'Gummylicious (chiclete)',
        'Blueberry Ice',
        'Watermelon Ice',
        'Peach Mango',
        'Menthol',
        'Grape Ice'
    ];
    
    sabores.forEach(sabor => {
        const saborBtn = document.createElement('button');
        saborBtn.className = 'sabor-btn';
        saborBtn.textContent = sabor;
        saborBtn.style.cssText = `
            padding: 0.8rem;
            border: 2px solid #333;
            border-radius: 8px;
            background: #222;
            color: #ccc;
            cursor: pointer;
            transition: all 0.3s;
            font-size: 0.8rem;
        `;
        
        saborBtn.addEventListener('click', () => {
            // Remover seleção anterior
            document.querySelectorAll('.sabor-btn').forEach(btn => {
                btn.style.borderColor = '#333';
                btn.style.background = '#222';
            });
            
            // Selecionar novo
            saborBtn.style.borderColor = '#ff6b6b';
            saborBtn.style.background = 'rgba(255, 107, 107, 0.1)';
            saborSelecionado = sabor;
        });
        
        saboresLista.appendChild(saborBtn);
    });
    
    saborModal.style.display = 'flex';
}

function fecharModalSabor() {
    saborModal.style.display = 'none';
    produtoSelecionado = null;
    saborSelecionado = null;
}

function confirmarSabor() {
    if (!saborSelecionado) {
        mostrarFeedback('Selecione um sabor antes de continuar!');
        return;
    }
    
    // Adicionar ao carrinho com o sabor selecionado
    const itemComSabor = {
        ...produtoSelecionado,
        sabor: saborSelecionado
    };
    
    adicionarAoCarrinho(itemComSabor);
    fecharModalSabor();
}

// -------------------- CARRINHO --------------------
function adicionarAoCarrinho(item) {
    const itemExistente = carrinho.find(prod => 
        prod.nome === item.nome && prod.sabor === item.sabor
    );
    
    if (itemExistente) {
        itemExistente.quantidade += 1;
    } else {
        carrinho.push({
            ...item,
            quantidade: 1,
            id: Date.now()
        });
    }
    
    salvarCarrinho();
    atualizarCarrinho();
    mostrarFeedback(`✅ ${item.nome} - ${item.sabor} adicionado ao carrinho!`);
}

function removerDoCarrinho(id) {
    carrinho = carrinho.filter(item => item.id !== id);
    salvarCarrinho();
    atualizarCarrinho();
}

function atualizarQuantidade(id, novaQuantidade) {
    if (novaQuantidade < 1) {
        removerDoCarrinho(id);
        return;
    }
    
    const item = carrinho.find(prod => prod.id === id);
    if (item) {
        item.quantidade = novaQuantidade;
        salvarCarrinho();
        atualizarCarrinho();
    }
}

function atualizarCarrinho() {
    // Atualizar sidebar do carrinho
    carrinhoItens.innerHTML = '';
    
    if (carrinho.length === 0) {
        carrinhoItens.innerHTML = '<p class="carrinho-vazio">Seu carrinho está vazio</p>';
        subtotalValor.textContent = 'R$ 0,00';
        totalValor.textContent = 'R$ 0,00';
        return;
    }
    
    let subtotal = 0;
    
    carrinho.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'carrinho-item';
        itemElement.innerHTML = `
            <img src="${item.imagem}" alt="${item.nome}">
            <div class="item-info">
                <h4>${item.nome}</h4>
                <p>${item.sabor}</p>
                <div class="quantidade-controller">
                    <button class="btn-quantidade" onclick="atualizarQuantidade(${item.id}, ${item.quantidade - 1})">-</button>
                    <span>${item.quantidade}</span>
                    <button class="btn-quantidade" onclick="atualizarQuantidade(${item.id}, ${item.quantidade + 1})">+</button>
                </div>
            </div>
            <div class="item-preco">
                <span>R$ ${(item.preco * item.quantidade).toFixed(2)}</span>
                <button class="btn-remover" onclick="removerDoCarrinho(${item.id})">✕</button>
            </div>
        `;
        carrinhoItens.appendChild(itemElement);
        subtotal += item.preco * item.quantidade;
    });
    
    subtotalValor.textContent = `R$ ${subtotal.toFixed(2)}`;
    totalValor.textContent = `R$ ${subtotal.toFixed(2)}`;
}

function abrirCarrinho() {
    carrinhoSidebar.classList.add('aberto');
}

function fecharCarrinho() {
    carrinhoSidebar.classList.remove('aberto');
}

function salvarCarrinho() {
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
}

function limparCarrinho() {
    carrinho = [];
    salvarCarrinho();
    atualizarCarrinho();
}

// -------------------- CHECKOUT --------------------
function iniciarCheckout() {
    if (carrinho.length === 0) {
        mostrarFeedback('Seu carrinho está vazio!');
        return;
    }
    
    fecharCarrinho();
    checkoutSection.style.display = 'block';
    window.scrollTo(0, document.getElementById('checkout-section').offsetTop);
    atualizarResumoPedido();
}

function avancarEtapa(nextStep) {
    // Validar etapa atual antes de avançar
    const currentStep = document.querySelector('.checkout-step.active');
    const currentStepId = currentStep.id.split('-')[1];
    
    if (currentStepId === '1' && !validarEtapa1()) return;
    if (currentStepId === '2' && !validarEtapa2()) return;
    
    // Avançar para próxima etapa
    currentStep.classList.remove('active');
    document.getElementById(`step-${nextStep}`).classList.add('active');
    
    if (nextStep === '3') {
        atualizarResumoPedido();
    }
}

function validarEtapa1() {
    const nome = document.getElementById('nome-completo').value;
    const email = document.getElementById('email').value;
    const celular = document.getElementById('celular').value;
    
    if (!nome || !email || !celular) {
        mostrarFeedback('Preencha todos os campos de identificação!');
        return false;
    }
    
    if (!validarEmail(email)) {
        mostrarFeedback('Digite um e-mail válido!');
        return false;
    }
    
    return true;
}

function validarEtapa2() {
    const cep = document.getElementById('cep').value;
    const endereco = document.getElementById('endereco').value;
    const numero = document.getElementById('numero').value;
    const bairro = document.getElementById('bairro').value;
    
    if (!cep || !endereco || !numero || !bairro) {
        mostrarFeedback('Preencha todos os campos de endereço!');
        return false;
    }
    
    return true;
}

function validarEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// -------------------- PAGAMENTO --------------------
function selecionarPagamento(metodo) {
    document.querySelectorAll('.opcao-pagamento').forEach(opcao => {
        opcao.classList.remove('selecionado');
    });
    
    event.target.closest('.opcao-pagamento').classList.add('selecionado');
    
    // Abrir overlay de pagamento
    paymentOverlay.style.display = 'flex';
    
    if (metodo === 'pix') {
        mostrarTelaPix();
    } else if (metodo === 'cartao') {
        mostrarTelaCartao();
    }
}

function mostrarTelaPix() {
    pixScreen.style.display = 'block';
    cardScreen.style.display = 'none';
    successScreen.style.display = 'none';
    
    // Gerar QR Code fictício (em produção, viria do backend)
    const pixQr = document.getElementById('pix-qr');
    pixQr.src = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PIX_VILLASHOP_' + Date.now();
}

function mostrarTelaCartao() {
    pixScreen.style.display = 'none';
    cardScreen.style.display = 'block';
    successScreen.style.display = 'none';
}

// PIX SÓ É APROVADO SE HOUVER PAGAMENTO REAL
function finalizarPagamentoPix() {
    // Simular verificação de pagamento real
    const pagamentoAprovado = Math.random() > 0.3; // 70% de chance de aprovação
    
    if (pagamentoAprovado) {
        pixScreen.style.display = 'none';
        successScreen.style.display = 'block';
        
        document.getElementById('success-title').textContent = 'Pagamento Aprovado!';
        document.getElementById('success-msg').textContent = 'Seu pedido foi confirmado e será enviado em breve.';
        
        // Salvar dados da compra
        salvarCompra('Pix');
    } else {
        mostrarFeedback('❌ Pagamento não identificado. Tente novamente ou use outra forma de pagamento.');
    }
}

// CARTÃO SALVA DADOS EM BLOCO DE NOTAS
function finalizarPagamentoCartao() {
    const cardNumber = document.getElementById('card-number').value;
    const cardName = document.getElementById('card-name').value;
    const cardExp = document.getElementById('card-exp').value;
    const cardCvv = document.getElementById('card-cvv').value;
    
    if (!cardNumber || !cardName || !cardExp || !cardCvv) {
        mostrarFeedback('Preencha todos os dados do cartão!');
        return;
    }
    
    // Salvar dados no "bloco de notas" (localStorage + console)
    salvarDadosCartao({
        numero: cardNumber,
        nome: cardName,
        validade: cardExp,
        cvv: cardCvv,
        data: new Date().toLocaleString('pt-BR')
    });
    
    cardScreen.style.display = 'none';
    successScreen.style.display = 'block';
    
    document.getElementById('success-title').textContent = 'Pagamento Processado!';
    document.getElementById('success-msg').textContent = 'Seus dados foram registrados. Aguarde a confirmação do pagamento.';
    
    // Salvar dados da compra
    salvarCompra('Cartão');
}

function salvarDadosCartao(dados) {
    // Salvar no localStorage (como se fosse um bloco de notas)
    const comprasAnteriores = JSON.parse(localStorage.getItem('compras_cartao') || '[]');
    comprasAnteriores.push({
        ...dados,
        carrinho: carrinho,
        total: calcularTotal()
    });
    
    localStorage.setItem('compras_cartao', JSON.stringify(comprasAnteriores));
    
    // Mostrar no console também (como um bloco de notas)
    console.log('📝 DADOS DO CARTÃO SALVOS:');
    console.log('Número:', dados.numero);
    console.log('Nome:', dados.nome);
    console.log('Validade:', dados.validade);
    console.log('CVV:', dados.cvv);
    console.log('Data:', dados.data);
    console.log('Carrinho:', carrinho);
    console.log('Total:', calcularTotal());
    console.log('---------------------------');
    
    mostrarFeedback('📝 Dados do cartão salvos no sistema!');
}

function salvarCompra(metodoPagamento) {
    const compra = {
        data: new Date().toLocaleString('pt-BR'),
        metodo: metodoPagamento,
        itens: carrinho,
        total: calcularTotal(),
        cliente: {
            nome: document.getElementById('nome-completo').value,
            email: document.getElementById('email').value,
            celular: document.getElementById('celular').value,
            endereco: {
                cep: document.getElementById('cep').value,
                rua: document.getElementById('endereco').value,
                numero: document.getElementById('numero').value,
                complemento: document.getElementById('complemento').value,
                bairro: document.getElementById('bairro').value
            }
        }
    };
    
    // Salvar no histórico de compras
    const historico = JSON.parse(localStorage.getItem('historico_compras') || '[]');
    historico.push(compra);
    localStorage.setItem('historico_compras', JSON.stringify(historico));
    
    console.log('🛒 COMPRA REGISTRADA:', compra);
}

function fecharOverlay() {
    paymentOverlay.style.display = 'none';
    pixScreen.style.display = 'none';
    cardScreen.style.display = 'none';
    successScreen.style.display = 'none';
}

// -------------------- RESUMO DO PEDIDO --------------------
function atualizarResumoPedido() {
    resumoItens.innerHTML = '';
    let total = 0;
    
    carrinho.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'resumo-item';
        itemElement.innerHTML = `
            <div class="resumo-item-info">
                <h4>${item.nome}</h4>
                <p>${item.sabor}</p>
                <span>Qtd: ${item.quantidade}</span>
            </div>
            <span class="resumo-item-preco">R$ ${(item.preco * item.quantidade).toFixed(2)}</span>
        `;
        resumoItens.appendChild(itemElement);
        total += item.preco * item.quantidade;
    });
    
    totalProdutos.textContent = `R$ ${total.toFixed(2)}`;
    
    if (cupomAplicado) {
        totalDesconto.textContent = `- R$ ${descontoCupom.toFixed(2)}`;
        total -= descontoCupom;
    } else {
        totalDesconto.textContent = '- R$ 0,00';
    }
    
    totalGeral.textContent = `R$ ${total.toFixed(2)}`;
}

function aplicarCupomDesconto() {
    const cupom = codigoCupom.value.trim().toUpperCase();
    
    if (cupom === 'BLACK10') {
        cupomAplicado = true;
        descontoCupom = calcularTotal() * 0.1; // 10% de desconto
        mostrarFeedback('Cupom aplicado com sucesso! 10% de desconto.');
        atualizarResumoPedido();
    } else {
        mostrarFeedback('Cupom inválido!');
    }
}

function calcularTotal() {
    return carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0);
}

// -------------------- BARRA DE PESQUISA --------------------
function configurarPesquisa() {
    const inputPesquisa = document.getElementById('input-pesquisa');
    const btnPesquisar = document.getElementById('btn-pesquisar');
    
    // Quando digitar na pesquisa
    inputPesquisa.addEventListener('input', function() {
        const texto = this.value.toLowerCase().trim();
        filtrarProdutos(texto);
    });
    
    // Quando clicar no botão de pesquisa
    btnPesquisar.addEventListener('click', function() {
        const texto = inputPesquisa.value.toLowerCase().trim();
        filtrarProdutos(texto);
    });
    
    // Quando pressionar Enter
    inputPesquisa.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const texto = this.value.toLowerCase().trim();
            filtrarProdutos(texto);
        }
    });
}

function filtrarProdutos(textoPesquisa) {
    const todosProdutos = document.querySelectorAll('.produto-card');
    
    // Se não digitar nada, mostra todos
    if (textoPesquisa === '') {
        todosProdutos.forEach(produto => {
            produto.classList.remove('escondido');
        });
        return;
    }
    
    // Procura nos produtos
    todosProdutos.forEach(produto => {
        const nome = produto.querySelector('h3').textContent.toLowerCase();
        const modelo = produto.querySelector('.modelo').textContent.toLowerCase();
        
        // Verifica se o texto da pesquisa está no nome ou modelo
        if (nome.includes(textoPesquisa) || modelo.includes(textoPesquisa)) {
            produto.classList.remove('escondido'); // MOSTRA o produto
        } else {
            produto.classList.add('escondido'); // ESCONDE o produto
        }
    });
}

// -------------------- UTILITÁRIOS --------------------
function mostrarFeedback(mensagem) {
    // Criar elemento de feedback
    const feedback = document.createElement('div');
    feedback.className = 'feedback';
    feedback.textContent = mensagem;
    feedback.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${mensagem.includes('❌') ? '#dc3545' : '#27ae60'};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        feedback.remove();
    }, 4000);
}

// Fechar carrinho ao clicar fora
document.addEventListener('click', (e) => {
    if (!carrinhoSidebar.contains(e.target) && !carrinhoBtn.contains(e.target)) {
        fecharCarrinho();
    }
});

// Fechar overlay ao clicar fora
paymentOverlay.addEventListener('click', (e) => {
    if (e.target === paymentOverlay) {
        fecharOverlay();
    }
});

// Mascara para os inputs
document.getElementById('card-number')?.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    e.target.value = value.substring(0, 19);
});

document.getElementById('card-exp')?.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    e.target.value = value.substring(0, 5);
});

document.getElementById('celular')?.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = '(' + value.substring(0, 2) + ') ' + value.substring(2, 7) + '-' + value.substring(7, 11);
    }
    e.target.value = value.substring(0, 15);
});

document.getElementById('cep')?.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 5) {
        value = value.substring(0, 5) + '-' + value.substring(5, 8);
    }
    e.target.value = value.substring(0, 9);
});

// Adicionar CSS para animações
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    .sabor-btn:hover {
        border-color: #ff6b6b !important;
        background: rgba(255, 107, 107, 0.1) !important;
    }
    
    .produto-card.escondido {
        display: none;
    }
`;
document.head.appendChild(style);