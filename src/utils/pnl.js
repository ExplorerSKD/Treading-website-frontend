import { symbolSegment } from "./symbolsegment";

export const calculatePnl = (pos, ticker) => {
    // 1️⃣ Closed position → backend truth wins
    if (Number(pos.net_quantity) == '0') {
        return Number(pos.realized_pnl || 0);
    }

    // 2️⃣ Open position → calculate unrealized
    const token = symbolSegment.includes(pos.segment)
        ? pos.symbol
        : String(pos.instrument_token || pos.token);

    const ltp = Number(ticker.getLastPrice(token)?.ltp || 0);
    if (!ltp) return Number(pos.realized_pnl || 0);

    const openQty = Math.abs(Number(pos.net_quantity));
    const entryPrice =
        pos.side === "BUY"
            ? Number(pos.buy_price)
            : Number(pos.sell_price);

    let unrealized = 0;

    if (pos.side === "BUY") {
        unrealized = (ltp - entryPrice) * openQty;
    } else {
        unrealized = (entryPrice - ltp) * openQty;
    }

    return unrealized;
};


export function formatNumber(value) {
    const num = Number(value);

    if (isNaN(num) || !isFinite(num)) {
        return '0.00';
    }

    return num.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}



