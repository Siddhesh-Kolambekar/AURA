import { useEffect, useState } from "react";
import { AuthField, FormMessage, PrimaryButton, TextLink } from "../components/AuthControls";
import { AuthLayout } from "../components/AuthLayout";
import { apiRequest } from "../services/api";
import { utf8ByteLength } from "../utils/validation";

export function ResetPasswordScreen({ navigation, route }) {
  const [token, setToken] = useState(route.params?.token || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (route.params?.token) setToken(route.params.token);
  }, [route.params?.token]);

  async function handleSubmit() {
    setError("");
    setSuccess("");
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
      await apiRequest("/auth/reset-password", {
        method: "POST",
        body: { token: token.trim(), password }
      });
      setSuccess("Your password has been updated. You can sign in with it now.");
      setPassword("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Make it yours again." subtitle="Enter the reset code from your email and choose a new password.">
      <AuthField label="Reset code" value={token} onChangeText={setToken} placeholder="Paste your reset code" autoCapitalize="none" autoComplete="off" />
      <AuthField label="New password" value={password} onChangeText={setPassword} placeholder="At least 8 characters" secureTextEntry autoComplete="new-password" textContentType="newPassword" />
      <FormMessage message={error} />
      <FormMessage success message={success} />
      <PrimaryButton title="Update password" onPress={handleSubmit} loading={loading} />
      {success ? <TextLink title="Go to sign in" onPress={() => navigation.navigate("Login")} disabled={loading} /> : null}
      {!success ? <TextLink title="Back to sign in" onPress={() => navigation.navigate("Login")} disabled={loading} /> : null}
    </AuthLayout>
  );
}
