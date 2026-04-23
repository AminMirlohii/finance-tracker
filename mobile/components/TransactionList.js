import { Button, StyleSheet, Text, View } from "react-native";

function formatAmount(item) {
    const n = Number(item.amount);
    const prefix = item.type === "expense" ? "-" : "+";
    return `${prefix}${Number.isFinite(n) ? n.toFixed(2) : item.amount}`;
}

export default function TransactionList({ transactions, onDelete, onEdit, busy }) {
    if (!transactions?.length) {
        return (
            <View style={styles.empty}>
                <Text style={styles.emptyText}>No transactions yet.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.listTitle}>Transactions</Text>
            {transactions.map((item) => (
                <View key={item.id} style={styles.row}>
                    <View style={styles.rowMain}>
                        <Text style={styles.amount}>{formatAmount(item)}</Text>
                        <Text style={styles.category}>{item.category}</Text>
                        <Text style={styles.date}>{item.date}</Text>
                    </View>
                    <View style={styles.rowActions}>
                        <Button title="Edit" onPress={() => onEdit(item)} disabled={busy} />
                        <Button title="Delete" color="#b00020" onPress={() => onDelete(item.id)} disabled={busy} />
                    </View>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        marginBottom: 24,
    },
    listTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 8,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#ccc",
    },
    rowMain: {
        flex: 1,
        gap: 2,
    },
    amount: {
        fontSize: 16,
        fontWeight: "600",
    },
    category: {
        fontSize: 14,
        color: "#333",
    },
    date: {
        fontSize: 12,
        color: "#666",
    },
    rowActions: {
        flexDirection: "column",
        gap: 4,
        alignItems: "flex-end",
    },
    empty: {
        padding: 16,
        alignItems: "center",
    },
    emptyText: {
        color: "#666",
    },
});
