import dotenv from 'dotenv';
import { expand } from 'dotenv-expand';

expand(dotenv.config());

const trimEnvValue = (name: string): string | undefined => {
  const value = process.env[name]?.trim();

  return value ? value : undefined;
};

const trimTrailingSlash = (value: string): string => value.replace(/\/$/, '');

const parseOptionalBoolean = (name: string): boolean | undefined => {
  const value = trimEnvValue(name);

  if (value === undefined) {
    return undefined;
  }

  const normalizedValue = value.toLowerCase();

  if (normalizedValue === 'true') {
    return true;
  }

  if (normalizedValue === 'false') {
    return false;
  }

  throw new Error(`${name} must be "true" or "false".`);
};

const getRequiredEnv = (name: string): string => {
  const value = trimEnvValue(name);

  if (!value) {
    throw new Error(`${name} is not set.`);
  }

  return value;
};

const buildCallbackUrl = (explicitVarName: string, providerPath: string): string | undefined => {
  const explicitValue = trimEnvValue(explicitVarName);

  if (explicitValue) {
    return trimTrailingSlash(explicitValue);
  }

  const backendUrl = getBackendUrl();

  return backendUrl ? `${trimTrailingSlash(backendUrl)}${providerPath}` : undefined;
};

export const getDatabaseUrl = (): string | undefined => trimEnvValue('DATABASE_URL');

export const getFrontendUrl = (): string | undefined => trimEnvValue('FRONTEND_URL');

export const getBackendUrl = (): string | undefined => trimEnvValue('BACKEND_URL');

export const getJwtSecret = (): string => getRequiredEnv('JWT_SECRET');

export const getPasswordResetUrlBase = (): string | undefined => {
  const explicitValue = trimEnvValue('PASSWORD_RESET_URL_BASE');

  if (explicitValue) {
    return trimTrailingSlash(explicitValue);
  }

  const frontendUrl = getFrontendUrl();

  return frontendUrl ? `${trimTrailingSlash(frontendUrl)}/reset-password` : undefined;
};

export const getGoogleCallbackUrl = (): string | undefined =>
  buildCallbackUrl('GOOGLE_CALLBACK_URL', '/auth/google/callback');

export const getGithubCallbackUrl = (): string | undefined =>
  buildCallbackUrl('GITHUB_CALLBACK_URL', '/auth/github/callback');

export const isGoogleAuthConfigured = (): boolean =>
  Boolean(
    trimEnvValue('GOOGLE_CLIENT_ID') &&
    trimEnvValue('GOOGLE_CLIENT_SECRET') &&
    getGoogleCallbackUrl(),
  );

export const isGithubAuthConfigured = (): boolean =>
  Boolean(
    trimEnvValue('GITHUB_CLIENT_ID') &&
    trimEnvValue('GITHUB_CLIENT_SECRET') &&
    getGithubCallbackUrl(),
  );

export const shouldUseSecureCookies = (): boolean => {
  const cookieSecureOverride = parseOptionalBoolean('COOKIE_SECURE');

  if (cookieSecureOverride !== undefined) {
    return cookieSecureOverride;
  }

  return getFrontendUrl()?.startsWith('https://') ?? false;
};

export const validateApiRuntimeEnv = (): void => {
  const errors: string[] = [];
  const requiredVariables = ['DATABASE_URL', 'FRONTEND_URL', 'JWT_SECRET', 'MAIL_FROM'];

  for (const variableName of requiredVariables) {
    if (!trimEnvValue(variableName)) {
      errors.push(`${variableName} is required.`);
    }
  }

  const smtpPort = trimEnvValue('SMTP_PORT') ?? '1025';
  if (Number.isNaN(Number.parseInt(smtpPort, 10))) {
    errors.push('SMTP_PORT must be a valid number.');
  }

  const smtpUser = trimEnvValue('SMTP_USER');
  const smtpPass = trimEnvValue('SMTP_PASS');
  if ((smtpUser && !smtpPass) || (!smtpUser && smtpPass)) {
    errors.push('SMTP_USER and SMTP_PASS must be configured together.');
  }

  const port = trimEnvValue('PORT');
  if (port && Number.isNaN(Number.parseInt(port, 10))) {
    errors.push('PORT must be a valid number.');
  }

  if (!getPasswordResetUrlBase()) {
    errors.push('PASSWORD_RESET_URL_BASE or FRONTEND_URL must be configured.');
  }

  const googleClientId = trimEnvValue('GOOGLE_CLIENT_ID');
  const googleClientSecret = trimEnvValue('GOOGLE_CLIENT_SECRET');
  if ((googleClientId || googleClientSecret) && !isGoogleAuthConfigured()) {
    errors.push(
      'Google OAuth requires GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_CALLBACK_URL or BACKEND_URL.',
    );
  }

  const githubClientId = trimEnvValue('GITHUB_CLIENT_ID');
  const githubClientSecret = trimEnvValue('GITHUB_CLIENT_SECRET');
  if ((githubClientId || githubClientSecret) && !isGithubAuthConfigured()) {
    errors.push(
      'GitHub OAuth requires GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, and GITHUB_CALLBACK_URL or BACKEND_URL.',
    );
  }

  try {
    void shouldUseSecureCookies();
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'COOKIE_SECURE is invalid.');
  }

  if (errors.length > 0) {
    throw new Error(`Invalid runtime configuration:\n- ${errors.join('\n- ')}`);
  }
};
