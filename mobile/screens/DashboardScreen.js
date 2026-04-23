import { useCallback, useContext, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Button,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import AddTransactionForm from "../components/AddTransactionForm";
import TransactionList from "../components/TransactionList";
import { AuthContext } from "../context/AuthContext";
import { deleteTransaction, getAnalyticsSummary, getTransactions } from "../services/api";

export default function DashboardScreen() {
    const { user, logout } = useContext(AuthContext);
    const [summary, setSummary] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [mutationBusy, setMutationBusy] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [editingTransaction, setEditingTransaction] = useState(null);

    const loadAll = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            setErrorMessage("");
            const [summaryRes, txRes] = await Promise.all([getAnalyticsSummary(), getTransactions()]);
            setSummary(summaryRes.summary || null);
            setTransactions(txRes.transactions || []);
        } catch (error) {
            const msg = error?.response?.data?.message || error?.message || "Failed to load data.";
            setErrorMessage(typeof msg === "string" ? msg : "Failed to load data.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadAll(false);
    }, [loadAll]);

    async function handleDelete(id) {
        try {
            setMutationBusy(true);
            setErrorMessage("");
            await deleteTransaction(id);
            setEditingTransaction(null);
            await loadAll(false);
        } catch (error) {
            const msg = error?.response?.data?.message || error?.message || "Delete failed.";
            setErrorMessage(typeof msg === "string" ? msg : "Delete failed.");
        } finally {
            setMutationBusy(false);
        }
    }

    function handleEdit(item) {
        setEditingTransaction(item);
    }

    function handleCancelEdit() {
        setEditingTransaction(null);
    }

    async function handleAfterSave() {
        setEditingTransaction(null);
        await loadAll(false);
    }

    const income = summary?.totalIncome ?? 0;
    const expenses = summary?.totalExpenses ?? 0;
    const balance = summary?.currentBalance ?? 0;

    return (
        <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadAll(true)} />}
        >
            <Text style={styles.title}>Dashboard</Text>
            <Text style={styles.subtitle}>Welcome to your Personal Finance App.</Text>
            {user?.email ? <Text style={styles.subtitle}>Logged in as {user.email}</Text> : null}

            {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" />
                    <Text style={styles.muted}>Loading…</Text>
                </View>
            ) : (
                <>
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryTitle}>Summary</Text>
                        <Text style={styles.summaryLine}>Total income: {Number(income).toFixed(2)}</Text>
                        <Text style={styles.summaryLine}>Total expenses: {Number(expenses).toFixed(2)}</Text>
                        <Text style={styles.summaryLine}>Current balance: {Number(balance).toFixed(2)}</Text>
                    </View>

                    <AddTransactionForm
                        onSuccess={handleAfterSave}
                        editingTransaction={editingTransaction}
                        onCancelEdit={handleCancelEdit}
                    />

                    <TransactionList
                        transactions={transactions}
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                        busy={mutationBusy}
                    />
                </>
            )}

            <View style={styles.buttonWrapper}>
                <Button title="Log Out" onPress={logout} />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scroll: {
        flex: 1,
        backgroundColor: "#fff",
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: "#555",
        marginBottom: 6,
    },
    error: {
        color: "#b00020",
        marginVertical: 8,
    },
    muted: {
        color: "#666",
        marginTop: 8,
    },
    centered: {
        paddingVertical: 24,
        alignItems: "center",
    },
    summaryCard: {
        width: "100%",
        padding: 12,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        marginBottom: 16,
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 8,
    },
    summaryLine: {
        fontSize: 15,
        marginBottom: 4,
    },
    buttonWrapper: {
        marginTop: 16,
        width: "100%",
    },
});