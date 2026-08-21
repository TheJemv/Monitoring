import { useState } from 'react';
import { Platform, Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassCard } from '@/components/glass-card';
import { SegmentedControl } from '@/components/segmented-control';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { DEFAULT_REFRESH_OPTION, REFRESH_OPTIONS } from '@/constants/refresh-options';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useAppConfig } from '@/hooks/use-app-config';
import { useTheme } from '@/hooks/use-theme';
import { formatBytes, formatDuration, formatPercent } from '@/utils/format';

import { MetricCard, MetricHistoryChart, ServiceStatusRow } from './components';
import {
    useCpuHistory,
    useMemoryHistory,
    usePrometheusOverview,
    useServicesHealth,
    useTemperatureHistory,
} from './hooks';
import { DEFAULT_HISTORY_RANGE_OPTION, HISTORY_RANGE_OPTIONS, MEMORY_TOTAL_GIB } from './prometheus.constants';
import styles from './prometheus.styles';

const CPU_ACCENT = '#3c87f7';
const MEMORY_ACCENT = '#af52de';
const TEMPERATURE_ACCENT = '#ff3b30';
const SSD_ACCENT = '#ff9500';
const HDD_ACCENT = '#34c759';

export default function Prometheus() {
  const theme = useTheme();
  const appConfig = useAppConfig();
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };

  const [refreshOptionValue, setRefreshOptionValue] = useState(DEFAULT_REFRESH_OPTION.value);
  const refreshOption =
    REFRESH_OPTIONS.find((option) => option.value === refreshOptionValue) ?? DEFAULT_REFRESH_OPTION;

  const [historyRangeValue, setHistoryRangeValue] = useState(DEFAULT_HISTORY_RANGE_OPTION.value);
  const historyRange =
    HISTORY_RANGE_OPTIONS.find((option) => option.value === historyRangeValue) ?? DEFAULT_HISTORY_RANGE_OPTION;

  const overview = usePrometheusOverview(refreshOption.ms);
  const cpuHistory = useCpuHistory(historyRange);
  const memoryHistory = useMemoryHistory(historyRange);
  const temperatureHistory = useTemperatureHistory(historyRange);
  const servicesHealth = useServicesHealth(refreshOption.ms);

  // Solo el refresh manual (pull-to-refresh) muestra el spinner nativo.
  // Los refetch automáticos de fondo actualizan los datos "en silencio",
  // sin mover el scroll ni parpadear la pantalla.
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const handleRefresh = async () => {
    setIsManualRefreshing(true);
    try {
      await Promise.all([
        overview.refetch(),
        cpuHistory.refetch(),
        memoryHistory.refetch(),
        temperatureHistory.refetch(),
        servicesHealth.refetch(),
      ]);
    } finally {
      setIsManualRefreshing(false);
    }
  };

  const contentPlatformStyle = Platform.select({
    android: {
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingBottom: insets.bottom,
    },
    web: {
      paddingTop: Spacing.six,
      paddingBottom: Spacing.four,
    },
  });

  if (overview.isLoading) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="small" themeColor="textSecondary">
          Conectando con Prometheus…
        </ThemedText>
      </ThemedView>
    );
  }

  if (overview.isError) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="subtitle" style={styles.centerText}>
          No se pudo conectar
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.centerText}>
          {overview.error instanceof Error ? overview.error.message : 'Error desconocido'}
        </ThemedText>
        <Pressable onPress={() => overview.refetch()} style={({ pressed }) => pressed && styles.pressed}>
          <ThemedView type="backgroundElement" style={styles.retryButton}>
            <ThemedText type="link">Reintentar</ThemedText>
          </ThemedView>
        </Pressable>
      </ThemedView>
    );
  }

  const data = overview.data;

  return (
    <ScrollView
        style={[styles.scrollView, { backgroundColor: theme.background }]}
        contentInset={insets}
        contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}
        refreshControl={<RefreshControl refreshing={isManualRefreshing} onRefresh={handleRefresh} />}>
        <ThemedView style={styles.container}>
            <View style={styles.header}>
            <ThemedText type="subtitle">Servidor</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
                {appConfig.serverHost}
            </ThemedText>
            </View>

            <View style={styles.controls}>
            <View style={styles.controlGroup}>
                <ThemedText type="small" themeColor="textSecondary">
                Actualizar cada
                </ThemedText>
                <SegmentedControl options={REFRESH_OPTIONS} value={refreshOptionValue} onChange={setRefreshOptionValue} />
            </View>

            <View style={styles.controlGroup}>
                <ThemedText type="small" themeColor="textSecondary">
                Historial
                </ThemedText>
                <SegmentedControl
                options={HISTORY_RANGE_OPTIONS}
                value={historyRangeValue}
                onChange={setHistoryRangeValue}
                />
            </View>
            </View>

            <View style={styles.grid}>
            <MetricCard
                label="CPU"
                icon={{ ios: 'cpu', android: 'developer_board', web: 'developer_board' }}
                value={data?.cpuPercent != null ? formatPercent(data.cpuPercent) : '—'}
                percent={data?.cpuPercent ?? null}
                accentColor={CPU_ACCENT}
            />
            <MetricCard
                label="RAM"
                icon={{ ios: 'memorychip', android: 'memory', web: 'memory' }}
                value={data?.memory ? formatBytes(data.memory.usedBytes) : '—'}
                subtitle={data?.memory ? `de ${formatBytes(data.memory.totalBytes)}` : 'No disponible'}
                percent={data?.memory?.usedPercent ?? null}
                accentColor={MEMORY_ACCENT}
            />
            <MetricCard
                label="SSD (/)"
                icon={{ ios: 'internaldrive', android: 'storage', web: 'storage' }}
                value={data?.ssdDisk ? formatBytes(data.ssdDisk.usedBytes) : '—'}
                subtitle={data?.ssdDisk ? `de ${formatBytes(data.ssdDisk.totalBytes)}` : 'No disponible'}
                percent={data?.ssdDisk?.usedPercent ?? null}
                accentColor={SSD_ACCENT}
            />
            <MetricCard
                label="HDD (/mnt/storage)"
                icon={{ ios: 'internaldrive', android: 'storage', web: 'storage' }}
                value={data?.hddDisk ? formatBytes(data.hddDisk.usedBytes) : '—'}
                subtitle={data?.hddDisk ? `de ${formatBytes(data.hddDisk.totalBytes)}` : 'No disponible'}
                percent={data?.hddDisk?.usedPercent ?? null}
                accentColor={HDD_ACCENT}
            />
            <MetricCard
                label="Temperatura CPU"
                icon={{ ios: 'thermometer', android: 'thermostat', web: 'thermostat' }}
                value={data?.temperatureCelsius != null ? `${data.temperatureCelsius.toFixed(1)}°C` : '—'}
                subtitle={data?.temperatureCelsius == null ? 'Sin sensor de CPU' : undefined}
                accentColor={TEMPERATURE_ACCENT}
            />
            <MetricCard
                label="Uptime"
                icon={{ ios: 'clock', android: 'schedule', web: 'schedule' }}
                value={data?.uptimeSeconds != null ? formatDuration(data.uptimeSeconds) : '—'}
            />
            </View>

            <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <ThemedText type="smallBold">CPU · {historyRange.label}</ThemedText>
                {data?.cpuPercent != null && (
                <ThemedText type="small" themeColor="textSecondary">
                    {formatPercent(data.cpuPercent)}
                </ThemedText>
                )}
            </View>
            <GlassCard>
                {cpuHistory.data && cpuHistory.data.length > 0 ? (
                <MetricHistoryChart data={cpuHistory.data} accentColor={CPU_ACCENT} maxValue={100} suffix="%" />
                ) : (
                <ThemedText type="small" themeColor="textSecondary">
                    {cpuHistory.isLoading ? 'Cargando gráfica…' : 'Sin datos todavía'}
                </ThemedText>
                )}
            </GlassCard>
            </View>

            <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <ThemedText type="smallBold">RAM · {historyRange.label}</ThemedText>
                {data?.memory && (
                <ThemedText type="small" themeColor="textSecondary">
                    {formatBytes(data.memory.usedBytes)} / {MEMORY_TOTAL_GIB} GB
                </ThemedText>
                )}
            </View>
            <GlassCard>
                {memoryHistory.data && memoryHistory.data.length > 0 ? (
                <MetricHistoryChart
                    data={memoryHistory.data}
                    accentColor={MEMORY_ACCENT}
                    maxValue={MEMORY_TOTAL_GIB}
                    suffix=" GB"
                />
                ) : (
                <ThemedText type="small" themeColor="textSecondary">
                    {memoryHistory.isLoading ? 'Cargando gráfica…' : 'Sin datos todavía'}
                </ThemedText>
                )}
            </GlassCard>
            </View>

            <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <ThemedText type="smallBold">Temperatura CPU · {historyRange.label}</ThemedText>
                {data?.temperatureCelsius != null && (
                <ThemedText type="small" themeColor="textSecondary">
                    {data.temperatureCelsius.toFixed(1)}°C
                </ThemedText>
                )}
            </View>
            <GlassCard>
                {temperatureHistory.data && temperatureHistory.data.length > 0 ? (
                <MetricHistoryChart data={temperatureHistory.data} accentColor={TEMPERATURE_ACCENT} suffix="°C" />
                ) : (
                <ThemedText type="small" themeColor="textSecondary">
                    {temperatureHistory.isLoading ? 'Cargando gráfica…' : 'Sin sensor de temperatura de CPU'}
                </ThemedText>
                )}
            </GlassCard>
            </View>

            <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <ThemedText type="smallBold">Servicios</ThemedText>
            </View>
            <GlassCard>
                {servicesHealth.data?.map((service) => (
                <ServiceStatusRow key={service.name} {...service} />
                ))}
            </GlassCard>
            </View>
        </ThemedView>
        </ScrollView>
  );
}
