import { useContext, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import AuthForm from "../components/AuthForm";
import { AuthContext } from "../context/AuthContext";

export default function RegisterScreen({ navigation }) {
    const [errorMessage, setErrorMessage] = useState("");
    const { register } = useContext(AuthContext);

    async function handleRegister(payload) {
        try {
            setErrorMessage("");
            await register(payload);
        } catch (_error) {
            setErrorMessage("Registration failed. Try a different email!");
        }
    }

    return (
        <View style={styles.screen}>
            <AuthForm
                title="Register"
                submitLabel="Create Account"
                onSubmit={handleRegister}
                errorMessage={errorMessage}
            />

            <Pressable style={styles.linkContainer} onPress={() => navigation.goBack()}>
                <Text style={styles.linkText}>Already have an account? Sign in</Text>
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