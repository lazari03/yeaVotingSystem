"use client";

import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import app from "../../firebaseConfig/firebase";
import { useRouter } from "next/navigation";

const LoginForm: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const auth = getAuth(app);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();

      document.cookie = `session=${token}; max-age=${60 * 60 * 24 * 7}; path=/; Secure; SameSite=Strict`;
      router.push("/dashboard");
    } catch (err: unknown) {
      // Verbose console logging for debugging the identitytoolkit 400 response
      console.error("Firebase signIn error:", err);

      // Try to extract Identity Toolkit response details
      const error = err as { customData?: { _tokenResponse?: { error?: { message?: string }; error_description?: string } }; message?: string };
      const tokenResponse = error?.customData?._tokenResponse;
      const serverMessage = tokenResponse?.error?.message || tokenResponse?.error_description || error?.message;

      // Map common Identity Toolkit messages to friendlier text
      let friendly = "Login failed. Check your email and password.";
      if (serverMessage) {
        if (serverMessage.includes("EMAIL_NOT_FOUND")) friendly = "Email not found. Please register first.";
        else if (serverMessage.includes("INVALID_PASSWORD")) friendly = "Invalid password. Please try again.";
        else if (serverMessage.includes("USER_DISABLED")) friendly = "This user account has been disabled.";
        else friendly = serverMessage;
      }

      setError(friendly);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-5">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md flex flex-col gap-5">
        <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-4">Login</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="p-2 text-lg border border-gray-300 rounded-md bg-white/90 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="p-2 text-lg border border-gray-300 rounded-md bg-white/90 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button
          type="submit"
          disabled={loading}
          className="p-3 text-lg font-bold text-white bg-blue-500 rounded-md hover:bg-blue-600 transition disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Login"}
        </button>

        {error && <div className="p-3 text-red-600 bg-red-100 rounded-md text-center">{error}</div>}
      </form>
    </div>
  );
};

export default LoginForm;
