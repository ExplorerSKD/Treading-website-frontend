const fs = require('fs');
const path = require('path');

const mainPath = path.join(__dirname, 'src/views/watchlist/Main.vue');
let content = fs.readFileSync(mainPath, 'utf8');

// Replace the drawer template
const newDrawer = `    <!-- Folder Drawer (Segments) -->
    <div class="drawer-overlay" :class="{ 'active': showDrawer }" @click="showDrawer = false"></div>
    <div class="folder-drawer" :class="{ 'open': showDrawer }">
        <div class="drawer-header">
            <h3><i class="fas fa-folder"></i> Scripts Library</h3>
            <button class="close-drawer" @click="showDrawer = false"><i class="fas fa-times"></i></button>
        </div>
        <div class="folder-tree-scroll">
            <ul class="tree-node-ul">
                <li v-for="(seg, idx) in tradingSegments" :key="idx" class="tree-item-li border-b border-gray-100 pb-2 mb-2">
                    <div class="tree-label-row flex justify-between" @click="toggleSegment(idx)">
                       <div class="flex items-center gap-3">
                           <i class="fas text-gray-400 w-3" :class="expandedSegments.includes(idx) ? 'fa-chevron-down' : 'fa-chevron-right'"></i>
                           <i class="fas text-custom-primary" :class="seg.icon"></i>
                           <span class="font-bold text-gray-700 text-sm">{{ seg.name }}</span>
                       </div>
                       <span class="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-500 font-bold">{{ getTotalCount(seg) }}</span>
                    </div>
                    
                    <ul v-if="expandedSegments.includes(idx)" class="pl-8 mt-2">
                        <!-- Direct Instruments -->
                        <li v-for="inst in seg.instruments || []" :key="inst.symbol" class="py-2 flex justify-between items-center px-2 hover:bg-gray-50 rounded">
                             <div class="flex items-center gap-3 text-xs font-semibold text-gray-600">
                                 <i class="fas fa-chart-line text-gray-400"></i>
                                 <span>{{ inst.symbol }}</span>
                             </div>
                             <button @click.stop="addMockScript(inst)" class="add-smart-btn text-white w-16" style="padding: 4px 10px; font-size: 0.65rem;">+ Add</button>
                        </li>
                        
                        <!-- SubCategories -->
                        <li v-for="(sub, sidx) in seg.subCategories || []" :key="sidx" class="mt-2">
                             <div class="flex items-center gap-2 text-xs font-semibold text-gray-700 px-2 py-1" @click="toggleSubcat(idx, sidx)">
                                 <i class="fas text-gray-400 w-3" :class="expandedSubcats.includes(idx+'-'+sidx) ? 'fa-chevron-down' : 'fa-chevron-right'"></i>
                                 <i class="fas fa-building text-gray-400"></i>
                                 <span>{{ sub.name }}</span>
                             </div>
                             <ul v-if="expandedSubcats.includes(idx+'-'+sidx)" class="pl-6 mt-1 border-l mx-3 border-gray-200">
                                 <li v-for="sinst in sub.instruments || []" :key="sinst.symbol" class="py-2 flex justify-between items-center pl-2 pr-1 hover:bg-gray-50 rounded">
                                     <div class="flex items-center gap-2 text-[11px] font-semibold text-gray-600">
                                         <span>{{ sinst.symbol }}</span>
                                     </div>
                                     <button @click.stop="addMockScript(sinst)" class="add-smart-btn text-white w-16" style="padding: 4px 8px; font-size: 0.6rem;">+ Add</button>
                                 </li>
                             </ul>
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
        <div class="drawer-footer flex justify-between items-center mt-auto">
             <div class="text-[0.65rem] text-gray-500 font-medium">
                <i class="fas fa-plus-circle text-custom-primary"></i> Tap Add to put in Watchlist.
             </div>
        </div>
    </div>`;

const r1 = /<!-- Folder Drawer \(Segments\) -->[\s\S]*?(?=<\/div>\n<\/template>)/;
content = content.replace(r1, newDrawer + '\n  ');

