document.addEventListener('DOMContentLoaded', () => {

    // --- ROTEADOR SIMPLES ---
    // Verifica qual página está ativa e chama a função correta
    
    const path = window.location.pathname;

    if (path === '/adicionar') {
        const formAdicionar = document.getElementById('form-adicionar-livro');
        if (formAdicionar) configurarFormularioAdicionar(formAdicionar);
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

// --- LÓGICA PARA A PÁGINA DE ADICIONAR (adicionar.html) ---
function configurarFormularioAdicionar(form) {
    form.addEventListener('submit', async (event) => {
        event.preventDefault(); 
        const dadosDoFormulario = new FormData(form);
        const dadosComoObjeto = Object.fromEntries(dadosDoFormulario.entries());
        dadosComoObjeto.nota = parseInt(dadosComoObjeto.nota, 10);
        
        console.log('Enviando para o back-end:', dadosComoObjeto);

        // Simulação (por enquanto)
        alert('Modo de simulação: Livro salvo!');
        console.log('Dados que seriam enviados:', JSON.stringify(dadosComoObjeto));
        window.location.href = '/lista';
    });
}

// --- LÓGICA PARA CARREGAR LISTAS DE LIVROS (index.html, lista.html) ---

async function carregarLivrosRecentes(container) {
    container.innerHTML = '<p>Carregando livros recentes...</p>';

    try {
        // MOCK temporário
        const livros = [
            { id: 1, titulo: 'O Problema dos 3 Corpos', autor: 'Cixin Liu', capaUrl: '/img/capaLivro1.jpg', nota: 4 },
            { id: 2, titulo: 'Duna', autor: 'Frank Herbert', capaUrl: '/img/capaLivro2.jpg', nota: 5 },
            { id: 3, titulo: 'The Witcher', autor: 'Andrzej Sapkowski', capaUrl: '/img/capaLivro3.jpg', nota: 5 }
        ];
        
        container.innerHTML = ''; 
        livros.forEach(livro => {
            const card = criarCardDeLivro(livro);
            container.appendChild(card);
        });

    } catch (error) {
        console.error('Erro ao carregar livros recentes:', error);
        container.innerHTML = '<p style="color: red;">Erro ao carregar livros.</p>';
    }
}

// Função para a lista completa
async function carregarListaCompleta(container) {
    container.innerHTML = '<p>Carregando lista completa...</p>';

    try {
        const livros = [
    { id: 1, titulo: 'O Problema dos 3 Corpos', autor: 'Cixin Liu', capaUrl: '/img/capaLivro1.jpg', nota: 4 },
    { id: 2, titulo: 'Duna', autor: 'Frank Herbert', capaUrl: '/img/capaLivro2.jpg', nota: 5 },
    { id: 3, titulo: 'The Witcher', autor: 'Andrzej Sapkowski', capaUrl: '/img/capaLivro3.jpg', nota: 5 }
];

        
        container.innerHTML = ''; 
        livros.forEach(livro => {
            const card = criarCardDeLivro(livro);
            container.appendChild(card);
        });

    } catch (error) {
        console.error('Erro ao carregar lista completa:', error);
        container.innerHTML = '<p style="color: red;">Erro ao carregar livros.</p>';
    }
}

// Função auxiliar para criar o HTML de um card
function criarCardDeLivro(livro) {
    const link = document.createElement('a');
    link.href = `/detalhes?id=${livro.id}`; // Ajuste para rota Spring Boot
    link.className = 'book-card';
    const estrelas = '★'.repeat(livro.nota) + '☆'.repeat(5 - livro.nota);
    link.innerHTML = `
        <img src="${livro.capaUrl}" alt="Capa do livro ${livro.titulo}">
        <h3>${livro.titulo}</h3>
        <p>${livro.autor}</p>
        <div class="rating">${estrelas}</div>
    `;
    return link;
}

// --- LÓGICA PARA DETALHES ---
async function carregarDetalhesDoLivro(container) {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        container.innerHTML = '<p style="color: red;">ID do livro não encontrado na URL.</p>';
        return;
    }

    const livros = [
        { id: 1, titulo: 'O Problema dos 3 Corpos', autor: 'Cixin Liu', capaUrl: '/img/capaLivro1.jpg', nota: 4, resenha: 'Um épico da ficção científica moderna.' },
        { id: 2, titulo: 'Duna', autor: 'Frank Herbert', capaUrl: '/img/capaLivro2.jpg', nota: 5, resenha: 'Um clássico imortal de política e ecologia.' },
        { id: 3, titulo: 'The Witcher', autor: 'Andrzej Sapkowski', capaUrl: '/img/capaLivro3.jpg', nota: 5, resenha: 'Uma jornada fantástica cheia de magia e monstros.' }
    ];

    const livro = livros.find(l => l.id == id);

    if (!livro) {
        container.innerHTML = '<p style="color: red;">Livro não encontrado.</p>';
        return;
    }

    renderizarDetalhes(container, livro);
}


function renderizarDetalhes(container, livro) {
    container.innerHTML = ''; 
    const estrelas = '★'.repeat(livro.nota) + '☆'.repeat(5 - livro.nota);

    const capaDiv = document.createElement('div');
    capaDiv.className = 'detalhes-capa';
    capaDiv.innerHTML = `<img src="${livro.capaUrl}" alt="Capa do ${livro.titulo}">`;

    const infoDiv = document.createElement('div');
    infoDiv.className = 'detalhes-info';
    infoDiv.innerHTML = `
        <h1>${livro.titulo}</h1>
        <p class="autor">por ${livro.autor}</p>
        <div class="rating">${estrelas}</div>
        <h3 class="resenha-titulo">Minha Resenha</h3>
        <p class="resenha-texto">${livro.resenha || 'Nenhuma resenha adicionada.'}</p>
        
        <div class="detalhes-botoes">
            <a href="/editar?id=${livro.id}" class="btn-editar">Editar</a>
            <button id="btn-excluir" class="btn-excluir">Excluir</button>
        </div>
    `;
    
    container.appendChild(capaDiv);
    container.appendChild(infoDiv);

    document.getElementById('btn-excluir').addEventListener('click', () => {
        excluirLivro(livro.id);
    });
}

async function excluirLivro(id) {
    if (!confirm(`Tem certeza que deseja excluir este livro? (ID: ${id})`)) return;
    alert(`Modo de simulação: Livro ${id} excluído!`);
    window.location.href = '/lista';
}
