/**
 * Variables de entorno del stack de monitoreo.
 *
 * Expo solo expone al bundle del cliente las variables con prefijo
 * `EXPO_PUBLIC_`, referenciadas de forma estática (`process.env.EXPO_PUBLIC_X`),
 * y las inyecta desde `.env` en build time.
 * https://docs.expo.dev/guides/environment-variables/
 *
 * No pongas aquí secretos: estos valores quedan visibles en texto plano
 * dentro de la app compilada.
 */

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Falta la variable de entorno ${name}. Copia .env.example a .env y ajusta los valores a tu servidor.`
    );
  }
  return value;
}

/** A diferencia de `required`, no truena la app si falta — la pantalla que la necesite decide qué mostrar. */
function optional(value: string | undefined): string | undefined {
  return value && value.length > 0 ? value : undefined;
}

export const env = {
  /** IP o dominio del servidor donde corre el stack (docker-compose). */
  serverHost: required('EXPO_PUBLIC_SERVER_HOST', process.env.EXPO_PUBLIC_SERVER_HOST),
  /** Base URL de Prometheus (puerto 9090). */
  prometheusUrl: required('EXPO_PUBLIC_PROMETHEUS_URL', process.env.EXPO_PUBLIC_PROMETHEUS_URL),
  /** Base URL de node-exporter (puerto 9100), métricas del host. */
  nodeExporterUrl: required('EXPO_PUBLIC_NODE_EXPORTER_URL', process.env.EXPO_PUBLIC_NODE_EXPORTER_URL),
  /** Base URL de cAdvisor (puerto 8080), métricas por contenedor. */
  cadvisorUrl: required('EXPO_PUBLIC_CADVISOR_URL', process.env.EXPO_PUBLIC_CADVISOR_URL),
  /** Base URL de Portainer (puerto 9000). Opcional hasta que lo agregues a tu docker-compose. */
  portainerUrl: optional(process.env.EXPO_PUBLIC_PORTAINER_URL),
  /** Access token de un usuario de Portainer (Account settings → Access tokens). */
  portainerApiToken: optional(process.env.EXPO_PUBLIC_PORTAINER_API_TOKEN),
} as const;
