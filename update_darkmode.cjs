const fs = require('fs');
const path = require('path');

const files = {
    watchlist: path.join(__dirname, 'src/views/watchlist/Main.vue'),
    orders: path.join(__dirname, 'src/views/orders/Main.vue'),
    positions: path.join(__dirname, 'src/views/positions/Main.vue')
};

// --- WATCHLIST ---
let wl = fs.readFileSync(files.watchlist, 'utf8');
// inject script
wl = wl.replace(/(<script setup>\n)/, `$1import { useThemeStore } from '@/stores/theme'\n`);
wl = wl.replace(/(const toastStore = useToastStore\(\)\n)/, `$1const themeStore = useThemeStore()\n`);
// inject html
wl = wl.replace(/(<div class="logo-area">\n\s*<div class="logo-text">Watchlist<\/div>)/, 
`$1\n          <button class="theme-toggle-btn" @click="themeStore.toggleTheme()">
            <i class="fas" :class="themeStore.isDark ? 'fa-sun text-yellow-400' : 'fa-moon text-gray-500'"></i>
          </button>`);
// inject css
const wlCss = `
<style>
/* Dark Mode Overrides for Watchlist */
[data-theme="dark"] .mobile-app { background: #080A0F; }
[data-theme="dark"] .app-header { background: #131722; border-color: #1E2230; }
[data-theme="dark"] .logo-text { color: #E8EAED; }
[data-theme="dark"] .theme-toggle-btn { background: transparent; border: none; font-size: 1.1rem; margin-left: 10px; cursor:pointer;}
[data-theme="dark"] .folder-btn { background: #1C212E; border-color: #272C3D; color: #8C99B9; }
[data-theme="dark"] .search-input { background: #0A0D14; border-color: #272C3D; color: #E8EAED; }
[data-theme="dark"] .main-content { background: #080A0F; }
[data-theme="dark"] .search-results-section { background: #131722; border-color: #1E2230; box-shadow: 0 4px 12px rgba(0,0,0,0.4); }
[data-theme="dark"] .section-subtitle { color: #8F9BB3; }
[data-theme="dark"] .search-result-item { background: #1A1F2D; border-color: #272C3D; }
[data-theme="dark"] .search-result-name { color: #E8EAED; }
[data-theme="dark"] .watchlist-title { color: #6D758D; }
[data-theme="dark"] .watchlist-count { background: #1C212E; color: #8C99B9; }
[data-theme="dark"] .action-hint { background: #131722; color: #6D758D; }
[data-theme="dark"] .add-hint { background: #1A1F2D; color: #8F9BB3; }
[data-theme="dark"] .multi-select-bar { background: #131722; border-color: #1E2230; }
[data-theme="dark"] .multi-select-row.top-row { background: #1A1F2D; border-color: #272C3D; }
[data-theme="dark"] .multi-select-row.bottom-row { background: #131722; }
[data-theme="dark"] .select-all-btn { background: #272C3D; color: #E8EAED; }
[data-theme="dark"] .exit-selection-btn { background: #272C3D; color: #E8EAED; }
[data-theme="dark"] .instrument-card { background: #131722; border-color: #1E2230; }
[data-theme="dark"] .instrument-card.selected-mode { background: #1E1515; border-color: #C62E2E; }
[data-theme="dark"] .custom-checkbox { background: #131722; border-color: #3B445B; }
[data-theme="dark"] .instrument-symbol { color: #E8EAED; }
[data-theme="dark"] .instrument-symbol span { background: #222838; color: #9AA4BF; }
[data-theme="dark"] .empty-watchlist { background: #131722; border-color: #272C3D; }

/* Watchlist Drawer */
[data-theme="dark"] .folder-drawer { background: #131722; border-left-color: #1E2230; }
[data-theme="dark"] .drawer-header { border-bottom-color: #1E2230; }
[data-theme="dark"] .drawer-header h3 { color: #E8EAED; }
[data-theme="dark"] .tree-item-li { border-bottom-color: #1E2230; }
[data-theme="dark"] .tree-label-row { color: #E8EAED; }
[data-theme="dark"] .tree-item-li:hover .tree-label-row { background: #1A1F2D; }
[data-theme="dark"] .tree-label-row span.bg-gray-100 { background: #272C3D; color: #8F9BB3; }
[data-theme="dark"] .tree-item-li ul li.hover\\:bg-gray-50:hover { background: #1E2230; }
[data-theme="dark"] .drawer-footer { border-top-color: #1E2230; }

/* Trade Sheet */
[data-theme="dark"] .trade-sheet { background: #131722; }
[data-theme="dark"] .sheet-handle .handle-bar { background: #2A3042; }
[data-theme="dark"] .sheet-header { border-bottom-color: #1E2230; }
[data-theme="dark"] .sheet-script-name { color: #E8EAED; }
[data-theme="dark"] .sheet-segment { background: #2A1D20; color: #FCA5A5; }
[data-theme="dark"] .sheet-cmp-label { color: #6D758D; }
[data-theme="dark"] .sheet-bidask { background: #0A0D14; }
[data-theme="dark"] .sheet-divider { background: #1E2230; }
[data-theme="dark"] .ohlc-grid { background: #0A0D14; }
[data-theme="dark"] .ohlc-value.close { color: #E8EAED; }
[data-theme="dark"] .sheet-contract { background: #0A0D14; }
[data-theme="dark"] .sheet-contract-value { background: #1E2230; color: #E8EAED; }
</style>
`;
if(!wl.includes('<style>')) {
    wl += wlCss;
}
fs.writeFileSync(files.watchlist, wl);


