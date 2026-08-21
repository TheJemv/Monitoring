/**
 * Id del "environment" de Portainer — el Docker engine que administra.
 * Confirmado con `GET /api/endpoints` (el environment "local" salió con
 * Id 3 en este servidor). Si reinstalas Portainer desde cero, vuelve a
 * verificarlo — no siempre es 1.
 */
export const PORTAINER_ENDPOINT_ID = 3;
