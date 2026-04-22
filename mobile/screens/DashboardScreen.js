import { Button, StyleSheet, Text, View } from "react-native";

export default function DashboardScreen({ navigation }) {
    return (
        <View style={styles.screen}>
            <Text style={styles.title}>Dashboard</Text>
            <Text style={styles.subtitle}>Welcome to your own personal finance tracker app!</Text>
            <Text style={styles.subtitle}>This is a placeholder dashhoard screen.</Text>

            <View style={styles.buttonWrapper}>
                <Button title="Log out" onPress={() => navigation.navigate("Login")} />
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