import { useState } from "react";

import { AuthField, FormMessage, PrimaryButton, TextLink } from "../components/AuthControls";
import { AuthLayout } from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";
import { utf8ByteLength } from "../utils/validation";

export function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    setError("");
    if (password.length < 8) {
      setError("Choose a password with at least 8 characters.");
      return;
    }
    if (utf8ByteLength(password) > 72) {
      setError("Your password is too long. Please use 72 bytes or fewer.");
      return;
    }
    setLoading(true);
    try {
      await register({ name: name.trim(), email: email.trim(), password });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Your next chapter." subtitle="Create an account to make room for a little more you.">
      <AuthField label="Your name" value={name} onChangeText={setName} placeholder="How should we call you?" autoCapitalize="words" autoComplete="name" textContentType="name" />
      <AuthField label="Email address" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoComplete="email" textContentType="emailAddress" />
      <AuthField label="Create a password" value={password} onChangeText={setPassword} placeholder="At least 8 characters" secureTextEntry autoComplete="new-password" textContentType="newPassword" />
      <FormMessage message={error} />
      <PrimaryButton title="Create account" onPress={handleRegister} loading={loading} />
      <TextLink title="Already have an account? Sign in" onPress={() => navigation.navigate("Login")} disabled={loading} />
    </AuthLayout>
  );
}
