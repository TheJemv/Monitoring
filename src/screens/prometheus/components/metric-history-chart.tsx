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
  /** Techo fijo del eje Y (ej. 100 para %). Si se omite, gifted-charts lo calcula solo. */
  maxValue?: number;
  /** Sufijo de las etiquetas del eje Y, ej. "%" o "°C". */
  suffix?: string;
};

/** Más de 36h de rango: mostramos fecha ("19 ago") en vez de hora ("14:32"). */
const DATE_FORMAT_THRESHOLD_SECONDS = 36 * 60 * 60;

function formatAxisLabel(timestampSeconds: number, useDateFormat: boolean): string {
  const date = new Date(timestampSeconds * 1000);
  // hour12: false → "14:32" en vez de "02:32 p.m.".
  return useDateFormat
    ? date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
    : date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function MetricHistoryChart({ data, accentColor, maxValue, suffix }: MetricHistoryChartProps) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);
  const color = accentColor ?? theme.text;

  const handleLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  };

  const chartData = data.map((point) => ({ value: point.value }));

  // La caja que gifted-charts le da a cada xAxisLabelText es tan angosta
  // como el espacio entre puntos, así que con rangos cortos (ej. 30m con
  // ~30 puntos) el texto queda cortado. En vez de pelear con eso, ponemos
  // nosotros mismos "inicio — fin" debajo del chart con un Text normal.
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
            // gifted-charts decide solo cuántos decimales mostrar según qué tan
            // poco varíen los datos (si la RAM casi no cambia en la ventana,
            // termina mostrando "32.00000"). Lo fijamos en enteros.
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
