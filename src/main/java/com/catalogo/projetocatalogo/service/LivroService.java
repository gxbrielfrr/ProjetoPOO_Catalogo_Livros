package com.catalogo.projetocatalogo.service;

import com.catalogo.projetocatalogo.model.Livro;
import com.catalogo.projetocatalogo.repository.LivroRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class LivroService {

    @Autowired
    private LivroRepository livroRepository;

    // CREATE
    public Livro criarLivro(Livro livro) {
        return livroRepository.save(livro);
    }

    // READ - Buscar todos
    public List<Livro> listarTodos() {
        return livroRepository.findAllByOrderByDataCriacaoDesc();
    }

    // READ - Buscar por ID
    public Optional<Livro> buscarPorId(Integer id) {
        return livroRepository.findById(id);
    }

    // READ - Buscar por título
    public List<Livro> buscarPorTitulo(String titulo) {
        return livroRepository.findByTituloContainingIgnoreCase(titulo);
    }

    // READ - Buscar por autor
    public List<Livro> buscarPorAutor(String autor) {
        return livroRepository.findByAutorContainingIgnoreCase(autor);
    }

    // UPDATE
    public Livro atualizarLivro(Integer id, Livro livroAtualizado) {
        Optional<Livro> livroExistente = livroRepository.findById(id);
        if (livroExistente.isPresent()) {
            Livro livro = livroExistente.get();
            livro.setTitulo(livroAtualizado.getTitulo());
            livro.setAutor(livroAtualizado.getAutor());
            livro.setCapaUrl(livroAtualizado.getCapaUrl());
            livro.setNota(livroAtualizado.getNota());
            livro.setResenha(livroAtualizado.getResenha());
            return livroRepository.save(livro);
        }
        return null;
    }

    // DELETE
    public boolean deletarLivro(Integer id) {
        if (livroRepository.existsById(id)) {
            livroRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // Contar total de livros
    public long contarLivros() {
        return livroRepository.count();
    }
}
