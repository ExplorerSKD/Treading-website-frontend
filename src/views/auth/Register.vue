<template>
  <div class="register-page-wrapper">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <div class="register-container">
        <!-- Left Section: Registration Form -->
        <div class="register-form-section">
            <header class="mb-4">
              <button @click="$emit('goBack')" class="back-btn">
                <i class="fas fa-arrow-left"></i> Back
              </button>
            </header>

            <div class="brand-logo">
                <i class="fas fa-chart-line"></i>
                <h1>Bull Margin</h1>
            </div>
            
            <div class="register-header">
                <h2>Register Now</h2>
                <p>Create your account to start your financial journey</p>
            </div>

            <form @submit.prevent="handleSubmit" id="registerForm">
                <!-- Full Name -->
                <div class="form-group">
                    <label>Full Name<span class="required-mark">*</span></label>
                    <div class="input-with-icon">
                        <i class="fas fa-user"></i>
                        <input type="text" v-model.trim="form.full_name" placeholder="Enter your full name" :disabled="otpSent" required>
                    </div>
                    <div class="error-message" v-if="errors.full_name">{{ errors.full_name }}</div>
                </div>

                <!-- Email -->
                <div class="form-group">
                    <label>Email<span class="required-mark">*</span></label>
                    <div class="input-with-icon">
                        <i class="fas fa-envelope"></i>
                        <input type="email" v-model.trim="form.email" placeholder="Enter your email address" :disabled="otpSent" required>
                    </div>
                    <div class="error-message" v-if="errors.email">{{ errors.email }}</div>
                </div>

                <!-- Phone Number -->
                <div class="form-group">
                    <label>Phone Number<span class="required-mark">*</span></label>
                    <div class="input-with-icon">
                        <i class="fas fa-phone"></i>
                        <input type="tel" v-model="form.phone_number" @input="sanitizePhone" placeholder="Enter your phone number" :disabled="otpSent" required>
                    </div>
                    <div class="error-message" v-if="errors.phone_number">{{ errors.phone_number }}</div>
                </div>

                <!-- Password -->
                <div class="form-group">
                    <label>Password<span class="required-mark">*</span></label>
                    <div class="input-with-icon">
                        <i class="fas fa-lock"></i>
                        <input :type="showPassword ? 'text' : 'password'" v-model="form.password" placeholder="Create a strong password" :disabled="otpSent" required>
                        <button type="button" @click="showPassword = !showPassword" class="password-toggle">
                            <i class="fas" :class="showPassword ? 'fa-eye-slash' : 'fa-eye'"></i>
                        </button>
                    </div>
                    <div class="error-message" v-if="errors.password">{{ errors.password }}</div>
                </div>

                <!-- Referral Code -->
                <div class="form-group">
                    <label>Referral Code <small>(Optional)</small></label>
                    <div class="input-with-icon">
                        <i class="fas fa-user-friends"></i>
                        <input type="text" v-model.trim="form.referral_code" placeholder="Enter referral code if any" :disabled="otpSent">
                    </div>
                </div>

                <!-- OTP Field -->
                <div class="form-group" v-if="otpSent">
                    <label>Enter OTP<span class="required-mark">*</span></label>
                    <div class="input-with-icon">
                        <i class="fas fa-key"></i>
                        <input type="text" v-model.trim="form.otp" maxlength="6" placeholder="Enter your 6-digit OTP" required>
                    </div>
                    <div class="error-message" v-if="errors.otp">{{ errors.otp }}</div>
                </div>

                <!-- Terms Agreement -->
                <div class="terms-agreement">
                    <input type="checkbox" id="terms" required>
                    <label for="terms">
                        I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
                    </label>
                </div>

                <!-- Submit Button -->
                <button type="submit" class="submit-button" :disabled="loading">
                    <span v-if="loading"><i class="fas fa-spinner fa-spin"></i> Loading...</span>
                    <span v-else>
                        <i class="fas fa-user-plus" v-if="!otpSent"></i>
                        {{ otpSent ? 'Create Account' : 'Send OTP' }}
                    </span>
                </button>

                <div class="divider">
                    <span>OR</span>
                </div>

                <div class="login-link">
                    Already have an account?
                    <a href="#" @click.prevent="$emit('goTologin')">Login here</a>
                </div>
            </form>
        </div>

        <!-- Right Section: Benefits -->
        <div class="benefits-section">
            <h2 class="benefits-title">Why Join Bull Margin?</h2>
            <p class="benefits-description">
                Join thousands of successful traders and investors who trust Bull Margin for their financial growth.
            </p>
            
            <ul class="benefits-list">
                <li class="benefit-item">
                    <div class="benefit-icon">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div class="benefit-text">
                        <h4>Real-time Market Analytics</h4>
                        <p>Access live market data and advanced charting tools</p>
                    </div>
                </li>
                
                <li class="benefit-item">
                    <div class="benefit-icon">
                        <i class="fas fa-shield-alt"></i>
                    </div>
                    <div class="benefit-text">
                        <h4>Bank-Level Security</h4>
                        <p>Your funds and data are protected with military-grade encryption</p>
                    </div>
                </li>
                
                <li class="benefit-item">
                    <div class="benefit-icon">
                        <i class="fas fa-bolt"></i>
                    </div>
                    <div class="benefit-text">
                        <h4>Lightning Fast Execution</h4>
                        <p>Trade execution in milliseconds with our advanced infrastructure</p>
                    </div>
                </li>
                
                <li class="benefit-item">
                    <div class="benefit-icon">
                        <i class="fas fa-headset"></i>
                    </div>
                    <div class="benefit-text">
                        <h4>24/7 Customer Support</h4>
                        <p>Round-the-clock assistance from our expert team</p>
                    </div>
                </li>
            </ul>

            <div class="security-note">
                <i class="fas fa-lock"></i>
                <strong>Your security is our priority:</strong> All your information is encrypted and never shared with third parties.
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { makeRequest } from '@/request/requests'

