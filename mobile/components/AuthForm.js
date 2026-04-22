import { useState } from "react";
import { Button, Text, TextInput, View, StyleSheet } from "react-native";

export default function AuthForm({ title, submitLabel, onSubmit, errorMessage }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>

            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                autoCapitalize="none"
                keyboardType="email-address"
                onChangeText={setEmail}
            />

            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                secureTextEntry
                onChangeText={setPassword}
            />

            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
            <Button title={submitLabel} onPress={() => onSubmit({ email, password })} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        gap: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: "600",
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    errorText: {
        color: "#b00020",
    },
});