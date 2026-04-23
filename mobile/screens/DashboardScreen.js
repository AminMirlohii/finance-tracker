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
import { SafeAreaView } from "react-native-safe-area-context";
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
        <SafeAreaView style={styles.safeArea}>
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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#0B0F14",
    },
    scroll: {
        flex: 1,
        backgroundColor: "#0B0F14",
    },
    content: {
        paddingHorizontal: 18,
        paddingTop: 8,
        paddingBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: "700",
        color: "#F5F7FA",
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 14,
        color: "#9AA4B2",
        marginBottom: 6,
    },
    error: {
        color: "#FF6B6B",
        marginVertical: 8,
    },
    muted: {
        color: "#9AA4B2",
        marginTop: 8,
    },
    centered: {
        paddingVertical: 24,
        alignItems: "center",
    },
    summaryCard: {
        width: "100%",
        padding: 14,
        borderWidth: 1,
        borderColor: "#263241",
        borderRadius: 12,
        marginBottom: 14,
        backgroundColor: "#141B23",
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#F5F7FA",
        marginBottom: 8,
    },
    summaryLine: {
        fontSize: 14,
        color: "#D3DAE3",
        marginBottom: 6,
    },
    balanceLabel: {
        marginTop: 8,
        fontSize: 12,
        color: "#9AA4B2",
    },
    balanceValue: {
        fontSize: 34,
        fontWeight: "700",
        color: "#F5F7FA",
        marginTop: 2,
    },
    categoryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 8,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#263241",
    },
    categoryName: {
        fontSize: 14,
        color: "#D3DAE3",
    },
    categoryValue: {
        fontSize: 14,
        fontWeight: "600",
        color: "#F5F7FA",
    },
    buttonWrapper: {
        marginTop: 16,
        width: "100%",
    },
});