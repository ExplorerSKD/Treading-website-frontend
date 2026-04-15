import { ref } from 'vue';
import { makeRequest } from "@/request/requests";
import { useToastStore } from '@/stores/utils/toast';
import useWatchlistStore from '@/stores/watchlist';
import { useOrderStore } from '@/stores/orders';
import { usePositionStore } from '@/stores/position';
import { useWalletStore } from '@/stores/wallet';
import { useProfileStore } from '@/stores/profile';
import { useNotificationStore } from '@/stores/notifications';
import useUserBankAccountStore from '@/stores/bank';


// Simple status message map
const statusMessages = {
  200: 'Success: ',
  201: 'Success: ',
  400: 'Bad Request: ',
  401: 'Unauthorized: ',
  403: 'Forbidden: ',
  404: 'Not Found: ',
  500: 'Internal Server Error: ',
  502: 'Bad Gateway: ',
  503: 'Service Unavailable: ',
  504: 'Gateway Timeout: ',
};

function showToast(title, message, type, duration = 3000) {
  const toast = useToastStore();
  toast.addToast(title, message, type, duration);
}

let storeFunction = {}

setTimeout(() => {
  storeFunction = {
    watchlist: useWatchlistStore,
    searchInstruments: useWatchlistStore,
    orders: useOrderStore,
    positions: usePositionStore,
    wallet: useWalletStore,
    profile: useProfileStore,
    notifications: useNotificationStore,
    userBankAccounts: useUserBankAccountStore
  }
}, 100);

const getFunctions = {
  watchlist: 'getWatchlists',
  searchInstruments: 'getWatchlists',
  orders: 'getOrders',
  positions: 'getPositions',
  wallet: 'getWallet',
  profile: 'getProfile',
  notifications: 'getNotifications',
  userBankAccounts: 'getBankAccounts'
}

/**
 * API Response Manager (Minimal)
 * No store interactions. Only toast + logging.
 */
function ManageApiResponse(response, endpoint, method) {
  try {
    if (!response) return;

    // Login/OTP routes skip the logic
    // const authEndpoints = [
    //   'login', 'getSignupOTP', 'verifyOTP', 'register',
    //   'sendForgotOTP', 'verifyForgotOTP', 'forgot',
    // ];
    // if (authEndpoints.includes(endpoint)) return;

    let message = response.data?.message || 'Success';
    let title = statusMessages[response.status] || '';
    let type = response.status >= 200 && response.status < 300 ? 'success' : 'error';

    // Use custom success message if provided in config
    if (type === 'success' && response.config?.successMessage) {
      message = response.config.successMessage;
    }

    // Special case
    if (response.status === 404 && response.data === "404 page not found") {
      message = 'Internal Server Error: Something went wrong';
      title = 'Error:';
    }

    // Only show toast 
    if (method !== 'GET' && endpoint != 'demoLogin' && endpoint != 'login') {
      // Check if endpoint maps to a store
      if (Object.keys(storeFunction).includes(endpoint)) {
        const store = storeFunction[endpoint]();
        const funcName = getFunctions[endpoint];
        if (store[funcName]) store[funcName]();
      }
      showToast(title, message, type);
    }

  } catch (err) {
    console.error("ManageApiResponse Error:", err);
  }
}

/**
 * WebSocket Message Manager (Minimal)
 * No store updates. Just logs the socket data.
 */
async function ManageWebsocketResponse(response) {
  try {
    if (!response) return;

    // If future logic needed, you can attach it here.
    // Everything related to stores is removed.

  } catch (err) {
    console.error("ManageWebsocketResponse Error:", err);
  }
}

export { ManageApiResponse, ManageWebsocketResponse };
