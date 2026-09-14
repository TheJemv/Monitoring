import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}>
      {/*
        Every screen already handles its own insets by hand (useSafeAreaInsets
        + contentInset on the ScrollView, to also leave room for the tab
        bar). Without disableAutomaticContentInsets, iOS's automatic
        adjustment fights with that and the top inset ends up at 0 (the
        title sits under the status bar). https://docs.expo.dev/router/advanced/native-tabs/
      */}
      <NativeTabs.Trigger name="index" disableAutomaticContentInsets>
        <NativeTabs.Trigger.Label>Prometheus</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "chart.bar", selected: "chart.bar.fill" }}
          md="bar_chart"
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="docker" disableAutomaticContentInsets>
        <NativeTabs.Trigger.Label>Docker</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "shippingbox", selected: "shippingbox.fill" }}
          md="inventory_2"
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="ping" disableAutomaticContentInsets>
        <NativeTabs.Trigger.Label>Ping</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "antenna.radiowaves.left.and.right", selected: "antenna.radiowaves.left.and.right" }}
          md="wifi_tethering"
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="config" disableAutomaticContentInsets>
        <NativeTabs.Trigger.Label>Configuration</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "gearshape", selected: "gearshape.fill" }}
          md="settings"
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
