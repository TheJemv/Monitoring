import { useState } from 'react';

import type { PingTarget } from '@/api';
import { useAppConfig } from '@/hooks/use-app-config';
import {
  type EditableAppConfig,
  addPingTarget,
  getAppConfig,
  removePingTarget,
  resetAppConfig,
  updateAppConfig,
} from '@/lib/app-config';

/**
 * A diferencia de `EditableAppConfig` (donde Portainer es opcional, `string | undefined`),
 * el draft del form siempre trae `string` — TextInput no maneja bien un `value` `undefined`,
 * así que un Portainer sin configurar se representa como `""` mientras se edita.
 */
type ConfigDraft = Record<keyof EditableAppConfig, string>;

type FieldErrors = Partial<Record<keyof ConfigDraft, string>>;

function isValidBaseUrl(value: string): boolean {
  if (!value.trim()) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function toDraft(config: EditableAppConfig): ConfigDraft {
  return {
    serverHost: config.serverHost,
    prometheusUrl: config.prometheusUrl,
    nodeExporterUrl: config.nodeExporterUrl,
    cadvisorUrl: config.cadvisorUrl,
    portainerUrl: config.portainerUrl ?? '',
    portainerApiToken: config.portainerApiToken ?? '',
  };
}

/**
 * Estado del form de "Servidor" (host + URLs de Prometheus/node-exporter/
 * cAdvisor/Portainer): se edita en un draft local y solo se aplica al store
 * global con `save()`, para no romper las pantallas de métricas a medio
 * escribir una URL. La lista de sitios de ping, en cambio, se aplica de
 * inmediato — agregar/quitar uno no deja nunca un estado a medias.
 */
export function useConfigForm() {
  const { pingTargets } = useAppConfig();
  const [draft, setDraft] = useState<ConfigDraft>(() => toDraft(getAppConfig()));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [justSaved, setJustSaved] = useState(false);

  const setField = (field: keyof ConfigDraft) => (value: string) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
    setJustSaved(false);
  };

  const save = () => {
    const nextErrors: FieldErrors = {};
    const urlError = 'URL inválida — debe incluir http:// o https://.';

    if (!draft.serverHost.trim()) nextErrors.serverHost = 'Requerido.';
    if (!isValidBaseUrl(draft.prometheusUrl)) nextErrors.prometheusUrl = urlError;
    if (!isValidBaseUrl(draft.nodeExporterUrl)) nextErrors.nodeExporterUrl = urlError;
    if (!isValidBaseUrl(draft.cadvisorUrl)) nextErrors.cadvisorUrl = urlError;
    if (draft.portainerUrl.trim() && !isValidBaseUrl(draft.portainerUrl)) {
      nextErrors.portainerUrl = urlError;
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setJustSaved(false);
      return;
    }

    updateAppConfig(draft);
    setJustSaved(true);
  };

  const reset = () => {
    resetAppConfig();
    setDraft(toDraft(getAppConfig()));
    setErrors({});
    setJustSaved(false);
  };

  return {
    draft,
    errors,
    justSaved,
    setField,
    save,
    reset,
    pingTargets,
    addPingTarget: (target: PingTarget) => addPingTarget(target),
    removePingTarget: (url: string) => removePingTarget(url),
  };
}
