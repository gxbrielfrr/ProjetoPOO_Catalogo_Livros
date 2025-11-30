document.addEventListener('DOMContentLoaded', () => {

    // --- ROTEADOR SIMPLES ---
    // Verifica qual página está ativa e chama a função correta
    
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

// --- LÓGICA PARA A PÁGINA DE ADICIONAR (adicionar.html) ---
function configurarFormularioAdicionar(form) {
    form.addEventListener('submit', async (event) => {
        event.preventDefault(); 
        const dadosDoFormulario = new FormData(form);
        const dadosComoObjeto = Object.fromEntries(dadosDoFormulario.entries());
        dadosComoObjeto.nota = parseInt(dadosComoObjeto.nota, 10);
        
        console.log('Enviando para o back-end:', dadosComoObjeto);

        try {
            const response = await fetch('/api/livros', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dadosComoObjeto)
            });

            if (response.ok) {
                const novoLivro = await response.json();
                alert('✓ Livro adicionado com sucesso!');
                window.location.href = '/lista';
            } else {
                alert('✗ Não foi possível salvar o livro. Tente novamente.');
                console.error('Erro na resposta:', response);
            }
        } catch (error) {
            alert('✗ Erro de conexão. Verifique sua internet.');
            console.error('Erro ao enviar livro:', error);
        }
    });
}

// --- LÓGICA PARA CARREGAR LISTAS DE LIVROS (index.html, lista.html) ---

async function carregarLivrosRecentes(container) {
    container.innerHTML = '<p>Carregando livros recentes...</p>';

    try {
        const response = await fetch('/api/livros');
        
        if (!response.ok) {
            throw new Error('Erro ao buscar livros do servidor');
        }

        const livros = await response.json();
        
        container.innerHTML = ''; 
        
        if (livros.length === 0) {
            container.innerHTML = '<p>Nenhum livro adicionado ainda.</p>';
            return;
        }

        // Mostrar apenas os 3 mais recentes
        livros.slice(0, 3).forEach(livro => {
            const card = criarCardDeLivro(livro);
            container.appendChild(card);
        });

    } catch (error) {
        console.error('Erro ao carregar livros recentes:', error);
        container.innerHTML = '<p style="color: red;">Erro ao carregar livros. Verifique a conexão com o banco de dados.</p>';
    }
}

// Função para a lista completa
async function carregarListaCompleta(container) {
    container.innerHTML = '<p>Carregando lista completa...</p>';

    try {
        const response = await fetch('/api/livros');
        
        if (!response.ok) {
            throw new Error('Erro ao buscar livros do servidor');
        }

        const livros = await response.json();
        
        container.innerHTML = ''; 
        
        if (livros.length === 0) {
            container.innerHTML = '<p>Nenhum livro na sua biblioteca.</p>';
            return;
        }

        livros.forEach(livro => {
            const card = criarCardDeLivro(livro);
            container.appendChild(card);
        });

    } catch (error) {
        console.error('Erro ao carregar lista completa:', error);
        container.innerHTML = '<p style="color: red;">Erro ao carregar livros. Verifique a conexão com o banco de dados.</p>';
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

    try {
        const response = await fetch(`/api/livros/${id}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                container.innerHTML = '<p style="color: red;">Livro não encontrado.</p>';
            } else {
                throw new Error('Erro ao buscar detalhes do livro');
            }
            return;
        }

        const livro = await response.json();
        renderizarDetalhes(container, livro);

    } catch (error) {
        console.error('Erro ao carregar detalhes do livro:', error);
        container.innerHTML = '<p style="color: red;">Erro ao carregar detalhes. Verifique a conexão com o banco de dados.</p>';
    }
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

// --- LÓGICA PARA A PÁGINA DE EDITAR (editar.html) ---
async function configurarFormularioEditar(form) {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        alert('⚠️ Erro ao acessar o livro. Tente novamente.');
        window.location.href = '/lista';
        return;
    }

    // Carregar dados do livro
    try {
        const response = await fetch(`/api/livros/${id}`);
        
        if (!response.ok) {
            throw new Error('Livro não encontrado');
        }

        const livro = await response.json();

        // Preencher o formulário com os dados atuais
        document.getElementById('titulo').value = livro.titulo;
        document.getElementById('autor').value = livro.autor;
        document.getElementById('capaUrl').value = livro.capaUrl || '';
        document.getElementById('nota').value = livro.nota;
        document.getElementById('resenha').value = livro.resenha || '';

    } catch (error) {
        alert('✗ Não foi possível carregar o livro. Tente novamente.');
        console.error('Erro:', error);
        window.location.href = '/lista';
    }

    // Configurar envio do formulário
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const dadosDoFormulario = new FormData(form);
        const dadosComoObjeto = Object.fromEntries(dadosDoFormulario.entries());
        dadosComoObjeto.nota = parseInt(dadosComoObjeto.nota, 10);

        try {
            const response = await fetch(`/api/livros/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dadosComoObjeto)
            });

            if (response.ok) {
                alert('✓ Livro atualizado com sucesso!');
                window.location.href = `/detalhes?id=${id}`;
            } else {
                alert('✗ Não foi possível atualizar o livro. Tente novamente.');
                console.error('Erro na resposta:', response);
            }
        } catch (error) {
            alert('✗ Erro de conexão. Verifique sua internet.');
            console.error('Erro ao atualizar livro:', error);
        }
    });
}

async function excluirLivro(id) {
    if (!confirm(`Tem certeza que deseja excluir este livro?`)) return;
    
    try {
        const response = await fetch(`/api/livros/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('✓ Livro removido com sucesso!');
            window.location.href = '/lista';
        } else {
            alert('✗ Não foi possível remover o livro. Tente novamente.');
        }
    } catch (error) {
        alert('✗ Erro de conexão. Verifique sua internet.');
        console.error('Erro ao excluir livro:', error);
    }
}
