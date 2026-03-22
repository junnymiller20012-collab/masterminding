import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.replace("/(auth)/sign-in");
  }

  return (
    <View style={styles.container}>
      {user?.imageUrl ? (
        <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarInitial}>
            {user?.fullName?.[0] ?? "M"}
          </Text>
        </View>
      )}
      <Text style={styles.name}>{user?.fullName ?? "Mentor"}</Text>
      <Text style={styles.email}>
        {user?.primaryEmailAddress?.emailAddress}
      </Text>

      <TouchableOpacity style={styles.signOut} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#f8fafc", padding: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 12 },
  avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#0F766E", justifyContent: "center", alignItems: "center", marginBottom: 12 },
  avatarInitial: { fontSize: 32, fontWeight: "700", color: "#fff" },
  name: { fontSize: 20, fontWeight: "600", color: "#0f172a", marginBottom: 4 },
  email: { fontSize: 14, color: "#64748b", marginBottom: 32 },
  signOut: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: "#e2e8f0" },
  signOutText: { fontSize: 14, color: "#64748b", fontWeight: "500" },
});
