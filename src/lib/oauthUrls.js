const getBackendUrl = () =>
  import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, "") || "";

export const getGoogleAuthUrl = () => `${getBackendUrl()}/api/auth/google`;
export const getGithubAuthUrl = () => `${getBackendUrl()}/api/auth/github`;

export { getBackendUrl };
