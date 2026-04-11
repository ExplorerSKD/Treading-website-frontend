<template>
  <!-- Modal Overlay -->
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-end justify-center" @click="closeModal">
    <!-- Background Overlay -->
    <div class="absolute inset-0 bg-black/50"></div>

    <!-- Modal Content -->
    <div
      class="relative bg-white shadow-md rounded-t-2xl w-full max-w-md mx-auto p-6 pb-8 border border-gray-200 animate-slide-up"
      @click.stop>
      <div class="flex items-center justify-between text-lg font-semibold text-gray-900 mb-6">
        <h3>Change Password</h3>
        <button class="">
          <i class="pi pi-times" @click="closeModal"></i>
        </button>
      </div>

      <div class="space-y-4 p-1 mb-2">
        <div>
          <label class="block text-base text-gray-800 mb-1 text-[11px]">Current Password</label>
          <div class="bg-gray-100 border border-gray-200 rounded-md p-2.5">
            <input v-model="formData.old_password" type="password" placeholder="Enter Current Password"
              class="w-full bg-transparent text-base font-medium text-gray-900 outline-none" />
          </div>
        </div>

        <div>
          <label class="block text-base text-gray-800 mb-1 text-[11px]">New Password</label>
          <div class="bg-gray-100 border border-gray-200 rounded-md p-2.5">
            <input v-model="formData.new_password" type="password" placeholder="Enter New Password"
              class="w-full bg-transparent text-base font-medium text-gray-900 outline-none" />
          </div>
        </div>

        <div>
          <label class="block text-base text-gray-800 mb-1 text-[11px]">Confirm Password</label>
          <div class="bg-gray-100 border border-gray-200 rounded-md p-2.5">
            <input v-model="formData.confirm_password" type="password" placeholder="Confirm Password"
              class="w-full bg-transparent text-base font-medium  text-gray-900 outline-none" />
          </div>
        </div>

        <div>
          <button @click="submit"
            class="w-full mt-4 bg-green-500 text-white py-3 rounded-lg text-base font-semibold hover:bg-green-600 transition-colors">
            Proceed
          </button>
        </div>

      </div>

    </div>

  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useProfileStore } from '@/stores/profile';
import { useToastStore } from '@/stores/utils/toast';

const profileStore = useProfileStore()

const props = defineProps(
  { isOpen: Boolean }
)
const emit = defineEmits()

const formData = reactive({
  old_password: '',
  new_password: '',
  confirm_password: ''
})


const closeModal = () => {
  emit('close')
  formData.old_password = ''
  formData.new_password = ''
  formData.confirm_password = ''
}

const submit = () => {
  if (!formData.old_password || !formData.new_password || !formData.confirm_password) {
    useToastStore().addToast('Error', 'Please enter all fields', 'warn', 3000);
    return
  }

  if (formData.new_password !== formData.confirm_password) {
    useToastStore().addToast('Error', 'Passwords do not match', 'warn', 3000);
    return
  }

  emit('submit', formData)
  closeModal()
}


</script>

<style scoped>
@keyframes slide-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}
</style>
