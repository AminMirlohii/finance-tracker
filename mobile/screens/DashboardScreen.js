import { useCallback, useContext, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
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
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateYAnim = useRef(new Animated.Value(12)).current;

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

    useEffect(() => {
        if (loading) {
            return;
        }
        fadeAnim.setValue(0);
        translateYAnim.setValue(12);
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 260,
                useNativeDriver: true,
            }),
            Animated.timing(translateYAnim, {
                toValue: 0,
                duration: 260,
                useNativeDriver: true,
            }),
        ]).start();
    }, [loading, summary, fadeAnim, translateYAnim]);

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
    const totalsPerCategory = Array.isArray(summary?.totalsPerCategory)
        ? summary.totalsPerCategory
        : [];

    function asCurrency(value) {
        return Number(value).toFixed(2);
    }

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
                    <Animated.View
                        style={[
                            styles.summaryCard,
                            { opacity: fadeAnim, transform: [{ translateY: translateYAnim }] },
                        ]}
                    >
                        <Text style={styles.summaryTitle}>Summary</Text>
                        <Text style={styles.summaryLine}>Total income: {asCurrency(income)}</Text>
                        <Text style={styles.summaryLine}>Total expenses: {asCurrency(expenses)}</Text>
                        <Text style={styles.balanceLabel}>Current balance</Text>
                        <Text style={styles.balanceValue}>{asCurrency(balance)}</Text>
                    </Animated.View>

                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryTitle}>Category breakdown</Text>
                        {totalsPerCategory.length ? (
                            totalsPerCategory.map((item) => (
                                <View key={item.category} style={styles.categoryRow}>
                                    <Text style={styles.categoryName}>{item.category}</Text>
                                    <Text style={styles.categoryValue}>{asCurrency(item.total)}</Text>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.muted}>No category totals yet.</Text>
                        )}
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
    balanceLabel: {
        marginTop: 8,
        fontSize: 13,
        color: "#666",
    },
    balanceValue: {
        fontSize: 30,
        fontWeight: "700",
        color: "#1e64d9",
        marginTop: 2,
    },
    categoryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 6,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#ddd",
    },
    categoryName: {
        fontSize: 14,
        color: "#333",
    },
    categoryValue: {
        fontSize: 14,
        fontWeight: "600",
    },
    buttonWrapper: {
        marginTop: 16,
        width: "100%",
    },
});