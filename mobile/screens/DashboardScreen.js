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
import ExpensePieChart from "../components/ExpensePieChart";
import IncomeExpenseBarChart from "../components/IncomeExpenseBarChart";
import StatCard from "../components/StatCard";
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
    const expenseCategoryData = Object.values(
        transactions
            .filter((item) => item.type === "expense")
            .reduce((acc, item) => {
                const current = acc[item.category] || { category: item.category, total: 0 };
                current.total += Number(item.amount || 0);
                acc[item.category] = current;
                return acc;
            }, {})
    ).sort((a, b) => b.total - a.total);

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
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.title}>Dashboard</Text>
                        <Text style={styles.subtitle}>Welcome back! Here is your financial overview.</Text>
                        {user?.email ? <Text style={styles.subtitle}>Logged in as {user.email}</Text> : null}
                    </View>
                    <View style={styles.avatarCircle}>
                        <Text style={styles.avatarText}>{user?.email?.[0]?.toUpperCase() || "U"}</Text>
                    </View>
                </View>

                {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

                {loading ? (
                    <View style={styles.centered}>
                        <ActivityIndicator size="large" />
                        <Text style={styles.muted}>Loading…</Text>
                    </View>
                ) : (
                    <>
                        <View style={styles.statsRow}>
                            <StatCard title="Total income" value={`$${asCurrency(income)}`} accent="positive" subtitle="Income" />
                            <StatCard title="Total expenses" value={`$${asCurrency(expenses)}`} accent="negative" subtitle="Expense" />
                            <StatCard
                                title="Balance"
                                value={`${balance >= 0 ? "+" : "-"}$${asCurrency(Math.abs(balance))}`}
                                accent={balance >= 0 ? "positive" : "negative"}
                                subtitle="Current"
                            />
                        </View>

                        <View style={styles.analyticsRow}>
                            <View style={[styles.summaryCard, styles.analyticsCard]}>
                                <Text style={styles.summaryTitle}>Expenses by category</Text>
                                <ExpensePieChart items={expenseCategoryData} />
                            </View>

                            <View style={[styles.summaryCard, styles.analyticsCard]}>
                                <Text style={styles.summaryTitle}>Monthly trend</Text>
                                <IncomeExpenseBarChart income={Number(income)} expenses={Number(expenses)} />
                            </View>
                        </View>

                        <Animated.View
                            style={[
                                styles.summaryCard,
                                { opacity: fadeAnim, transform: [{ translateY: translateYAnim }] },
                            ]}
                        >
                            <Text style={styles.summaryTitle}>Summary</Text>
                            <Text style={[styles.summaryLine, styles.incomeText]}>Total income: +{asCurrency(income)}</Text>
                            <Text style={[styles.summaryLine, styles.expenseText]}>Total expenses: -{asCurrency(expenses)}</Text>
                            <Text style={styles.balanceLabel}>Current balance</Text>
                            <Text style={[styles.balanceValue, balance >= 0 ? styles.incomeText : styles.expenseText]}>
                                {balance >= 0 ? "+" : "-"}
                                {asCurrency(Math.abs(balance))}
                            </Text>
                        </Animated.View>

                        <View style={styles.summaryCard}>
                            <Text style={styles.summaryTitle}>Category breakdown</Text>
                            {totalsPerCategory.length ? (
                                totalsPerCategory.map((item) => (
                                    <View key={item.category} style={styles.categoryRow}>
                                        <View style={styles.categoryNameWrap}>
                                            <View style={styles.categoryDot} />
                                            <Text style={styles.categoryName}>{item.category}</Text>
                                        </View>
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
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 12,
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
    avatarCircle: {
        width: 42,
        height: 42,
        borderRadius: 21,
        borderWidth: 1.5,
        borderColor: "#30D07F",
        backgroundColor: "#10221B",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 2,
    },
    avatarText: {
        color: "#30D07F",
        fontWeight: "700",
        fontSize: 18,
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
    statsRow: {
        marginTop: 6,
        marginBottom: 16,
        flexDirection: "row",
        gap: 10,
    },
    analyticsRow: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 14,
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
    analyticsCard: {
        flex: 1,
        width: undefined,
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#F5F7FA",
        marginBottom: 8,
    },
    summaryLine: {
        fontSize: 14,
        color: "#E4EAF2",
        marginBottom: 6,
    },
    incomeText: {
        color: "#30D07F",
    },
    expenseText: {
        color: "#FF6B6B",
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
        paddingVertical: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#263241",
    },
    categoryNameWrap: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    categoryDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: "#9AA4B2",
    },
    categoryName: {
        fontSize: 14,
        color: "#E4EAF2",
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