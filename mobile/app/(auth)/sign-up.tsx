import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";

export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSignUp() {
    if (!isLoaded) return;
    setLoading(true);
    setError("");
    try {
      await signUp.create({ emailAddress: email, password });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setVerifying(true);
    } catch (err: any) {
      setError(err.errors?.[0]?.message ?? "Sign up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify() {
    if (!isLoaded) return;
    setLoading(true);
    setError("");
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      await setActive({ session: result.createdSessionId });
      router.replace("/(tabs)/my-courses");
    } catch (err: any) {
      setError(err.errors?.[0]?.message ?? "Verification failed.");
    } finally {
      setLoading(false);
    }
  }

  if (verifying) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Text style={styles.logo}>MasterMinding</Text>
        <Text style={styles.title}>Check your email</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit code to {email}
        </Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="Enter code"
          placeholderTextColor="#94a3b8"
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
        />
        <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify</Text>}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.logo}>MasterMinding</Text>
      <Text style={styles.title}>Create your account</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#94a3b8"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#94a3b8"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create account</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/(auth)/sign-in")}>
        <Text style={styles.link}>Already have an account? Sign in</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", justifyContent: "center", paddingHorizontal: 24 },
  logo: { fontSize: 20, fontWeight: "700", color: "#0F766E", textAlign: "center", marginBottom: 8 },
  title: { fontSize: 22, fontWeight: "600", color: "#0f172a", textAlign: "center", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#64748b", textAlign: "center", marginBottom: 24 },
  error: { color: "#dc2626", fontSize: 13, textAlign: "center", marginBottom: 12 },
  input: { height: 48, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, paddingHorizontal: 14, fontSize: 15, color: "#0f172a", marginBottom: 12 },
  button: { height: 48, backgroundColor: "#0F766E", borderRadius: 10, justifyContent: "center", alignItems: "center", marginTop: 4, marginBottom: 16 },
  buttonText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  link: { color: "#0F766E", fontSize: 14, textAlign: "center" },
});
