<!-- <template>
    <div class="space-y-4">

        <div class="border border-custom-border  p-4 rounded-lg">
            <p class="text-sm text-custom-grey-">Username</p>
            <p class="text-lg font-semibold text-custom-text">{{ profile.username }}</p>
        </div>

        <div class="border border-custom-border  p-4 rounded-lg">
            <p class="text-sm text-custom-grey-">Full Name</p>
            <p class="text-lg font-semibold text-custom-text">{{ profile.full_name }}</p>
        </div>

        <div class="border border-custom-border  p-4 rounded-lg">
            <p class="text-sm text-custom-grey-">Email</p>
            <p class="text-lg font-semibold text-custom-text">{{ profile.email }}</p>
        </div>

        <button @click="handleLogout"
            class="border cursor-pointer border-custom-red/50 bg-custom-red/10  p-4 rounded-lg">
            <p class="text-sm font-semibold text-custom-red">Logout</p>
        </button>
    </div>
</template>

<script setup>
import { logout } from '@/request/requests'
import { useProfileStore } from '@/stores/profile'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

const router = useRouter();
const profileStore = useProfileStore()
const { profile } = storeToRefs(profileStore)

const handleLogout = () => {
    logout()
    router.push('/login')
}
</script> -->
