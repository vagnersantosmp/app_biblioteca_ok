import { useState, useEffect } from "react";
import { books, locations } from "../services/api.js"; // Importa serviços de livros e locais

function AddBookForm({ onBookAdded, setMessage }) {
  // Estados para os campos do formulário de livro
  const [isbn, setIsbn] = useState("");
  const [titulo, setTitulo] = useState("");
  const [autores, setAutores] = useState("");
  const [notas, setNotas] = useState("");
  const [genero, setGenero] = useState("");
  const [editora, setEditora] = useState("");
  const [anoPublicacao, setAnoPublicacao] = useState("");
  const [numeroPaginas, setNumeroPaginas] = useState("");
  const [idioma, setIdioma] = useState("");
  const [capaUrl, setCapaUrl] = useState("");
  const [idPrateleira, setIdPrateleira] = useState(""); // ID da prateleira selecionada

  // Estados para as estantes e prateleiras para os dropdowns
  const [estantes, setEstantes] = useState([]);
  const [prateleiras, setPrateleiras] = useState([]);
  const [selectedEstanteId, setSelectedEstanteId] = useState(""); // ID da estante selecionada

  const [loading, setLoading] = useState(false); // Estado de carregamento

  // Efeito para carregar as estantes ao montar o componente
  useEffect(() => {
    const fetchEstantes = async () => {
      try {
        const data = await locations.fetchEstantes(); // Chama o serviço de API
        if (data.status === "sucesso") {
          setEstantes(data.estantes);
        } else {
          setMessage(`Erro ao carregar estantes: ${data.mensagem}`);
        }
      } catch (err) {
        setMessage("Erro de conexão ao carregar estantes.");
      } finally {
        setLoading(false);
      }
    };
    fetchEstantes();
  }, []);

  // Efeito para carregar as prateleiras quando uma estante é selecionada
  useEffect(() => {
    const fetchPrateleiras = async () => {
      if (!selectedEstanteId) {
        setPrateleiras([]);
        return;
      }
      try {
        const data = await locations.fetchPrateleirasByEstante(
          selectedEstanteId
        ); // Chama o serviço de API
        if (data.status === "sucesso") {
          setPrateleiras(data.prateleiras);
        } else {
          setMessage(`Erro ao carregar prateleiras: ${data.mensagem}`);
        }
      } catch (err) {
        setMessage("Erro de conexão ao carregar prateleiras.");
      } finally {
        setLoading(false);
      }
    };
    fetchPrateleiras();
  }, [selectedEstanteId]); // Depende de selectedEstanteId

  // Lida com a busca de dados do livro por ISBN
  const handleSearchByIsbn = async () => {
    if (!isbn) {
      setMessage("Por favor, insira um ISBN para buscar.");
      return;
    }
    setLoading(true);
    setMessage("");
    // Limpa campos preenchidos anteriormente para nova busca
    setTitulo("");
    setAutores("");
    setGenero("");
    setEditora("");
    setAnoPublicacao("");
    setNumeroPaginas("");
    setIdioma("");
    setCapaUrl("");

    try {
      const data = await books.searchBookByIsbn(isbn); // Chama o serviço de API
      if (data.status === "sucesso" && data.livro) {
        const bookData = data.livro;
        setTitulo(bookData.titulo || "");
        setAutores(bookData.autores || "");
        setGenero(bookData.genero || "");
        setEditora(bookData.editora || "");
        setAnoPublicacao(bookData.ano_publicacao || "");
        setNumeroPaginas(bookData.numero_paginas || "");
        setIdioma(bookData.idioma || "");
        setCapaUrl(bookData.capa_url || "");
        setMessage("Dados do livro pré-preenchidos!");
      } else {
        setMessage(
          data.mensagem ||
            "Livro não encontrado pela busca. Preencha manualmente."
        );
      }
    } catch (error) {
      setMessage(
        "Erro ao buscar ISBN. Verifique a conexão ou preencha manualmente."
      );
    } finally {
      setLoading(false);
    }
  };

  // Lida com o envio do formulário para adicionar o livro
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    // Prepara os dados do livro para enviar ao backend
    const bookData = {
      isbn,
      titulo,
      autores,
      id_prateleira: idPrateleira || null, // Envia null se não selecionado
      notas_pessoais: notas,
      genero,
      editora,
      ano_publicacao: anoPublicacao ? parseInt(anoPublicacao) : null, // Converte para int ou null
      numero_paginas: numeroPaginas ? parseInt(numeroPaginas) : null, // Converte para int ou null
      idioma,
      capa_url: capaUrl,
    };

    try {
      const data = await books.addBook(bookData); // Chama a função do serviço de API
      if (data.status === "sucesso") {
        onBookAdded(); // Notifica o Dashboard que um livro foi adicionado
        // Limpa o formulário após o sucesso
        setIsbn("");
        setTitulo("");
        setAutores("");
        setNotas("");
        setGenero("");
        setEditora("");
        setAnoPublicacao("");
        setNumeroPaginas("");
        setIdioma("");
        setCapaUrl("");
        setIdPrateleira("");
        setSelectedEstanteId("");
      } else {
        setMessage(
          `Erro ao adicionar livro: ${data.mensagem || "Verifique os dados."}`
        );
      }
    } catch (error) {
      setMessage("Erro de conexão ao adicionar livro. Verifique o backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#e0f2fe] p-6 rounded-lg shadow-inner mb-6">
      <h3 className="text-xl font-bold text-[#004AAD] mb-4 text-center">
        Adicionar Novo Livro
      </h3>
      <div className="mb-4 flex space-x-2">
        <input
          type="text"
          placeholder="ISBN do Livro"
          value={isbn}
          onChange={(e) => setIsbn(e.target.value)}
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#48CAE4]"
        />
        <button
          onClick={handleSearchByIsbn}
          disabled={loading}
          className="bg-[#0077B6] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#0096C7] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#004AAD]"
        >
          {loading ? "Buscando..." : "Buscar ISBN"}
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {capaUrl && (
          <div className="flex justify-center mb-4">
            <img
              src={capaUrl}
              alt="Capa do Livro"
              className="max-h-48 rounded-lg shadow-md"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://placehold.co/64x96/cccccc/333333?text=Sem+Capa";
              }}
            />
          </div>
        )}

        {/* Campos principais em duas colunas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="titulo"
              className="block text-gray-700 text-sm font-semibold mb-2"
            >
              Título:
            </label>
            <input
              type="text"
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#48CAE4]"
              required
            />
          </div>
          <div>
            <label
              htmlFor="autores"
              className="block text-gray-700 text-sm font-semibold mb-2"
            >
              Autor(es):
            </label>
            <input
              type="text"
              id="autores"
              value={autores}
              onChange={(e) => setAutores(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#48CAE4]"
              required
            />
          </div>
        </div>

        {/* Campos de detalhes em duas colunas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="genero"
              className="block text-gray-700 text-sm font-semibold mb-2"
            >
              Gênero:
            </label>
            <input
              type="text"
              id="genero"
              value={genero}
              onChange={(e) => setGenero(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#48CAE4]"
            />
          </div>
          <div>
            <label
              htmlFor="editora"
              className="block text-gray-700 text-sm font-semibold mb-2"
            >
              Editora:
            </label>
            <input
              type="text"
              id="editora"
              value={editora}
              onChange={(e) => setEditora(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#48CAE4]"
            />
          </div>
        </div>

        {/* Campos numéricos/idioma em duas colunas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="anoPublicacao"
              className="block text-gray-700 text-sm font-semibold mb-2"
            >
              Ano Publicação:
            </label>
            <input
              type="number"
              id="anoPublicacao"
              value={anoPublicacao}
              onChange={(e) => setAnoPublicacao(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#48CAE4]"
            />
          </div>
          <div>
            <label
              htmlFor="numeroPaginas"
              className="block text-gray-700 text-sm font-semibold mb-2"
            >
              Número Páginas:
            </label>
            <input
              type="number"
              id="numeroPaginas"
              value={numeroPaginas}
              onChange={(e) => setNumeroPaginas(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#48CAE4]"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="idioma"
            className="block text-gray-700 text-sm font-semibold mb-2"
          >
            Idioma:
          </label>
          <input
            type="text"
            id="idioma"
            value={idioma}
            onChange={(e) => setIdioma(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#48CAE4]"
          />
        </div>

        {/* Seleção de Estante e Prateleira em duas colunas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="estante"
              className="block text-gray-700 text-sm font-semibold mb-2"
            >
              Estante:
            </label>
            <select
              id="estante"
              value={selectedEstanteId}
              onChange={(e) => {
                setSelectedEstanteId(e.target.value);
                setIdPrateleira("");
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#48CAE4]"
            >
              <option value="">Selecione uma Estante</option>
              {estantes.map((estante) => (
                <option key={estante.id} value={estante.id}>
                  {estante.nome}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="prateleira"
              className="block text-gray-700 text-sm font-semibold mb-2"
            >
              Prateleira:
            </label>
            <select
              id="prateleira"
              value={idPrateleira}
              onChange={(e) => setIdPrateleira(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#48CAE4]"
              disabled={!selectedEstanteId || prateleiras.length === 0}
            >
              <option value="">Selecione uma Prateleira</option>
              {prateleiras.map((prateleira) => (
                <option key={prateleira.id} value={prateleira.id}>
                  {prateleira.nome}
                </option>
              ))}
            </select>
            {!selectedEstanteId && (
              <p className="text-xs text-gray-500 mt-1">
                Selecione uma estante primeiro para ver as prateleiras.
              </p>
            )}
            {selectedEstanteId && prateleiras.length === 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Nenhuma prateleira encontrada para esta estante.
              </p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="notas"
            className="block text-gray-700 text-sm font-semibold mb-2"
          >
            Notas Pessoais:
          </label>
          <textarea
            id="notas"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#48CAE4] h-24 resize-y"
          ></textarea>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#004AAD] text-white p-3 rounded-lg font-bold text-lg hover:bg-[#0077B6] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#0096C7]"
        >
          {loading ? "Adicionando..." : "Salvar Livro"}
        </button>
      </form>
    </div>
  );
}

export default AddBookForm;
