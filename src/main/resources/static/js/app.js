// --- CONSTANTES GLOBAIS ---
const PLACEHOLDER_IMG = 'https://placehold.co/400x600/1c1c1e/FFF?text=Sem+Capa';

document.addEventListener('DOMContentLoaded', () => {
    criarModalNoDom();
    iniciarLogicaEstrelas();

    const path = window.location.pathname;

    if (path === '/adicionar') {
        const formAdicionar = document.getElementById('form-adicionar-livro');
        if (formAdicionar) configurarFormularioAdicionar(formAdicionar);
    }

    if (path === '/editar') {
        const formEditar = document.getElementById('form-editar-livro');
        if (formEditar) configurarFormularioEditar(formEditar);
    }

    if (path === '/' || path === '/index') {
        const containerRecentes = document.getElementById('recentes-container');
        if (containerRecentes) carregarLivrosRecentes(containerRecentes);
    }

    if (path === '/lista') {
        const containerListaCompleta = document.getElementById('lista-completa-container');
        if (containerListaCompleta) carregarListaCompleta(containerListaCompleta);
    }

    if (path.startsWith('/detalhes')) {
        const containerDetalhes = document.getElementById('detalhes-livro-container');
        if (containerDetalhes) carregarDetalhesDoLivro(containerDetalhes);
    }
});

/* =============================================================
   FUNÇÃO AUXILIAR: GERAR ESTRELAS BRILHANTES (NOVO!)
   ============================================================= */
function gerarHtmlEstrelasBrilhantes(nota) {
    let html = '<div class="rating-display">';
    for (let i = 1; i <= 5; i++) {
        // Se o índice (i) for menor ou igual à nota, a estrela é ativa (brilhante)
        const activeClass = i <= nota ? 'active' : '';
        // Usamos sempre o símbolo de estrela cheia '★'. 
        // O CSS cuida de deixar ela dourada/brilhante (active) ou apagada (sem active).
        html += `<span class="star-icon ${activeClass}">★</span>`;
    }
    html += '</div>';
    return html;
}

/* =============================================================
   LÓGICA DE ESTRELAS DINÂMICAS (Inputs de Adicionar/Editar)
   ============================================================= */
function iniciarLogicaEstrelas() {
    const starBox = document.getElementById('star-rating-box');
    const inputNota = document.getElementById('nota');

    if (!starBox || !inputNota) return;

    const stars = starBox.querySelectorAll('.star-icon');

    stars.forEach(star => {
        star.addEventListener('click', () => {
            const valor = parseInt(star.getAttribute('data-value'));
            inputNota.value = valor; 
            atualizarVisualEstrelas(valor);
        });
    });
    atualizarVisualEstrelas(parseInt(inputNota.value) || 5);
}

function atualizarVisualEstrelas(nota) {
    const stars = document.querySelectorAll('.star-icon');
    stars.forEach(s => {
        const valorEstrela = parseInt(s.getAttribute('data-value'));
        if (valorEstrela <= nota) {
            s.classList.add('active');
            s.style.color = 'var(--ios-gold)';
        } else {
            s.classList.remove('active');
            s.style.color = 'rgba(255, 255, 255, 0.2)';
        }
    });
}

/* =============================================================
   SISTEMA DE MODAL iOS
   ============================================================= */
let removerEventoTeclado = null;

