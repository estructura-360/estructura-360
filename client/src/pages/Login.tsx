import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    alert(error.message);
  } else {
    window.location.href = "/";
  }
};
  const handleSignup = async () => {
  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) alert(error.message);
  else alert("Cuenta creada. Revisa tu correo.");
};

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: "url('/login-bg.jpeg')" }}
    >
      <div className="bg-black/60 backdrop-blur-md rounded-xl p-8 w-full max-w-md text-white">

        <img
          src="/logo-estructura-360.png"
          className="h-14 mx-auto mb-6"
        />

        <h1 className="text-center text-xl mb-6">
          Inicio de sesión
        </h1>

        <input
  type="email"
  placeholder="Correo electrónico"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  className="w-full p-3 rounded mb-3 text-black"
/>
      <input
  type="password"
  placeholder="Contraseña"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  className="w-full p-3 rounded mb-4 text-black"
/>

        <button
  onClick={handleLogin}
  className="w-full bg-orange-500 hover:bg-orange-600 text-white p-3 rounded font-semibold"
>
  Entrar
</button>

<button
  onClick={handleSignup}
  className="w-full border border-white text-white py-2 rounded-lg mt-3"
>
  Crear cuenta
</button>

        <div className="text-center text-sm mt-4 opacity-80">
          Estructura 360 Engineering
        </div>
      </div>
    </div>
  );
}
