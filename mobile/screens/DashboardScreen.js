import { useContext } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { AuthContext } from "../context/AuthContext";

export default function DashboardScreen() {
    const { user, logout } = useContext(AuthContext);

    return (
        <View style={styles.screen}>
            <Text style={styles.title}>Dashboard</Text>
            <Text style={styles.subtitle}>Welcome to your own personal finance tracker app!</Text>
            {user?.email ? <Text style={styles.subtitle}>Logged in as {user.email}</Text> : null}
            <Text style={styles.subtitle}>This is a placeholder dashhoard screen.</Text>

            <View style={styles.buttonWrapper}>
                <Button title="Log Out" onPress={logout} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: "#555",
        marginBottom: 6,
        textAlign: "center",
    },
    buttonWrapper: {
        marginTop: 20,
        width: "60%",
    },
});