const router = useRouter()

/* ------------------------
   STATE
------------------------ */
const otpSent = ref(false)
const loading = ref(false)
const showPassword = ref(false)

const props = defineProps({
  referral: {
    type: Object,
    default: {}
  }
})

const form = reactive({
  full_name: '',
  email: '',
  phone_number: '',
  password: '',
  referral_code: props.referral.referral || '',
  otp: '',
})

const errors = reactive({})

/* ------------------------
   HELPERS
------------------------ */
const sanitizePhone = () => {
  form.phone_number = form.phone_number.replace(/\D/g, '').slice(0, 10)
}

const validateEmailStep = () => {
  Object.keys(errors).forEach(k => delete errors[k])

  if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = 'Invalid email address'
  }

  return Object.keys(errors).length === 0
}

const validateSignupStep = () => {
  Object.keys(errors).forEach(k => delete errors[k])

  if (!form.full_name) errors.full_name = 'Full name required'
  if (form.phone_number.length !== 10)
    errors.phone_number = '10 digit phone required'
  if (form.password.length < 6)
    errors.password = 'Minimum 6 characters'
  if (!form.otp || form.otp.length !== 6)
    errors.otp = 'Valid OTP required'

  return Object.keys(errors).length === 0
}

const emit = defineEmits(['goTologin', 'goBack'])