function criarModalNoDom() {
    const modalHtml = `
        <div id="ios-backdrop" class="ios-backdrop">
            <div class="ios-modal">
                <div class="ios-modal-content">
                    <div id="ios-title" class="ios-modal-title">Título</div>
                    <div id="ios-message" class="ios-modal-message">Mensagem</div>
                </div>
                <div id="ios-actions" class="ios-modal-actions"></div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function iosAlert(titulo, mensagem, callback) {
    exibirModal(titulo, mensagem, [{ text: 'OK', style: 'default', action: callback }]);
}

function iosConfirm(titulo, mensagem, onConfirm) {
    exibirModal(titulo, mensagem, [
        { text: 'Cancelar', style: 'cancel', action: () => fecharModal() },
        { text: 'Confirmar', style: 'destructive', action: onConfirm }
    ]);
}

function exibirModal(titulo, mensagem, botoes) {
    const backdrop = document.getElementById('ios-backdrop');
    const titleEl = document.getElementById('ios-title');
    const msgEl = document.getElementById('ios-message');
    const actionsEl = document.getElementById('ios-actions');

    titleEl.textContent = titulo;
    msgEl.textContent = mensagem;
    actionsEl.innerHTML = ''; 

    const htmlButtons = [];
    botoes.forEach(btn => {
        const button = document.createElement('button');
        button.className = `ios-btn ${btn.style || ''}`;
        button.textContent = btn.text;
        button.onclick = () => {
            fecharModal();
            if (btn.action) setTimeout(() => btn.action(), 300);
        };
        actionsEl.appendChild(button);
        htmlButtons.push(button);
    });

    const handleEnterKey = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); 
            const mainButton = htmlButtons[htmlButtons.length - 1];
            if (mainButton) mainButton.click();
        }
    };
    document.addEventListener('keydown', handleEnterKey);
    removerEventoTeclado = () => document.removeEventListener('keydown', handleEnterKey);

    backdrop.style.display = 'flex';
    setTimeout(() => backdrop.classList.add('visible'), 10);
}

function fecharModal() {
    const backdrop = document.getElementById('ios-backdrop');
    backdrop.classList.remove('visible');
    if (removerEventoTeclado) { removerEventoTeclado(); removerEventoTeclado = null; }
    setTimeout(() => backdrop.style.display = 'none', 300); 
}

/* =============================================================
   LÓGICA DO APP
   ============================================================= */

function setCarregando(form, carregando) {
    const btn = form.querySelector('button[type="submit"]');
    if (!btn) return;
    if (carregando) {
        btn.disabled = true;
        btn.dataset.textoOriginal = btn.textContent;
        btn.textContent = 'Salvando...';
        btn.style.opacity = '0.7';
        btn.style.cursor = 'wait';
    } else {
        btn.disabled = false;
        btn.textContent = btn.dataset.textoOriginal || 'Salvar';
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
    }
}

// --- ADICIONAR ---
function configurarFormularioAdicionar(form) {
    form.addEventListener('submit', async (event) => {
        event.preventDefault(); 
        setCarregando(form, true);

        const dadosDoFormulario = new FormData(form);
        const dadosComoObjeto = Object.fromEntries(dadosDoFormulario.entries());
        dadosComoObjeto.nota = parseInt(dadosComoObjeto.nota, 10);
        
        try {
            const response = await fetch('/api/livros', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosComoObjeto)
            });

            if (response.ok) {
                iosAlert('Sucesso', 'Livro adicionado ao diário!', () => {
                    window.location.href = '/lista';
                });
            } else {
                iosAlert('Erro', 'Não foi possível salvar.');
                setCarregando(form, false);
            }
        } catch (error) {
            iosAlert('Erro de Conexão', 'Verifique sua internet.');
            setCarregando(form, false);
        }
    });
}

// --- LISTAGENS ---
// --- LISTAGEM DE RECENTES (Com Ordenação Garantida) ---
async function carregarLivrosRecentes(container) {
    container.innerHTML = '<p style="color:#888;">Carregando...</p>';
    try {
        const response = await fetch('/api/livros');
        if (!response.ok) throw new Error('Erro ao buscar');
        let livros = await response.json();
        
        container.innerHTML = ''; 
        if (livros.length === 0) {
            container.innerHTML = '<p style="color:#888;">Nenhum livro ainda.</p>';
            return;
        }

        // --- A MÁGICA DA ORDENAÇÃO ---
        // Isso garante que o livro com ID maior (mais novo) fique em primeiro,
        // independentemente da ordem que o banco de dados devolveu.
        livros.sort((a, b) => b.id - a.id);

        // Agora pegamos os 4 primeiros da lista já ordenada
        const recentes = livros.slice(0, 4);

        recentes.forEach(livro => {
            const card = criarCardDeLivro(livro);
            container.appendChild(card);
        });
    } catch (error) {
        console.error(error);
        container.innerHTML = '<p style="color: red;">Erro ao carregar.</p>';
    }
}

async function carregarListaCompleta(container) {
    container.innerHTML = '<p style="color:#888;">Carregando...</p>';
    try {
        const response = await fetch('/api/livros');
        if (!response.ok) throw new Error('Erro ao buscar');
        const livros = await response.json();
        
        container.innerHTML = ''; 
        if (livros.length === 0) {
            container.innerHTML = '<p style="color:#888;">Sua lista está vazia.</p>';
            return;
        }
        livros.forEach(livro => {
            const card = criarCardDeLivro(livro);
            container.appendChild(card);
        });
    } catch (error) {
        console.error(error);
        container.innerHTML = '<p style="color: red;">Erro ao carregar lista.</p>';
    }
}

function criarCardDeLivro(livro) {
    const link = document.createElement('a');
    link.href = `/detalhes?id=${livro.id}`; 
    link.className = 'book-card';
    
    // --- MUDANÇA AQUI: Usa a nova função de estrelas brilhantes ---
    const estrelasHtml = gerarHtmlEstrelasBrilhantes(livro.nota);
    
    const capaParaUsar = (livro.capaUrl && livro.capaUrl.trim() !== '') ? livro.capaUrl : PLACEHOLDER_IMG;

    const limitarTexto = (texto, limite) => {
        if (!texto) return "";
        return texto.length > limite ? texto.substring(0, limite) + '...' : texto;
    };

    const tituloExibido = limitarTexto(livro.titulo, 40);
    const autorExibido = limitarTexto(livro.autor, 30);

    link.innerHTML = `
        <img src="${capaParaUsar}" alt="${livro.titulo}" onerror="this.onerror=null;this.src='${PLACEHOLDER_IMG}';">
        <div class="book-info">
            <h3 title="${livro.titulo}">${tituloExibido}</h3>
            <p title="${livro.autor}">${autorExibido}</p>
            ${estrelasHtml}
        </div>
    `;
    return link;
}

// --- DETALHES ---
async function carregarDetalhesDoLivro(container) {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) { container.innerHTML = '<p>ID não encontrado.</p>'; return; }

    try {
        const response = await fetch(`/api/livros/${id}`);
        if (!response.ok) throw new Error('Erro ao buscar');
        const livro = await response.json();
        renderizarDetalhes(container, livro);
    } catch (error) {
        container.innerHTML = '<p style="color: red;">Erro ao carregar detalhes.</p>';
    }
}

function renderizarDetalhes(container, livro) {
    container.innerHTML = ''; 
    
    // --- MUDANÇA AQUI: Usa a nova função de estrelas brilhantes ---
    const estrelasHtml = gerarHtmlEstrelasBrilhantes(livro.nota);
    
    const capaParaUsar = (livro.capaUrl && livro.capaUrl.trim() !== '') ? livro.capaUrl : PLACEHOLDER_IMG;

    const capaDiv = document.createElement('div');
    capaDiv.className = 'detalhes-capa';
    capaDiv.innerHTML = `<img src="${capaParaUsar}" alt="${livro.titulo}" onerror="this.onerror=null;this.src='${PLACEHOLDER_IMG}';">`;

    const infoDiv = document.createElement('div');
    infoDiv.className = 'detalhes-info';
    infoDiv.innerHTML = `
        <h1>${livro.titulo}</h1>
        <p class="autor">por ${livro.autor}</p>
        ${estrelasHtml}

        <h3 style="margin-top: 2rem; margin-bottom: 0.5rem; font-size: 1.1rem; color: #fff; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1.5rem;">Minha Resenha</h3>
        <p style="line-height: 1.6; color: #ccc;">${livro.resenha || 'Sem anotações.'}</p>
        <div class="detalhes-botoes">
            <a href="/editar?id=${livro.id}" class="btn-editar">Editar</a>
            <button id="btn-excluir" class="btn-excluir">Excluir</button>
        </div>
    `;
    container.appendChild(capaDiv);
    container.appendChild(infoDiv);

    document.getElementById('btn-excluir').addEventListener('click', () => {
        excluirLivro(livro.id, livro.titulo);
    });
}

// --- EDITAR E EXCLUIR ---
async function configurarFormularioEditar(form) {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) { window.location.href = '/lista'; return; }

    try {
        const response = await fetch(`/api/livros/${id}`);
        if (response.ok) {
            const livro = await response.json();
            document.getElementById('titulo').value = livro.titulo;
            document.getElementById('autor').value = livro.autor;
            document.getElementById('capaUrl').value = livro.capaUrl || '';
            
            // Atualiza as estrelas interativas
            document.getElementById('nota').value = livro.nota;
            atualizarVisualEstrelas(livro.nota);

            document.getElementById('resenha').value = livro.resenha || '';
        }
    } catch (error) { console.error(error); }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        setCarregando(form, true);

        const dados = Object.fromEntries(new FormData(form).entries());
        dados.nota = parseInt(dados.nota, 10);

        try {
            const response = await fetch(`/api/livros/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });

            if (response.ok) {
                iosAlert('Atualizado', 'As alterações foram salvas.', () => {
                    window.location.href = `/detalhes?id=${id}`;
                });
            } else {
                iosAlert('Erro', 'Não foi possível atualizar.');
                setCarregando(form, false);
            }
        } catch (error) {
            iosAlert('Erro de Conexão', 'Verifique sua internet.');
            setCarregando(form, false);
        }
    });
}

function excluirLivro(id, titulo) {
    iosConfirm(
        'Excluir Livro?', 
        `Tem certeza que deseja apagar "${titulo}"?`, 
        async () => {
            try {
                const response = await fetch(`/api/livros/${id}`, { method: 'DELETE' });
                if (response.ok) {
                    iosAlert('Removido', 'Livro apagado com sucesso.', () => {
                        window.location.href = '/lista';
                    });
                } else {
                    iosAlert('Erro', 'Não foi possível remover o livro.');
                }
            } catch (error) {
                iosAlert('Erro', 'Erro de conexão.');
            }
        }
    );
}