// Add the logic inside script tags
const theLogic = `/* ---------------- DEMO LIBRARY DRAWER STATE ---------------- */
const expandedSegments = ref([0])
const expandedSubcats = ref([])

const toggleSegment = (idx) => {
    const pos = expandedSegments.value.indexOf(idx);
    if(pos > -1) expandedSegments.value.splice(pos, 1);
    else expandedSegments.value.push(idx);
}

const toggleSubcat = (idx, sidx) => {
    const key = idx + '-' + sidx;
    const pos = expandedSubcats.value.indexOf(key);
    if(pos > -1) expandedSubcats.value.splice(pos, 1);
    else expandedSubcats.value.push(key);
}

const getTotalCount = (seg) => {
    let count = 0;
    if (seg.instruments) count += seg.instruments.length;
    if (seg.subCategories) {
        seg.subCategories.forEach(sub => {
            if (sub.instruments) count += sub.instruments.length;
        });
    }
    return count;
}

const tradingSegments = [
    { name: "INDEX - FUTURE", icon: "fa-chart-line", instruments: [
        { name: "NIFTY FUT", symbol: "NIFTY FUT", segment: "INDEX-FUT" },
        { name: "SENSEX FUT", symbol: "SENSEX FUT", segment: "INDEX-FUT" },
        { name: "BANKNIFTY", symbol: "BANKNIFTY FUT", segment: "INDEX-FUT" },
        { name: "FINNIFTY", symbol: "FINNIFTY FUT", segment: "INDEX-FUT" },
        { name: "MIDCAP", symbol: "MIDCAP NIFTY", segment: "INDEX-FUT" }
    ]},
    { name: "INDEX - OPTIONS", icon: "fa-chart-pie", subCategories: [
        { name: "NIFTY Options", instruments: [
             { name: "22500 CE", symbol: "NIFTY 22500 CE", segment: "INDEX-OPT" },
             { name: "22500 PE", symbol: "NIFTY 22500 PE", segment: "INDEX-OPT" }
        ]},
        { name: "BANKNIFTY Options", instruments: [
             { name: "47500 CE", symbol: "BNF 47500 CE", segment: "INDEX-OPT" },
             { name: "47500 PE", symbol: "BNF 47500 PE", segment: "INDEX-OPT" }
        ]}
    ]},
    { name: "STOCKS - FUTURE", icon: "fa-building", instruments: [
        { name: "HDFC BANK", symbol: "HDFCBANK FUT", segment: "STOCK-FUT" },
        { name: "RELIANCE", symbol: "RELIANCE FUT", segment: "STOCK-FUT" },
        { name: "INFY", symbol: "INFY FUT", segment: "STOCK-FUT" }
    ]},
    { name: "STOCKS - OPTIONS", icon: "fa-cubes", instruments: [
        { name: "HDFC 1500 CE", symbol: "HDFC 1500 CE", segment: "STOCK-OPT" },
        { name: "RELIANCE 2900 CE", symbol: "RELIANCE 2900 CE", segment: "STOCK-OPT" }
    ]},
    { name: "MCX - FUTURE", icon: "fa-coins", instruments: [
        { name: "GOLD FUT", symbol: "GOLD FUT", segment: "MCX-FUT" },
        { name: "SILVER FUT", symbol: "SILVER FUT", segment: "MCX-FUT" },
        { name: "CRUDEOIL FUT", symbol: "CRUDEOIL FUT", segment: "MCX-FUT" }
    ]},
    { name: "NSE - EQ", icon: "fa-chart-area", instruments: [
        { name: "TATA MOTORS", symbol: "TATAMOTORS", segment: "NSE-EQ" },
        { name: "STATE BANK", symbol: "SBIN", segment: "NSE-EQ" },
        { name: "ICICI BANK", symbol: "ICICIBANK", segment: "NSE-EQ" },
        { name: "ITC LTD", symbol: "ITC", segment: "NSE-EQ" }
    ]},
    { name: "CRYPTO", icon: "fa-bitcoin", instruments: [
        { name: "BITCOIN", symbol: "BTCUSDT", segment: "CRYPTO" },
        { name: "ETHEREUM", symbol: "ETHUSDT", segment: "CRYPTO" },
        { name: "SOLANA", symbol: "SOLUSDT", segment: "CRYPTO" }
    ]}
];

const addMockScript = async (inst) => {
    // Make sure we have an active watchlist configured
    let currentList = selectedWatchlist.value;
    if(!currentList) {
        if(watchlists.value && watchlists.value.length > 0) {
            currentList = watchlists.value[0];
            selectedWatchlist.value = currentList;
            activeSegment.value = currentList.name;
        } else {
             // Create a fallback DEMO list if absolutely none exist
             watchlists.value = [{ name: 'DEMO', symbols: [] }];
             currentList = watchlists.value[0];
             selectedWatchlist.value = currentList;
             activeSegment.value = 'DEMO';
        }
    }

    if(!currentList.symbols) currentList.symbols = [];
    
    // Prevent duplicates
    const isAdded = currentList.symbols.find(s => s.symbol === inst.symbol);
    if(isAdded) {
       toastStore.addToast("Notice", \`\${inst.symbol} is already in Watchlist.\`, "error", 2000);
       return;
    }

    // Push into the UI reactive state array
    currentList.symbols.push({
         name: inst.name,
         symbol: inst.symbol,
         segment: inst.segment,
         exchange: inst.segment.split('-')[0],
         token: "demo_" + Math.random().toString(36),
         instrument_type: "EQ"
    });
    
    toastStore.addToast("Success", \`\${inst.symbol} added (Demo Mode).\`, "success", 2000);
}`;

content = content.replace("/* ---------------- WATCHLIST SEGMENTS ---------------- */", theLogic + "\n\n/* ---------------- WATCHLIST SEGMENTS ---------------- */");

fs.writeFileSync(mainPath, content);
console.log("Updated main path drawer with new content");
