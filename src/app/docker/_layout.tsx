import { Stack } from 'expo-router';

// NativeTabs no trae header/stack propio — para poder navegar de la lista
// de Docker a los logs de un contenedor (con botón de "atrás" nativo)
// hace falta este Stack anidado dentro del tab.
// https://docs.expo.dev/router/advanced/native-tabs/
export default function DockerLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="[id]"
        options={({ route }) => ({
          title: (route.params as { name?: string } | undefined)?.name ?? 'Contenedor',
        })}
      />
    </Stack>
  );
}
