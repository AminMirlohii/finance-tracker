import { useEffect, useState } from "react";
import { ActivityIndicator, Button, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { createTransaction, updateTransaction } from "../services/api";

function todayYmd() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

export default function AddTransactionForm({ onSuccess, editingTransaction, onCancelEdit }) {
    const [amount, setAmount] = useState("");
    const [type, setType] = useState("expense");
    const [category, setCategory] = useState("");
    const [date, setDate] = useState(todayYmd());
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (editingTransaction) {
            setAmount(String(editingTransaction.amount ?? ""));
            setType(editingTransaction.type || "expense");
            setCategory(editingTransaction.category || "");
            setDate(editingTransaction.date || todayYmd());
        } else {
            setAmount("");
            setType("expense");
            setCategory("");
            setDate(todayYmd());
        }
        setErrorMessage("");
    }, [editingTransaction]);

    async function handleSubmit() {
        try {
            setSubmitting(true);
            setErrorMessage("");
            const parsedAmount = Number.parseFloat(String(amount).replace(",", "."));
            if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
                setErrorMessage("Enter a valid amount greater than zero.");
                return;
            }
            if (!category.trim()) {
                setErrorMessage("Category is required.");
                return;
            }
            if (!/^\d{4}-\d{2}-\d{2}$/.test(date.trim())) {
                setErrorMessage("Use date format YYYY-MM-DD.");
                return;
            }
            const payload = {
                amount: parsedAmount,
                type,
                category: category.trim(),
                date: date.trim(),
            };
            if (editingTransaction) {
                await updateTransaction(editingTransaction.id, payload);
                onCancelEdit?.();
            } else {
                await createTransaction(payload);
            }
            onSuccess?.();
            if (!editingTransaction) {
                setAmount("");
                setCategory("");
                setDate(todayYmd());
            }
        } catch (error) {
            const msg =
                error?.response?.data?.message ||
                error?.message ||
                "Could not save transaction.";
            setErrorMessage(typeof msg === "string" ? msg : "Could not save transaction.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <View style={styles.card}>
            <Text style={styles.heading}>{editingTransaction ? "Edit transaction" : "Add transaction"}</Text>

            <TextInput
                style={styles.input}
                placeholder="Amount"
                placeholderTextColor="#8C98A8"
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
            />

            <View style={styles.typeRow}>
                <Pressable style={[styles.typeChip, type === "income" && styles.typeChipActive]} onPress={() => setType("income")}>
                    <Text style={styles.typeChipText}>Income</Text>
                </Pressable>
                <Pressable style={[styles.typeChip, type === "expense" && styles.typeChipActive]} onPress={() => setType("expense")}>
                    <Text style={styles.typeChipText}>Expense</Text>
                </Pressable>
            </View>

            <TextInput
                style={styles.input}
                placeholder="Category"
                placeholderTextColor="#8C98A8"
                value={category}
                onChangeText={setCategory}
            />

            <TextInput
                style={styles.input}
                placeholder="Date (YYYY-MM-DD)"
                placeholderTextColor="#8C98A8"
                value={date}
                onChangeText={setDate}
                autoCapitalize="none"
            />

            {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

            <View style={styles.actions}>
                {submitting ? (
                    <ActivityIndicator />
                ) : (
                    <Button title={editingTransaction ? "Update" : "Add"} onPress={handleSubmit} />
                )}
                {editingTransaction ? <Button title="Cancel edit" onPress={onCancelEdit} color="#666" /> : null}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        width: "100%",
        padding: 14,
        borderWidth: 1,
        borderColor: "#263241",
        borderRadius: 12,
        marginBottom: 18,
        gap: 10,
        backgroundColor: "#141B23",
    },
    heading: {
        fontSize: 18,
        fontWeight: "600",
        color: "#F5F7FA",
        marginBottom: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: "#314055",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        color: "#F5F7FA",
        backgroundColor: "#10161E",
    },
    typeRow: {
        flexDirection: "row",
        gap: 8,
    },
    typeChip: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#314055",
        backgroundColor: "#7a7a7a",
    },
    typeChipActive: {
        borderColor: "#30D07F",
        backgroundColor: "#1bfa90",
    },
    typeChipText: {
        fontWeight: "500",
    },
    error: {
        color: "#b00020",
    },
    actions: {
        marginTop: 4,
        gap: 8,
    },
});