// --- ORDERS ---
let ord = fs.readFileSync(files.orders, 'utf8');
ord = ord.replace(/(<script setup>\n)/, `$1import { useThemeStore } from '@/stores/theme'\n`);
ord = ord.replace(/(const orderStore = useOrderStore\(\);?\n)/, `$1const themeStore = useThemeStore();\n`);
ord = ord.replace(/(<div class="logo">\n\s*<i class="fas fa-chart-line"><\/i> MARGIN<span style="color:#B22234;"> APEX<\/span>\n\s*<\/div>)/, 
`$1\n          <button style="background:transparent;border:none;font-size:1.1rem;margin-left:8px;cursor:pointer;" @click="themeStore.toggleTheme()">
            <i class="fas" :class="themeStore.isDark ? 'fa-sun text-yellow-400' : 'fa-moon text-gray-500'"></i>
          </button>`);
// inject css
const ordCss = `
<style>
/* Dark Mode Overrides for Orders */
[data-theme="dark"] .order-app { background: #0A0D14; color: #E8EAED; }
[data-theme="dark"] .order-header { background: #131722; border-bottom-color: #1E2230; }
[data-theme="dark"] .logo { color: #E8EAED; -webkit-text-fill-color: #E8EAED; background: none;}
[data-theme="dark"] .logo span { -webkit-text-fill-color: #B22234; }
[data-theme="dark"] .search-box { background: #1A1F2D; border-color: #272C3D; }
[data-theme="dark"] .search-box input { color: #E8EAED; }
[data-theme="dark"] .search-box input::placeholder { color: #5B677E; }
[data-theme="dark"] .order-tabs { background: #131722; }
[data-theme="dark"] .tab.active { background: #1A1F2D; color: #FCA5A5; }
[data-theme="dark"] .order-card { background: #131722; border-color: #1E2230; }
[data-theme="dark"] .order-card:active { background: #1A1F2D; }
[data-theme="dark"] .pair { color: #E8EAED; }
[data-theme="dark"] .position-badge.sell { background: #2A1D20; color: #FCA5A5; }
[data-theme="dark"] .position-badge.buy { background: #122921; color: #34D399; }
[data-theme="dark"] .info-value-sm { color: #E8EAED; }
[data-theme="dark"] .order-type-badge-sm { background: #1C212E; color: #9AA4BF; }
[data-theme="dark"] .rejection-reason { background: #2A2111; color: #FBBF24; border-left-color: #F59E0B; }
[data-theme="dark"] .status-row { border-top-color: #1E2230; }
[data-theme="dark"] .status-badge.open { color: #FCA5A5; }
[data-theme="dark"] .status-badge.completed { color: #34D399; }
[data-theme="dark"] .cancel-btn { border-color: #272C3D; color: #9AA4BF; }
[data-theme="dark"] .empty-state { background: #131722; color: #6D758D; }
</style>
`;
if(!ord.includes('<style>')) {
    ord += ordCss;
}
fs.writeFileSync(files.orders, ord);


