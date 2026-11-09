import { useState } from "react";
import { AuthLayout } from "../components/AuthLayout";
import { AuthField, FormMessage, PrimaryButton, TextLink } from "../components/AuthControls";
import { useAuth } from "../context/AuthContext";

export function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError("");
    setLoading(true);
    try {
      await login({ email: email.trim(), password });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Welcome back." subtitle="Sign in to pick up where your personal style journey left off.">
      <AuthField label="Email address" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoComplete="email" textContentType="emailAddress" />
      <AuthField label="Password" value={password} onChangeText={setPassword} placeholder="Your password" secureTextEntry autoComplete="current-password" textContentType="password" />
      <TextLink title="Forgot password?" onPress={() => navigation.navigate("ForgotPassword")} disabled={loading} />
      <FormMessage message={error} />
      <PrimaryButton title="Sign in" onPress={handleLogin} loading={loading} />
      <TextLink title="New to AURA? Create an account" onPress={() => navigation.navigate("Register")} disabled={loading} />
    </AuthLayout>
  );
}
