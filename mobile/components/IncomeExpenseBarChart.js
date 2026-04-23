import { StyleSheet, Text, View } from "react-native";
import Svg, { Line, Rect } from "react-native-svg";

const WIDTH = 280;
const HEIGHT = 170;
const PADDING_TOP = 16;
const PADDING_BOTTOM = 24;
const BAR_WIDTH = 64;
const AXIS_BOTTOM = HEIGHT - PADDING_BOTTOM;

export default function IncomeExpenseBarChart({ income, expenses }) {
    const maxValue = Math.max(1, income, expenses);
    const chartHeight = HEIGHT - PADDING_TOP - PADDING_BOTTOM;
    const incomeHeight = (income / maxValue) * chartHeight;
    const expensesHeight = (expenses / maxValue) * chartHeight;

    const incomeX = 52;
    const expensesX = 164;

    return (
        <View style={styles.wrap}>
            <Svg width={WIDTH} height={HEIGHT}>
                <Line x1="24" y1={AXIS_BOTTOM} x2={WIDTH - 20} y2={AXIS_BOTTOM} stroke="#2A3648" strokeWidth="1.2" />

                <Rect
                    x={incomeX}
                    y={AXIS_BOTTOM - incomeHeight}
                    rx={10}
                    width={BAR_WIDTH}
                    height={incomeHeight}
                    fill="#30D07F"
                />
                <Rect
                    x={expensesX}
                    y={AXIS_BOTTOM - expensesHeight}
                    rx={10}
                    width={BAR_WIDTH}
                    height={expensesHeight}
                    fill="#FF6B6B"
                />
            </Svg>

            <View style={styles.labelsRow}>
                <View style={styles.labelBlock}>
                    <Text style={styles.label}>Income</Text>
                    <Text style={styles.income}>${income.toFixed(2)}</Text>
                </View>
                <View style={styles.labelBlock}>
                    <Text style={styles.label}>Expenses</Text>
                    <Text style={styles.expenses}>${expenses.toFixed(2)}</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        alignItems: "center",
        width: "100%",
    },
    labelsRow: {
        marginTop: -4,
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-around",
    },
    labelBlock: {
        alignItems: "center",
        gap: 2,
    },
    label: {
        color: "#AAB4C4",
        fontSize: 13,
    },
    income: {
        color: "#30D07F",
        fontWeight: "700",
        fontSize: 14,
    },
    expenses: {
        color: "#FF6B6B",
        fontWeight: "700",
        fontSize: 14,
    },
});
