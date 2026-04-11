import { ref, provide, computed, watch } from 'vue';
import { defineStore } from 'pinia'
import MatrixTicker from "@/MatrixTicker";
import { ManageWebsocketResponse } from '@/request/manageResponse';
import { getToken } from '@/request/requests';
import { useNotificationStore } from './notifications';
import { usePositionStore } from './position';
import { useWalletStore } from './wallet';
import { useOrderStore } from './orders';
import { useProfileStore } from './profile';
import { useScriptSettingStore } from './scriptsetting';



export const useTickerStore = defineStore('tickers', () => {


  const wssToken = ref("");
  let ticker = null;
  let wsStatus = false;
  var lastPrices = ref({});
  let tickerList = ref(['256265', '260105', '257801', '265', 'XAUUSD', 'GBPUSD', 'USDJPY', 'USDINR', 'AUDCAD', 'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'DOGEUSD', '264969', '270857', 'XRPUSD']);
  const notificationStore = useNotificationStore();
  const positionStore = usePositionStore()
  const walletStore = useWalletStore();
  const orderStore = useOrderStore();
  const scriptSettingStore = useScriptSettingStore();
  const profileStore = useProfileStore();

  var token = computed(() => getToken());

  const channel = new BroadcastChannel('my-channel');
  channel.addEventListener('message', (event) => {
    const message = event.data;
    if (message.type === 'logout') {
      stopWebSocket()
    }
  });
  function updateTickerList(data) {
    for (let i = 0; i < data.length; i++) {
      if (!(data[i] in tickerList.value)) {

        tickerList.value.push(String(data[i]));
      }
    }
    if (token.value && ticker != null) {
      const items = tickerList.value;
      ticker.subscribe(items);

      ticker.setMode(ticker.modeFull, items);
    }
  }
  const onTicks = (ticks) => {
    let tick = JSON.parse(ticks)
    //Refresh the stores and show notification
    try {

      ManageWebsocketResponse(tick);
    } catch {

    }


    if (tick?.type === 'notification') {
      notificationStore.getNotifications();
      return;
    }

    if (tick?.type === 'ledger_update') {
      walletStore.getWallet();
      walletStore.getTransactions();
      return;
    }

    if (tick?.type === 'bank_accounts_update') {
      walletStore.getAdminBankDetails();
      return;
    }

    if (tick?.type === 'position_update' || tick?.type === 'position_delete') {
      positionStore.getOpenPositions();
      positionStore.getPositions();
      walletStore.getWallet();
      orderStore.getOrders();

      return;
    }

    if (tick?.type === 'user_update') {

      profileStore.getProfile();
      scriptSettingStore.getScriptSettings();
      return;
    }


    if (tick?.data?.Token || tick?.data?.instrument_token) {
      updateLastPrice(tick?.data);
    }
  };

  // Function to start the WebSocket
  const startWebSocket = (loggedinToken) => {
    if (!wsStatus) {
      console.log("Starting WebSocket connection");
      ticker = new MatrixTicker({
        token: loggedinToken,
      });
      ticker.connect();
      ticker.on("ticks", onTicks);
      ticker.on("connect", subscribe);
      wsStatus = true;

    }
  };

  // Function to stop the WebSocket
  const stopWebSocket = () => {
    if (ticker) {
      ticker.close();
      ticker = null;
      wsStatus = false;
    }
  };

  // Function to handle incoming ticks
  function normalizeTick(data) {
    const token = String(
      data.instrument_token ??
      data.Token ??
      data.symbol
    );

    const ltp = Number(
      data.LTP ??
      data.ltp ??
      data.last_price ??
      0
    );

    const changepercent = Number(
      data.change_percent ??
      data.ChangePer ??
      0
    );

    const bid = Number(
      data.bid ??
      data.Buy?.[0]?.price ??
      ltp ??
      0
    );

    const ask = Number(
      data.ask ??
      data.Sell?.[0]?.price ??
      ltp ??
      0
    );

    const o = Number(
      data.open ??
      data.O ??
      null
    );

    const h = Number(
      data.high ??
      data.H ??
      null
    );

    const l = Number(
      data.low ??
      data.L ??
      null
    );

    const c = Number(
      data.close ??
      data.C ??
      null
    );

    const change =
      data.change !== undefined
        ? Number(data.change)
        : data.NetChg !== undefined
          ? Number(data.NetChg)
          : c !== null
            ? ltp - c
            : 0;

    return {
      token,
      ltp,
      bid,
      ask,
      change,
      o,
      h,
      l,
      c,
      changepercent,
      time: data.Time ?? data.time ?? null
    };
  }



  // Function to subscribe to instruments
  const subscribe = () => {

    if (token.value) {
      const items = tickerList.value;
      ticker.subscribe(items);
      // ticker.subscribe_notification({
      //   "type": "update",
      //   "channels": ["updates:fusion"]
      // });
      ticker.setMode(ticker.modeFull, items);
    }

  };


  function updateLastPrice(rawData) {
    const normalized = normalizeTick(rawData);
    lastPrices.value[normalized.token] = normalized;
    return lastPrices.value;
  }


  function getLastPrice(instrument_token) {
    return lastPrices.value[String(instrument_token)];
  }




  provide('lastPriceStore', {
    updateLastPrice,
    getLastPrice,
    startWebSocket,
    stopWebSocket
  });

  return {
    updateLastPrice,
    getLastPrice,
    startWebSocket,
    stopWebSocket,
    updateTickerList,
    tickerList
  };

})