// --- POSITIONS ---
let pos = fs.readFileSync(files.positions, 'utf8');
pos = pos.replace(/(<script setup>\n)/, `$1import { useThemeStore } from '@/stores/theme'\n`);
pos = pos.replace(/(const positionStore = usePositionStore\(\)\n)/, `$1const themeStore = useThemeStore()\n`);
pos = pos.replace(/(<div class="page-title">\n\s*<i class="fas fa-chart-line"><\/i> BULL MARGIN\n\s*<\/div>)/, 
`$1\n          <button style="background:transparent;border:none;font-size:1.1rem;margin-left:8px;cursor:pointer;" @click="themeStore.toggleTheme()">
            <i class="fas" :class="themeStore.isDark ? 'fa-sun text-yellow-400' : 'fa-moon text-gray-500'"></i>
          </button>`);
// inject css
const posCss = `
<style>
/* Dark Mode Overrides for Positions */
[data-theme="dark"] .positions-app { background: #0A0D14; color: #E8EAED; }
[data-theme="dark"] .page-header { border-bottom-color: #1E2230; background: #131722; }
[data-theme="dark"] .page-title { color: #E8EAED; -webkit-text-fill-color: #E8EAED; background: none; }
[data-theme="dark"] .page-title i { color: #B22234; }
[data-theme="dark"] .exit-all-btn { background: #B22234; box-shadow: 0 4px 10px rgba(0,0,0,0.5); }
[data-theme="dark"] .exit-all-btn.disabled { background: #272C3D; }
[data-theme="dark"] .main-nav { background: #131722; }
[data-theme="dark"] .main-tab.active { background: #1A1F2D; color: #FCA5A5; }
[data-theme="dark"] .pnl-summary-card { background: #131722; border-color: #1E2230; }
[data-theme="dark"] .summary-header { border-bottom-color: #1E2230; }
[data-theme="dark"] .summary-header span { color: #9AA4BF; }
[data-theme="dark"] .summary-value { color: #E8EAED; }
[data-theme="dark"] .sub-nav { background: #131722; }
[data-theme="dark"] .sub-tab { color: #6D758D; }
[data-theme="dark"] .sub-tab.active { background: #1A1F2D; color: #FCA5A5; }
[data-theme="dark"] .empty-state { background: #131722; color: #6D758D; }
[data-theme="dark"] .compact-position-card { background: #131722; border-color: #1E2230; }
[data-theme="dark"] .compact-position-card:active { background: #1A1F2D; }
[data-theme="dark"] .pos-symbol { color: #E8EAED; }
[data-theme="dark"] .pos-symbol span { background: #222838; color: #9AA4BF; }
[data-theme="dark"] .pos-details .value { color: #E8EAED; }
[data-theme="dark"] .order-type-badge.long { background: #122921; color: #34D399; }
[data-theme="dark"] .order-type-badge.short { background: #2A1D20; color: #FCA5A5; }
[data-theme="dark"] .ltp-value span { color: #E8EAED; }
[data-theme="dark"] .individual-pnl-card { background: #131722; border-color: #1E2230; }
[data-theme="dark"] .individual-pnl-card:active { background: #1A1F2D; }
[data-theme="dark"] .order-type-badge-sm { background: #1A1F2D; color: #9AA4BF;}
[data-theme="dark"] .order-type-badge-sm.long { background: #122921; color: #34D399; }
[data-theme="dark"] .order-type-badge-sm.short { background: #2A1D20; color: #FCA5A5; }
[data-theme="dark"] .section-title-small { color: #9AA4BF; border-bottom-color: #1E2230; }
</style>
`;
if(!pos.includes('<style>')) {
    pos += posCss;
}
fs.writeFileSync(files.positions, pos);

console.log("Successfully injected Theme Store and Dark Mode global CSS block!");
