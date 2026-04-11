import { ref, reactive } from "vue";
import router from "@/router/index";
import axios from "axios";
import { ManageApiResponse } from "./manageResponse";
import config from '@/matrixcnfg'
// -------------------------
// AUTH STATE
// -------------------------

const token = ref(localStorage.getItem("token") || null);
const userRole = ref(localStorage.getItem("role") || "");
const isAuthenticated = ref(!!token.value);

const setTokenAndRole = (newToken, role) => {
  token.value = newToken;
  userRole.value = role?.toLowerCase() || "";
  localStorage.setItem("token", newToken);
  localStorage.setItem("role", userRole.value);
};

const setisAuthenticated = (value, role = "") => {
  isAuthenticated.value = value;
  userRole.value = role.toLowerCase();
};

const getisAuthenticated = () => isAuthenticated.value;
const getToken = () => token.value;

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  setisAuthenticated(false, 'admin')
  router.push("/login");
  setTimeout(() => window.location.reload(), 300);
};

// -------------------------
// API BASE URL
// -------------------------


let baseUrl;

if (config.env === "production") {
  baseUrl = 'https://live.bullmargin.com'
} else {
  baseUrl = "https://live.bullmargin.com";
}

// -------------------------
// ENDPOINTS (minimal version)
// -------------------------

const endpoints = {
  demoLogin: "/api/v1/auth/instant-demo",
  login: "/api/v1/auth/login",
  demoLogin: "/api/v1/auth/instant-demo",
  changePassword: '/api/v1/auth/change-password',
  register: "/api/v1/auth/register",
  forgetPassword: ' /api/v1/auth/forgot-password',
  resetPassword: ' /api/v1/auth/reset-password',
  checkUsername: '/api/v1/users/check-username',
  logout: "/user/logout",
  profile: '/api/v1/users/me',
  users: '/api/v1/users',
  wallet: '/api/v1/wallet',
  adminBank: '/api/v1/bank-accounts/active',
  brokers: '/api/v1/brokers',
  watchlist: '/api/v1/trade/watchlist',
  orders: '/api/v1/trade/orders',
  positions: '/api/v1/trade/positions',
  instruments: '/api/v1/trade/instruments',
  settings: '/api/v1/admin/settings',
  actionLogs: '/api/v1/audit',
  stats: '/api/v1/stats/',
  notifications: '/api/v1/notifications',
  sendOtp: '/api/v1/auth/send-otp',
  scriptSettings: '/api/v1/users/script-settings/me',
  userBankAccounts: '/api/v1/user/bank-accounts'

};

// -------------------------
// STATE HOLDER
// -------------------------

const state = reactive({});

// -------------------------
// BASIC REQUEST HANDLER
// -------------------------

function createState(endpoint) {
  if (!state[endpoint]) {
    state[endpoint] = {
      loading: false,
      data: null,
      error: null,
    };
  }
}

const makeRequest = async (
  endpoint,
  method,
  data = {},
  config = {},
  params = {},
  subendpoint = '', // e.g. 'items' or 'items/child'
  id = ''           // e.g. '123' or ['123','456'] -> joined with '/'
) => {
  if (!endpoints[endpoint]) {
    throw new Error("Unknown endpoint: " + endpoint);
  }

  // normalize id if array
  const idPath = Array.isArray(id) ? id.filter(Boolean).join('/') : id;

  // build base url for the endpoint
  let baseEndpointPath = endpoints[endpoint] ?? '';
  // ensure no double-slashes when joining parts
  const joinParts = (...parts) =>
    parts
      .map(p => String(p || '').trim())
      .filter(Boolean)
      .map(p => p.replace(/^\/+|\/+$/g, '')) // remove leading/trailing slashes
      .join('/');

  const urlPath = joinParts(baseUrl, baseEndpointPath, subendpoint, idPath);
  createState(endpoint);
  state[endpoint].loading = true;
  state[endpoint].error = null;

  try {
    const query = new URLSearchParams(params).toString();
    const fullUrl = query ? `${urlPath}?${query}` : urlPath;

    // merge headers so config.headers aren't lost when token exists
    const mergedHeaders = {
      ...(config.headers || {}),
      ...(token.value ? { Authorization: token.value } : {}),
    };

    const response = await axios({
      url: fullUrl,
      method,
      data,
      ...config,
      headers: mergedHeaders,
    });

    state[endpoint].data = response.data;

    // Only do toasts (handled by ManageApiResponse)
    ManageApiResponse(response, endpoint, method);

    return response.data;
  } catch (error) {
    console.log('error in makerequest', error)
    state[endpoint].error = error.response || error;

    // auth failure → logout
    if (error.response?.status === 401) {
      logout();
      return;
    }

    // Toast error
    if (error.response) {
      ManageApiResponse(error.response, endpoint, method, true);
    }

    return null;
  } finally {
    state[endpoint].loading = false;
  }
};


// -------------------------

export {
  makeRequest,
  state,
  setTokenAndRole,
  getToken,
  userRole,
  setisAuthenticated,
  getisAuthenticated,
  logout,
};
