// ─── UNS Backend API Configuration ───────────────────────────────────────────
// Replace this with your deployed backend URL when you go live.
// For local testing on a phone, use your PC's WiFi IP:  http://192.168.x.x:5000
// ─────────────────────────────────────────────────────────────────────────────

export const API_BASE_URL = 'https://uns-five.vercel.app';

export const API_ENDPOINTS = {
  // Auth
  SIGNIN:           `${API_BASE_URL}/api/auth/signin`,
  SIGNUP:           `${API_BASE_URL}/api/auth/signup`,
  GOOGLE_AUTH:      `${API_BASE_URL}/api/auth/google`,
  SEND_SIGNUP_OTP:  `${API_BASE_URL}/api/auth/send-signup-otp`,
  SEND_RESET_OTP:   `${API_BASE_URL}/api/auth/send-reset-otp`,
  RESET_PASSWORD:   `${API_BASE_URL}/api/auth/reset-password`,
};
