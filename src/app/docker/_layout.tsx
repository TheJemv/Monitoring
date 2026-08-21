import { Stack } from 'expo-router';

// NativeTabs doesn't bring its own header/stack — this nested Stack is what
// lets us navigate from the Docker list to a container's logs (with a
// native "back" button) inside the tab.
// https://docs.expo.dev/router/advanced/native-tabs/
export default function DockerLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="[id]"
        options={({ route }) => ({
          title: (route.params as { name?: string } | undefined)?.name ?? 'Container',
        })}
      />
    </Stack>
  );
}
