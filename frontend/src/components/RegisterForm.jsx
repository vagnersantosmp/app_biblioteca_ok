import { useState } from "react";
import { auth } from "../services/api.js"; // Importa o serviço de autenticação

function RegisterForm({ onAuthSuccess, setMessage }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); // Limpa mensagens anteriores
    try {
      // Chama a função de registro do serviço de API
      const data = await auth.register(username, password, email);
      if (data.status === "sucesso") {
        // Após o registro bem-sucedido, tenta fazer login automaticamente
        const loginData = await auth.login(username, password);
        if (loginData.status === "sucesso") {
          onAuthSuccess(loginData.token, username); // Chama a função de sucesso do App.jsx
        } else {
          setMessage(
            `Erro ao fazer login automático: ${
              loginData.mensagem || "Tente fazer login manualmente."
            }`
          );
        }
      } else {
        setMessage(`Erro ao registrar: ${data.mensagem || "Tente novamente."}`);
      }
    } catch (error) {
      setMessage("Erro de conexão. Verifique o backend.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="register-username"
          className="block text-gray-700 text-sm font-semibold mb-2"
        >
          Usuário:
        </label>
        <input
          type="text"
          id="register-username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#48CAE4]"
          required
        />
      </div>
      <div>
        <label
          htmlFor="register-password"
          className="block text-gray-700 text-sm font-semibold mb-2"
        >
          Senha:
        </label>
        <input
          type="password"
          id="register-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#48CAE4]"
          required
        />
      </div>
      <div>
        <label
          htmlFor="register-email"
          className="block text-gray-700 text-sm font-semibold mb-2"
        >
          Email (Opcional):
        </label>
        <input
          type="email"
          id="register-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#48CAE4]"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-[#004AAD] text-white p-3 rounded-lg font-bold text-lg hover:bg-[#0077B6] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#0096C7]"
      >
        Registrar
      </button>
    </form>
  );
}

export default RegisterForm;
