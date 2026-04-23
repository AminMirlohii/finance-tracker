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
                        <Text style={[styles.amount, item.type === "income" ? styles.income : styles.expense]}>
                            {formatAmount(item)}
                        </Text>
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
        backgroundColor: "#141B23",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#263241",
        paddingHorizontal: 12,
        paddingTop: 12,
    },
    listTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#F5F7FA",
        marginBottom: 6,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#263241",
        marginBottom: 2,
    },
    rowMain: {
        flex: 1,
        gap: 3,
    },
    amount: {
        fontSize: 16,
        fontWeight: "600",
    },
    income: {
        color: "#30D07F",
    },
    expense: {
        color: "#FF6B6B",
    },
    category: {
        fontSize: 14,
        color: "#E4EAF2",
    },
    date: {
        fontSize: 12,
        color: "#9AA4B2",
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
        color: "#9AA4B2",
    },
});
