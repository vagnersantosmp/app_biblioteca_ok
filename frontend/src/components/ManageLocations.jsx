import { useState, useEffect } from "react";
import { locations } from "../services/api.js"; // Importa o serviço de locais

function ManageLocations({ setMessage }) {
  const [estantes, setEstantes] = useState([]);
  const [prateleiras, setPrateleiras] = useState([]);
  const [newEstanteName, setNewEstanteName] = useState("");
  const [newPrateleiraName, setNewPrateleiraName] = useState("");
  const [selectedEstanteForPrateleira, setSelectedEstanteForPrateleira] =
    useState("");
  const [loading, setLoading] = useState(false);

  const fetchLocations = async () => {
    setLoading(true);
    setMessage("");
    try {
      const estantesData = await locations.fetchEstantes();
      if (estantesData.status === "sucesso") {
        setEstantes(estantesData.estantes);
      } else {
        setMessage(`Erro ao carregar estantes: ${estantesData.mensagem}`);
      }

      const prateleirasData = await locations.fetchAllPrateleiras();
      if (prateleirasData.status === "sucesso") {
        setPrateleiras(prateleirasData.prateleiras);
      } else {
        setMessage(`Erro ao carregar prateleiras: ${prateleirasData.mensagem}`);
      }
    } catch (err) {
      setMessage("Erro de conexão ao carregar locais. Verifique o backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleAddEstante = async (e) => {
    e.preventDefault();
    if (!newEstanteName) {
      setMessage("Nome da estante é obrigatório.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const data = await locations.addEstante(newEstanteName);
      if (data.status === "sucesso") {
        setMessage("Estante criada com sucesso!");
        setNewEstanteName("");
        fetchLocations(); // Recarrega a lista
      } else {
        setMessage(`Erro ao criar estante: ${data.mensagem}`);
      }
    } catch (err) {
      setMessage("Erro de conexão ao criar estante.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPrateleira = async (e) => {
    e.preventDefault();
    if (!newPrateleiraName || !selectedEstanteForPrateleira) {
      setMessage("Nome da prateleira e estante são obrigatórios.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(
        `${API_BASE_URL}/estantes/${selectedEstanteForPrateleira}/prateleiras`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ nome: newPrateleiraName }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setMessage("Prateleira criada com sucesso!");
        setNewPrateleiraName("");
        setSelectedEstanteForPrateleira("");
        fetchLocations(); // Recarrega a lista
      } else {
        setMessage(`Erro ao criar prateleira: ${data.mensagem}`);
      }
    } catch (err) {
      setMessage("Erro de conexão ao criar prateleira.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#e0f2fe] p-6 rounded-lg shadow-inner mb-6 text-left">
      <h3 className="text-xl font-bold text-[#004AAD] mb-4 text-center">
        Gerenciar Estantes e Prateleiras
      </h3>

      {/* Adicionar Estante */}
      <form
        onSubmit={handleAddEstante}
        className="mb-6 p-4 bg-white rounded-lg shadow-sm space-y-3"
      >
        <h4 className="font-semibold text-gray-700">Adicionar Nova Estante</h4>
        <div>
          <label
            htmlFor="new-estante-name"
            className="block text-gray-700 text-sm font-semibold mb-2"
          >
            Nome da Estante:
          </label>
          <input
            type="text"
            id="new-estante-name"
            value={newEstanteName}
            onChange={(e) => setNewEstanteName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#48CAE4]"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#004AAD] text-white p-2 rounded-lg font-bold text-md hover:bg-[#0077B6] transition-colors duration-200"
        >
          {loading ? "Adicionando..." : "Criar Estante"}
        </button>
      </form>

      {/* Adicionar Prateleira */}
      <form
        onSubmit={handleAddPrateleira}
        className="mb-6 p-4 bg-white rounded-lg shadow-sm space-y-3"
      >
        <h4 className="font-semibold text-gray-700">
          Adicionar Nova Prateleira
        </h4>
        <div>
          <label
            htmlFor="select-estante-prateleira"
            className="block text-gray-700 text-sm font-semibold mb-2"
          >
            Selecionar Estante:
          </label>
          <select
            id="select-estante-prateleira"
            value={selectedEstanteForPrateleira}
            onChange={(e) => setSelectedEstanteForPrateleira(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#48CAE4]"
            required
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
            htmlFor="new-prateleira-name"
            className="block text-gray-700 text-sm font-semibold mb-2"
          >
            Nome da Prateleira:
          </label>
          <input
            type="text"
            id="new-prateleira-name"
            value={newPrateleiraName}
            onChange={(e) => setNewPrateleiraName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#48CAE4]"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#004AAD] text-white p-2 rounded-lg font-bold text-md hover:bg-[#0077B6] transition-colors duration-200"
        >
          {loading ? "Adicionando..." : "Criar Prateleira"}
        </button>
      </form>

      {/* Listar Estantes */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
        <h4 className="font-semibold text-gray-700 mb-2">Suas Estantes:</h4>
        {estantes.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhuma estante cadastrada.</p>
        ) : (
          <ul className="space-y-1">
            {estantes.map((estante) => (
              <li key={estante.id} className="text-sm text-gray-800">
                {estante.nome} (ID: {estante.id})
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Listar Prateleiras */}
      <div className="p-4 bg-white rounded-lg shadow-sm">
        <h4 className="font-semibold text-gray-700 mb-2">Suas Prateleiras:</h4>
        {prateleiras.length === 0 ? (
          <p className="text-sm text-gray-500">
            Nenhuma prateleira cadastrada.
          </p>
        ) : (
          <ul className="space-y-1">
            {prateleiras.map((prateleira) => (
              <li key={prateleira.id} className="text-sm text-gray-800">
                {prateleira.nome} (Estante: {prateleira.nome_estante || "N/A"})
                (ID: {prateleira.id})
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default ManageLocations;
