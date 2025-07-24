import { useState } from "react";
import { auth } from "../services/api.js"; // Importa o serviço de autenticação

function LoginForm({ onAuthSuccess, setMessage }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Estado de carregamento

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); // Limpa mensagens anteriores
    setLoading(true); // Ativa o estado de carregamento
    try {
      const data = await auth.login(username, password);
      if (data.status === "sucesso") {
        onAuthSuccess(data.token, username); // Passa o username real
      } else {
        setMessage(
          `Erro ao entrar: ${data.mensagem || "Verifique suas credenciais."}`
        );
      }
    } catch (error) {
      setMessage("Erro de conexão. Verifique o backend.");
    } finally {
      setLoading(false); // Desativa o estado de carregamento
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4">
      {" "}
      {/* Aumentado o espaçamento */}
      <div>
        <label
          htmlFor="login-username"
          className="block text-gray-700 text-sm font-semibold mb-2"
        >
          Usuário:
        </label>
        <input
          type="text"
          id="login-username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#48CAE4] transition-all duration-150"
          required
        />
      </div>
      <div>
        <label
          htmlFor="login-password"
          className="block text-gray-700 text-sm font-semibold mb-2"
        >
          Senha:
        </label>
        <input
          type="password"
          id="login-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#48CAE4] transition-all duration-150"
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#004AAD] text-white p-3 rounded-lg font-bold text-lg hover:bg-[#0077B6] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#0096C7] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}

export default LoginForm;
