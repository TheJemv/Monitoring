import { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import type { HistoryPoint } from '../hooks/use-metric-history';

type MetricHistoryChartProps = {
  data: HistoryPoint[];
  accentColor?: string;
  /** Fixed Y-axis ceiling (e.g. 100 for %). If omitted, gifted-charts computes it on its own. */
  maxValue?: number;
  /** Suffix for the Y-axis labels, e.g. "%" or "°C". */
  suffix?: string;
};

/** Over 36h of range: show a date ("Aug 19") instead of a time ("14:32"). */
const DATE_FORMAT_THRESHOLD_SECONDS = 36 * 60 * 60;

function formatAxisLabel(timestampSeconds: number, useDateFormat: boolean): string {
  const date = new Date(timestampSeconds * 1000);
  // hour12: false → "14:32" instead of "2:32 PM".
  return useDateFormat
    ? date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
    : date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function MetricHistoryChart({ data, accentColor, maxValue, suffix }: MetricHistoryChartProps) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);
  const color = accentColor ?? theme.text;

  const handleLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  };

  const chartData = data.map((point) => ({ value: point.value }));

  // The box gifted-charts gives each xAxisLabelText is as narrow as the
  // spacing between points, so with short ranges (e.g. 30m with ~30
  // points) the text gets clipped. Instead of fighting that, we render our
  // own "start — end" labels below the chart with a plain Text.
  const useDateFormat =
    data.length > 1 && data[data.length - 1].timestamp - data[0].timestamp > DATE_FORMAT_THRESHOLD_SECONDS;
  const startLabel = data.length > 0 ? formatAxisLabel(data[0].timestamp, useDateFormat) : null;
  const endLabel = data.length > 0 ? formatAxisLabel(data[data.length - 1].timestamp, useDateFormat) : null;

  return (
    <View onLayout={handleLayout}>
      {width > 0 && chartData.length > 0 && (
        <>
          <LineChart
            data={chartData}
            width={width}
            adjustToWidth
            height={140}
            curved
            areaChart
            thickness={2}
            color={color}
            startFillColor={color}
            endFillColor={color}
            startOpacity={0.25}
            endOpacity={0}
            hideDataPoints
            maxValue={maxValue}
            noOfSections={4}
            // gifted-charts decides how many decimals to show based on how
            // little the data varies (if RAM barely changes in the window,
            // it ends up showing "32.00000"). We pin it to whole numbers.
            roundToDigits={0}
            yAxisLabelSuffix={suffix}
            yAxisTextStyle={{ color: theme.textSecondary, fontSize: 10 }}
            yAxisColor="transparent"
            xAxisColor="transparent"
            rulesColor={theme.backgroundSelected}
            rulesThickness={1}
            initialSpacing={8}
            endSpacing={0}
          />
          <View style={styles.footer}>
            <ThemedText type="small" themeColor="textSecondary">
              {startLabel}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {endLabel}
            </ThemedText>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.one,
  },
});
