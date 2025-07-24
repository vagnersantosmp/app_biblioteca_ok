import { useState, useRef } from "react";
import { books } from "../services/api.js"; // Importa o serviço de livros
import AddBookForm from "./AddBookForm.jsx"; // Importa o componente de adicionar livro
import ManageLocations from "./ManageLocations.jsx"; // Importa o componente de gerenciar locais

function Dashboard({ username, onLogout, setMessage }) {
  const [booksList, setBooksList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAddBookForm, setShowAddBookForm] = useState(false);
  const [showManageLocations, setShowManageLocations] = useState(false);

  const scrollContainerRef = useRef(null); // Cria uma referência para o container de scroll

  // Função para buscar os livros do usuário no backend
  const fetchBooks = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await books.fetchBooks(); // Chama a função do serviço de API
      if (data.status === "sucesso") {
        setBooksList(data.livros);
      } else {
        setError(`Erro ao carregar livros: ${data.mensagem || "Desconhecido"}`);
      }
    } catch (err) {
      setError("Erro de conexão ao buscar livros. Verifique o backend.");
    } finally {
      setLoading(false);
    }
  };

  // Função chamada após um livro ser adicionado com sucesso
  const handleBookAdded = () => {
    setMessage("Livro adicionado com sucesso!");
    setShowAddBookForm(false); // Esconde o formulário
    fetchBooks(); // Recarrega a lista de livros
  };

  // Função para gerar URL de busca no Google para a capa do livro
  const getSearchUrl = (title, authors) => {
    const query = encodeURIComponent(`${title} ${authors || ""} book`);
    return `https://www.google.com/search?q=${query}`;
  };

  // Funções de rolagem horizontal
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -200, // Ajuste o valor para a quantidade de scroll desejada
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 200, // Ajuste o valor para a quantidade de scroll desejada
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="text-center">
      <h2 className="text-2xl font-semibold text-[#0077B6] mb-4">
        Bem-vindo, {username}!
      </h2>
      <p className="text-gray-600 mb-6">Gerencie seu Catálogo de Livros.</p>

      {/* Botões de Ação */}
      <div className="flex flex-col space-y-3 mb-6">
        <button
          onClick={() => {
            setShowAddBookForm(!showAddBookForm);
            setShowManageLocations(false);
          }}
          className="bg-[#0096C7] text-white px-6 py-3 rounded-lg font-bold text-lg hover:bg-[#48CAE4] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#004AAD]"
        >
          {showAddBookForm ? "Ocultar Formulário" : "Adicionar Novo Livro"}
        </button>
        <button
          onClick={() => {
            setShowManageLocations(!showManageLocations);
            setShowAddBookForm(false);
          }}
          className="bg-[#0077B6] text-white px-6 py-3 rounded-lg font-bold text-lg hover:bg-[#0096C7] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#004AAD]"
        >
          {showManageLocations
            ? "Ocultar Gerenciamento de Locais"
            : "Gerenciar Estantes e Prateleiras"}
        </button>
        <button
          onClick={fetchBooks}
          className="bg-[#023E8A] text-white px-6 py-3 rounded-lg font-bold text-lg hover:bg-[#004AAD] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#004AAD]"
        >
          Atualizar Lista de Livros
        </button>
      </div>

      {/* Renderiza formulários/componentes com base no estado */}
      {showAddBookForm && (
        <AddBookForm onBookAdded={handleBookAdded} setMessage={setMessage} />
      )}
      {showManageLocations && <ManageLocations setMessage={setMessage} />}

      {/* Exibe status de carregamento ou erro */}
      {loading && <p className="text-gray-500">Carregando livros...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Lista de Livros - Agora com scroll horizontal e botões */}
      {booksList.length > 0 ? (
        <div className="mt-6 text-left relative">
          {" "}
          {/* Adicionado relative para posicionar botões */}
          <h3 className="text-xl font-semibold text-[#0077B6] mb-3">
            Seus Livros:
          </h3>
          {/* Botão de rolagem para a esquerda */}
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-gray-700 text-white p-2 rounded-full shadow-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 z-10"
          >
            &#x25C0; {/* Seta para a esquerda */}
          </button>
          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto space-x-4 p-4 bg-[#CAF0F8] rounded-lg shadow-inner scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200"
          >
            {booksList.map((book) => (
              <div
                key={book.id}
                className="flex-none w-40 bg-white rounded-lg shadow-md border border-gray-200 p-3 flex flex-col items-center text-center"
              >
                {/* Capa do Livro com link para busca no Google */}
                {book.capa_url ? (
                  <a
                    href={getSearchUrl(book.titulo, book.autores)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={book.capa_url}
                      alt={`Capa de ${book.titulo}`}
                      className="w-24 h-36 object-cover rounded-md shadow-md"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://placehold.co/96x144/cccccc/333333?text=Sem+Capa";
                      }}
                    />
                  </a>
                ) : (
                  <a
                    href={getSearchUrl(book.titulo, book.autores)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="w-24 h-36 bg-gray-200 rounded-md shadow-md flex items-center justify-center text-center text-xs text-gray-500 flex-shrink-0">
                      Sem Capa
                    </div>
                  </a>
                )}
                {/* Detalhes do Livro */}
                <div className="flex-grow">
                  <a
                    href={getSearchUrl(book.titulo, book.autores)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-gray-800 hover:text-[#004AAD] transition-colors duration-200 text-sm leading-tight"
                  >
                    {book.titulo}
                  </a>
                  <p className="text-xs text-gray-600 mt-1">
                    Autor: {book.autores}
                  </p>
                  <p className="text-xs text-gray-500">
                    Gênero: {book.genero || "N/A"}
                  </p>
                  <p className="text-xs text-gray-500">
                    Localização: {book.nome_estante || "N/A"} -{" "}
                    {book.nome_prateleira || "N/A"}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {/* Botão de rolagem para a direita */}
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-gray-700 text-white p-2 rounded-full shadow-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 z-10"
          >
            &#x25B6; {/* Seta para a direita */}
          </button>
        </div>
      ) : (
        !loading &&
        !error &&
        !showAddBookForm &&
        !showManageLocations && (
          <p className="text-gray-500 mt-6">
            Nenhum livro encontrado. Adicione alguns!
          </p>
        )
      )}

      {/* Botão de Sair */}
      <button
        onClick={onLogout}
        className="mt-8 w-full bg-gray-500 text-white p-3 rounded-lg font-bold text-lg hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#0096C7]"
      >
        Sair
      </button>
    </div>
  );
}

export default Dashboard;
