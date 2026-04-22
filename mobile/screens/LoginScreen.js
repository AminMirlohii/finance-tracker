import { useContext, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import AuthForm from "../components/AuthForm";
import { AuthContext } from "../context/AuthContext";


export default function LoginScreen({ navigation }) {
    const [errorMessage, setErrorMessage] = useState("");
    const { login } = useContext(AuthContext);

    async function handleLogin(payload) {
        try {
            setErrorMessage("");
            await login(payload);
        } catch (_error) {
            setErrorMessage("Login failed. Try again!");
        }
    }
    return (
        <View style={styles.screen}>
            <AuthForm
                title="Login"
                submitLabel="Sign In"
                onSubmit={handleLogin}
                errorMessage={errorMessage}
            />

            <Pressable style={styles.linkContainer} onPress={() => navigation.navigate("Register")}>
                <Text style={styles.linkText}>No account ? Create one</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        justifyContent: "center",
        padding: 20,
        backgroundColor: "#fff",
    },
    linkContainer: {
        marginTop: 14,
        alignItems: "center",
    },
    linkText: {
        color: "#1e64d9",
        fontWeight: "500",
    },
});