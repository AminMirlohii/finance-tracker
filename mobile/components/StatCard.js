import { StyleSheet, Text, View } from "react-native";

export default function StatCard({ title, value, accent = "neutral", subtitle }) {
    const accentStyle =
        accent === "positive" ? styles.valuePositive : accent === "negative" ? styles.valueNegative : styles.valueNeutral;

    return (
        <View style={styles.card}>
            <Text style={styles.title}>{title}</Text>
            <Text style={[styles.value, accentStyle]}>{value}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flex: 1,
        minWidth: 100,
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: "#2A3648",
        borderRadius: 14,
        backgroundColor: "#151E29",
        gap: 6,
    },
    title: {
        fontSize: 14,
        color: "#B9C2D0",
        fontWeight: "500",
    },
    value: {
        fontSize: 34,
        fontWeight: "700",
        letterSpacing: 0.2,
    },
    valuePositive: {
        color: "#30D07F",
    },
    valueNegative: {
        color: "#FF6B6B",
    },
    valueNeutral: {
        color: "#F5F7FA",
    },
    subtitle: {
        fontSize: 12,
        color: "#8F9BAA",
    },
});