/* ------------------------
   SUBMIT
------------------------ */
const handleSubmit = async () => {
  loading.value = true

  try {
    if (!otpSent.value) {
      if (!validateEmailStep()) return

      await makeRequest('sendOtp', 'POST', {
        email: form.email,
      })

      otpSent.value = true
      return
    }

    if (!validateSignupStep()) return

    const payload = {
      email: form.email,
      password: form.password,
      otp: form.otp,
      full_name: form.full_name,
      phone_number: form.phone_number,
      ...(form.referral_code && { referral_code: form.referral_code }),
    }

    const res = await makeRequest('register', 'POST', payload)

    if (res?.status) {
      emit('goTologin')
    }
  } catch (err) {
    console.error('Signup error:', err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-page-wrapper {
    background-color: #0b3200;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px;
    width: 100%;
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
}

.register-container {
    display: flex;
    width: 100%;
    max-width: 1100px;
    background: white;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 15px 50px rgba(0, 0, 0, 0.3);
}

.back-btn {
    background: none;
    border: none;
    color: #555;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 5px 0;
    transition: color 0.3s;
}

.back-btn:hover {
    color: #0b3200;
}

/* Left side: Registration Form */
.register-form-section {
    flex: 1.2;
    padding: 40px 50px;
    display: flex;
    flex-direction: column;
}

/* Right side: Benefits/Features */
.benefits-section {
    flex: 0.8;
    background: linear-gradient(rgba(11, 50, 0, 0.95), rgba(20, 100, 0, 0.95)), 
                url('https://images.unsplash.com/photo-1559526324-4b87b5e36e44?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80');
    background-size: cover;
    background-position: center;
    color: white;
    padding: 50px 40px;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.brand-logo {
    display: flex;
    align-items: center;
    margin-bottom: 25px;
}

.brand-logo i {
    font-size: 30px;
    margin-right: 15px;
    background: linear-gradient(to right, #0b3200, #1a5c00);
    color: white;
    width: 55px;
    height: 55px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.brand-logo h1 {
    font-size: 26px;
    font-weight: 700;
    color: #0b3200;
    margin: 0;
}

.register-header {
    text-align: left;
    margin-bottom: 30px;
}

.register-header h2 {
    font-size: 28px;
    color: #333;
    margin-bottom: 8px;
    font-weight: 700;
}

.register-header p {
    color: #666;
    font-size: 15px;
    margin: 0;
}

.required-mark {
    color: #e74c3c;
    margin-left: 2px;
}

.form-group {
    margin-bottom: 18px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    color: #555;
    font-weight: 500;
    font-size: 14px;
    text-align: left;
}

.input-with-icon {
    position: relative;
}

.input-with-icon i:not(.password-toggle i) {
    position: absolute;
    left: 18px;
    top: 50%;
    transform: translateY(-50%);
    color: #777;
    font-size: 16px;
    z-index: 10;
}

.input-with-icon input {
    width: 100%;
    padding: 14px 20px 14px 50px;
    border: 2px solid #e0e0e0;
    border-radius: 10px;
    font-size: 15px;
    transition: all 0.3s;
    background: #f9f9f9;
}

.input-with-icon input:focus {
    border-color: #0b3200;
    background: white;
    outline: none;
    box-shadow: 0 0 0 3px rgba(11, 50, 0, 0.1);
}

.input-with-icon input:disabled {
    background: #ebebeb;
    cursor: not-allowed;
    color: #888;
}

.password-toggle {
    position: absolute;
    right: 18px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #777;
    cursor: pointer;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
}

.terms-agreement {
    display: flex;
    align-items: flex-start;
    margin-bottom: 25px;
    font-size: 13px;
    text-align: left;
}

.terms-agreement input {
    margin-right: 10px;
    margin-top: 3px;
    min-width: 16px;
    height: 16px;
}

.terms-agreement a {
    color: #0b3200;
    text-decoration: none;
    font-weight: 600;
}

.terms-agreement a:hover {
    text-decoration: underline;
}

.submit-button {
    width: 100%;
    padding: 16px;
    background: linear-gradient(to right, #0b3200, #1a5c00);
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
}

.submit-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 7px 20px rgba(11, 50, 0, 0.4);
    background: linear-gradient(to right, #1a5c00, #0b3200);
}

.submit-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.divider {
    display: flex;
    align-items: center;
    margin: 20px 0;
    color: #999;
}

.divider::before,
.divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #e0e0e0;
}

.divider span {
    padding: 0 15px;
    font-size: 13px;
    font-weight: 500;
}

.login-link {
    text-align: center;
    margin-top: 15px;
    font-size: 14px;
    color: #666;
}

.login-link a {
    color: #0b3200;
    text-decoration: none;
    font-weight: 600;
    margin-left: 5px;
}

.login-link a:hover {
    text-decoration: underline;
}

.error-message {
    color: #e74c3c;
    font-size: 13px;
    margin-top: 5px;
    text-align: left;
}

/* Benefits section styling */
.benefits-title {
    font-size: 30px;
    margin-bottom: 20px;
    font-weight: 700;
    margin-top: 0;
}

.benefits-description {
    font-size: 15px;
    opacity: 0.9;
    line-height: 1.6;
    margin-bottom: 35px;
}

.benefits-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.benefit-item {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    padding: 15px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    transition: transform 0.3s;
}

.benefit-item:hover {
    transform: translateX(5px);
    background: rgba(255, 255, 255, 0.15);
}

.benefit-icon {
    font-size: 20px;
    margin-right: 15px;
    background: rgba(255, 255, 255, 0.2);
    min-width: 45px;
    height: 45px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.benefit-text {
    text-align: left;
}

.benefit-text h4 {
    font-size: 16px;
    margin: 0 0 5px 0;
    font-weight: 600;
}

.benefit-text p {
    font-size: 13px;
    opacity: 0.8;
    margin: 0;
}

.security-note {
    margin-top: 25px;
    padding: 15px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    font-size: 13px;
    border-left: 4px solid #4CAF50;
    text-align: left;
}

.security-note i {
    margin-right: 5px;
}

@media (max-width: 900px) {
    .register-container {
        flex-direction: column;
        max-width: 500px;
    }
    
    .register-form-section {
        padding: 30px 20px;
    }
    
    .benefits-section {
        padding: 30px;
    }
}
</style>
