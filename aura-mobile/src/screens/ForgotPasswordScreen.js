import { useState } from "react";
import { AuthField, FormMessage, PrimaryButton, TextLink } from "../components/AuthControls";
import { AuthLayout } from "../components/AuthLayout";
import { apiRequest } from "../services/api";

export function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError("");
    setLoading(true);
    try {
      await apiRequest("/auth/forgot-password", { method: "POST", body: { email: email.trim() } });
      setSent(true);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="A fresh start." subtitle="Share your email and we’ll help you get back into your AURA account.">
      {sent ? (
        <>
          <FormMessage success message="If an account exists for this address, reset instructions can be sent there. Check your inbox." />
          <PrimaryButton title="Enter reset code" onPress={() => navigation.navigate("ResetPassword")} />
        </>
      ) : (
        <>
          <AuthField label="Email address" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoComplete="email" textContentType="emailAddress" />
          <FormMessage message={error} />
          <PrimaryButton title="Send reset instructions" onPress={handleSubmit} loading={loading} />
        </>
      )}
      <TextLink title="Back to sign in" onPress={() => navigation.navigate("Login")} disabled={loading} />
    </AuthLayout>
  );
}
