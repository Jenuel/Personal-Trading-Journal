
export const SIGN_IN_URL =
  process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || '/sign-in'

export const SIGN_UP_URL =
  process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || '/sign-up'

export const SSO_CALLBACK_URL = '/sso-callback'

export const AFTER_SIGN_IN_URL =
  process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL || '/'

export const AFTER_SIGN_UP_URL =
  process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL || '/'
