/**
 * Type of settings only course administrators are able to access and/or modify
 */
export type AdminSettings = {
  currSem: string,
  slackURL: string | undefined,
  enforceCMUEmail: boolean,
  courseName: string,
}
