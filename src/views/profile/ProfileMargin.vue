<template>
    <div class="space-y-6 px-4">
        <div class="sticky top-0 bg-white">
            <header class="bg-white py-4 flex items-center justify-between">
                <div class="flex items-center gap-4">
                    <button @click="$router.push({ name: 'profile' })"
                        class="rounded-full w-10 h-10 flex items-center justify-center bg-[#F5F5F5]">
                        <img class="w-6 -rotate-90" src="/svg/chevron-up.svg" />
                    </button>
                    <h1 class="text-lg font-semibold text-custom-text">Margin Settings</h1>
                </div>
            </header>
        </div>

        <!-- Default Segment Settings (when scripts include ALL or as fallback) -->
        <div v-for="(config, segment) in displaySegmentSettings" :key="segment"
            class="border border-custom-border p-4 rounded-lg">
            <p class="text-lg font-medium">{{ segment }}</p>
            <hr class="text-custom-border my-2" />

            <div class="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div>
                    <p class="text-custom-grey">Trading Allowed</p>
                    <p class="font-medium text-custom-text">
                        {{ config.trade_allowed ? 'Yes' : 'No' }}
                    </p>
                </div>
                <div>
                    <p class="text-custom-grey">Intraday Leverage</p>
                    <p class="font-medium text-custom-text">
                        {{ config.intraday_leverage }}
                    </p>
                </div>
                <div>
                    <p class="text-custom-grey">Holding Leverage</p>
                    <p class="font-medium text-custom-text">
                        {{ config.holding_leverage }}
                    </p>
                </div>
                <div>
                    <p class="text-custom-grey">Strike Range</p>
                    <p class="font-medium text-custom-text">
                        {{ config.strike_range }}
                    </p>
                </div>
                <div>
                    <p class="text-custom-grey">Max Lot</p>
                    <p class="font-medium text-custom-text">
                        {{ config.max_lot }}
                    </p>
                </div>
                <div>
                    <p class="text-custom-grey">Max Order Lot</p>
                    <p class="font-medium text-custom-text">
                        {{ config.max_order_lot }}
                    </p>
                </div>
                <div>
                    <p class="text-custom-grey">Commission Type</p>
                    <p class="font-medium text-custom-text">
                        {{ config.commission_type }}
                    </p>
                </div>
                <div>
                    <p class="text-custom-grey">Commission Value</p>
                    <p class="font-medium text-custom-text">
                        {{ config.commission_value }}
                    </p>
                </div>
            </div>
        </div>

        <!-- Script-Specific Settings (when scripts don't include ALL) -->
        <div v-if="hasSpecificScripts" class="border border-custom-border p-4 rounded-lg bg-blue-50">
            <div class="mb-4">
                <p class="text-lg font-semibold text-blue-900 mb-2">Script-Specific Settings</p>
                <div class="flex flex-wrap gap-2">
                    <span v-for="script in scriptSettings.scripts" :key="script"
                        class="px-3 py-1 bg-blue-200 text-blue-900 rounded-full text-sm font-medium">
                        {{ script }}
                    </span>
                </div>
            </div>

            <hr class="text-custom-border my-3" />

            <div v-for="(config, segment) in scriptSettings.segment_settings" :key="segment"
                class="mb-4 last:mb-0 bg-white p-3 rounded">
                <p class="text-md font-medium text-custom-text mb-2">{{ segment }}</p>

                <div class="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div>
                        <p class="text-custom-grey">Trading Allowed</p>
                        <p class="font-medium text-custom-text">
                            {{ config.trade_allowed ? 'Yes' : 'No' }}
                        </p>
                    </div>
                    <div>
                        <p class="text-custom-grey">Intraday Leverage</p>
                        <p class="font-medium text-custom-text">
                            {{ config.intraday_leverage }}
                        </p>
                    </div>
                    <div>
                        <p class="text-custom-grey">Holding Leverage</p>
                        <p class="font-medium text-custom-text">
                            {{ config.holding_leverage }}
                        </p>
                    </div>
                    <div>
                        <p class="text-custom-grey">Strike Range</p>
                        <p class="font-medium text-custom-text">
                            {{ config.strike_range }}
                        </p>
                    </div>
                    <div>
                        <p class="text-custom-grey">Max Lot</p>
                        <p class="font-medium text-custom-text">
                            {{ config.max_lot }}
                        </p>
                    </div>
                    <div>
                        <p class="text-custom-grey">Max Order Lot</p>
                        <p class="font-medium text-custom-text">
                            {{ config.max_order_lot }}
                        </p>
                    </div>
                    <div>
                        <p class="text-custom-grey">Commission Type</p>
                        <p class="font-medium text-custom-text">
                            {{ config.commission_type }}
                        </p>
                    </div>
                    <div>
                        <p class="text-custom-grey">Commission Value</p>
                        <p class="font-medium text-custom-text">
                            {{ config.commission_value }}
                        </p>
                    </div>
                    <div>
                        <p class="text-custom-grey">Entry Buffer</p>
                        <p class="font-medium text-custom-text">
                            {{ config.entry_buffer }}
                        </p>
                    </div>
                    <div>
                        <p class="text-custom-grey">Exit Buffer</p>
                        <p class="font-medium text-custom-text">
                            {{ config.exit_buffer }}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useProfileStore } from '@/stores/profile'
import { storeToRefs } from 'pinia'
import { useScriptSettingStore } from '@/stores/scriptsetting'

const scriptSettingStore = useScriptSettingStore();
const profileStore = useProfileStore()

const { scriptSettings } = storeToRefs(scriptSettingStore)
const { profile } = storeToRefs(profileStore)

// Check if scripts include "ALL"
const hasAllScripts = computed(() => {
    return scriptSettings.value?.scripts?.includes('ALL') || false
})

// Check if there are specific scripts (not including ALL)
const hasSpecificScripts = computed(() => {
    return scriptSettings.value?.scripts &&
        scriptSettings.value.scripts.length > 0 &&
        !scriptSettings.value.scripts.includes('ALL')
})

// Determine which segment settings to display
const displaySegmentSettings = computed(() => {
    // If scripts include "ALL", use scriptSettings data
    if (hasAllScripts.value && scriptSettings.value?.segment_settings) {
        return scriptSettings.value.segment_settings
    }
    // Otherwise, use profile settings as default
    return profile.value?.settings?.segment_settings || {}
})
</script>