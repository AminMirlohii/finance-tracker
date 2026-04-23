import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

const CHART_SIZE = 200;
const RADIUS = 80;
const CENTER = CHART_SIZE / 2;
const INNER_RADIUS = 46;
const CHART_COLORS = ["#30D07F", "#3D7DFF", "#6E5AF8", "#F5B82E", "#FF6B6B", "#3DB6D6"];

function polarToCartesian(cx, cy, r, angleInDegrees) {
    const angleInRadians = (angleInDegrees - 90) * (Math.PI / 180.0);
    return {
        x: cx + r * Math.cos(angleInRadians),
        y: cy + r * Math.sin(angleInRadians),
    };
}

function describeArc(cx, cy, r, startAngle, endAngle) {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
}

export default function ExpensePieChart({ items }) {
    if (!items?.length) {
        return (
            <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>No expense data for chart.</Text>
            </View>
        );
    }

    const total = items.reduce((acc, item) => acc + Number(item.total || 0), 0);
    if (!total) {
        return (
            <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>No expense data for chart.</Text>
            </View>
        );
    }

    if (items.length === 1) {
        const only = items[0];
        const value = Number(only.total || 0);
        return (
            <View style={styles.wrap}>
                <Svg width={CHART_SIZE} height={CHART_SIZE}>
                    <Circle cx={CENTER} cy={CENTER} r={RADIUS} fill={CHART_COLORS[0]} />
                    <Circle cx={CENTER} cy={CENTER} r={INNER_RADIUS} fill="#0E1520" />
                </Svg>

                <View style={styles.centerTextOverlay}>
                    <Text style={styles.centerValue}>${value.toFixed(0)}</Text>
                    <Text style={styles.centerLabel}>Total</Text>
                </View>

                <View style={styles.legendWrap}>
                    <View style={styles.legendRow}>
                        <View style={[styles.legendDot, { backgroundColor: CHART_COLORS[0] }]} />
                        <Text style={styles.legendLabel}>{only.category}</Text>
                        <Text style={styles.legendValue}>${value.toFixed(2)}</Text>
                    </View>
                </View>
            </View>
        );
    }

    let startAngle = 0;
    const segments = items.map((item, index) => {
        const value = Number(item.total || 0);
        const sweep = (value / total) * 360;
        const endAngle = startAngle + sweep;
        const path = describeArc(CENTER, CENTER, RADIUS, startAngle, endAngle);
        const segment = {
            category: item.category,
            total: value,
            percentage: (value / total) * 100,
            color: CHART_COLORS[index % CHART_COLORS.length],
            path,
        };
        startAngle = endAngle;
        return segment;
    });

    return (
        <View style={styles.wrap}>
            <Svg width={CHART_SIZE} height={CHART_SIZE} style={styles.chart}>
                {segments.map((segment) => (
                    <Path key={segment.category} d={segment.path} fill={segment.color} />
                ))}
                <Circle cx={CENTER} cy={CENTER} r={INNER_RADIUS} fill="#0E1520" />
            </Svg>

            <View style={styles.centerTextOverlay}>
                <Text style={styles.centerValue}>${total.toFixed(0)}</Text>
                <Text style={styles.centerLabel}>Total</Text>
            </View>

            <View style={styles.legendWrap}>
                {segments.map((segment) => (
                    <View key={segment.category} style={styles.legendRow}>
                        <View style={[styles.legendDot, { backgroundColor: segment.color }]} />
                        <Text style={styles.legendLabel}>{segment.category}</Text>
                        <Text style={styles.legendPercent}>{segment.percentage.toFixed(0)}%</Text>
                        <Text style={styles.legendValue}>{segment.total.toFixed(2)}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        alignItems: "center",
        width: "100%",
        position: "relative",
    },
    chart: {
        marginBottom: 6,
    },
    centerTextOverlay: {
        position: "absolute",
        top: 74,
        alignItems: "center",
        justifyContent: "center",
    },
    centerValue: {
        color: "#F5F7FA",
        fontWeight: "700",
        fontSize: 24,
        lineHeight: 36,
    },
    centerLabel: {
        color: "#9AA4B2",
        fontSize: 14,
    },
    emptyWrap: {
        width: "100%",
        paddingVertical: 8,
    },
    emptyText: {
        color: "#9AA4B2",
        textAlign: "center",
    },
    legendWrap: {
        marginTop: 8,
        width: "100%",
        gap: 6,
    },
    legendRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 2,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 8,
    },
    legendLabel: {
        color: "#E4EAF2",
        flex: 1,
        fontSize: 13,
    },
    legendPercent: {
        color: "#BBC6D7",
        width: 38,
        textAlign: "right",
        marginRight: 10,
        fontSize: 12,
    },
    legendValue: {
        color: "#FFB3B8",
        fontWeight: "600",
        fontSize: 13,
    },
});
