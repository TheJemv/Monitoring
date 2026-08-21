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
 * Unlike `EditableAppConfig` (where Portainer is optional, `string | undefined`),
 * the form draft always carries `string` — TextInput doesn't handle an
 * `undefined` `value` well, so an unconfigured Portainer is represented as
 * `""` while editing.
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
 * State for the "Server" form (host + Prometheus/node-exporter/cAdvisor/
 * Portainer URLs): edited in a local draft and only applied to the global
 * store with `save()`, so the metrics screens don't break mid-edit of a URL.
 * The ping site list, on the other hand, applies immediately — adding/
 * removing one never leaves a half-done state.
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
    const urlError = 'Invalid URL — must include http:// or https://.';

    if (!draft.serverHost.trim()) nextErrors.serverHost = 'Required.';
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
