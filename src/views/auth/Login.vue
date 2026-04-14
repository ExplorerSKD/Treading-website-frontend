<template>
  <div class="login-page-wrapper">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <div v-show="!showForgotPassword" class="login-container">
        <!-- Left Section: Login Form -->
        <div class="login-form-section">

            <div class="brand-logo" style="justify-content: center;">
                <img src="/logo.png" alt="Bull Margin Logo" style="width: 90px; height: 90px; border-radius: 16px; object-fit: contain;">
            </div>

            <form @submit.prevent="handleLogin" id="loginForm">
                <div class="input-group">
                    <label>Email</label>
                    <div class="input-with-icon">
                        <i class="fas fa-user"></i>
                        <input type="text" v-model="formData.email" placeholder="Enter your email" required>
                    </div>
                </div>

                <div class="input-group">
                    <label>Password</label>
                    <div class="input-with-icon">
                        <i class="fas fa-key"></i>
                        <input :type="showPassword ? 'text' : 'password'" v-model="formData.password" placeholder="Enter your password" required>
                        <button type="button" @click="showPassword = !showPassword" class="password-toggle">
                            <i class="fas" :class="showPassword ? 'fa-eye-slash' : 'fa-eye'"></i>
                        </button>
                    </div>
                </div>

                <div class="remember-forgot">
                    <div class="remember-me">
                        <input type="checkbox" id="remember">
                        <label for="remember">Remember me</label>
                    </div>
                    <a href="#" @click.prevent="showForgotPassword = true" class="forgot-password">Forgot password?</a>
                </div>

                <button type="submit" class="login-button" :disabled="loading">
                    <span v-if="loading"><i class="fas fa-spinner fa-spin"></i> Authenticating...</span>
                    <span v-else><i class="fas fa-sign-in-alt"></i> Sign In</span>
                </button>

                <div class="divider" style="margin: 25px 0 15px 0; display: flex; align-items: center; color: #999;">
                    <span style="flex: 1; height: 1px; background: #e0e0e0;"></span>
                    <span style="padding: 0 15px; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">OR</span>
                    <span style="flex: 1; height: 1px; background: #e0e0e0;"></span>
                </div>

                <div class="action-links" style="text-align: center; margin-top: 15px;">
                    <button type="button" @click="$emit('goToRegister')" style="width: 100%; border: 1.5px solid #0b3200; border-radius: 10px; background: transparent; color: #0b3200; padding: 14px; font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.3s; margin-bottom: 12px; display: flex; justify-content: center; align-items: center; gap: 8px;">
                        <i class="fas fa-user-plus"></i> Create New Account
                    </button>
                    
                    <button type="button" @click="handleDemoLogin" style="width: 100%; padding: 14px; background: #fffbeb; color: #d97706; border: 1.5px solid #fde68a; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 8px; transition: all 0.3s;">
                        <i class="fas fa-play-circle"></i> Try Demo Account
                    </button>
                </div>

                <div class="security-note">
                    <i class="fas fa-exclamation-triangle"></i>
                    <strong>Security Tip:</strong> Never share your credentials. Ensure you're on the official Bull Margin platform.
                </div>
            </form>
        </div>

        <!-- Right Section: Features -->
        <div class="features-section">
            <h2 class="features-title">Secure Access Portal</h2>
            <p class="features-description">
                Access your dashboard with enterprise-grade security and seamless experience.
            </p>
            
            <ul class="features-list">
                <li class="feature-item">
                    <div class="feature-icon">
                        <i class="fas fa-lock"></i>
                    </div>
                    <div class="feature-text">
                        <h4>Military-grade encryption</h4>
                        <p>Your data is protected with bank-level security protocols</p>
                    </div>
                </li>
                
                <li class="feature-item">
                    <div class="feature-icon">
                        <i class="fas fa-bolt"></i>
                    </div>
                    <div class="feature-text">
                        <h4>Lightning fast performance</h4>
                        <p>Real-time updates and instant dashboard loading</p>
                    </div>
                </li>
                
                <li class="feature-item">
                    <div class="feature-icon">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div class="feature-text">
                        <h4>Real-time analytics dashboard</h4>
                        <p>Monitor your performance with live charts and insights</p>
                    </div>
                </li>
            </ul>
        </div>
    </div>

    <!-- Forgot Password Container -->
    <div v-if="showForgotPassword" class="forgot-container">
        <!-- Left Section: Forgot Password Form -->
        <div class="forgot-form-section">
            <div class="brand-logo" style="justify-content: center;">
                <img src="/logo.png" alt="Bull Margin Logo" style="width: 90px; height: 90px; border-radius: 16px; object-fit: contain;">
            </div>
            
            <div class="forgot-header">
                <h2>Reset Your Password</h2>
                <p>Enter your email address and follow the steps to reset your password securely.</p>
            </div>

            <!-- Step Indicator -->
            <div class="step-indicator">
                <div class="step" :class="{ 'active': forgotPasswordStep === 1, 'completed': forgotPasswordStep > 1 }">
                    <div class="step-circle">1</div>
                    <div class="step-text">Enter Email</div>
                </div>
                <div class="step" :class="{ 'active': forgotPasswordStep === 2, 'completed': forgotPasswordStep > 2 }">
                    <div class="step-circle">2</div>
                    <div class="step-text">Verify Code</div>
                </div>
                <div class="step" :class="{ 'active': forgotPasswordStep === 3, 'completed': forgotPasswordStep > 3 }">
                    <div class="step-circle">3</div>
                    <div class="step-text">New Password</div>
                </div>
            </div>

            <form @submit.prevent>
                <!-- Step 1: Enter Email -->
                <div class="form-step" :class="{ 'active': forgotPasswordStep === 1 }">
                    <div class="form-group">
                        <label>Email Address</label>
                        <div class="input-with-icon">
                            <i class="fas fa-envelope"></i>
                            <input type="email" v-model="forgotPasswordData.email" placeholder="Enter your registered email address" required>
                        </div>
                    </div>

                    <div class="button-group">
                        <button type="button" class="action-button secondary-btn" @click="resetForgotPasswordForm">
                            <i class="fas fa-arrow-left"></i> Back to Login
                        </button>
                        <button type="button" @click="sendOTP" :disabled="otpLoading" class="action-button primary-btn">
                            <span v-if="otpLoading"><i class="fas fa-spinner fa-spin"></i> Sending...</span>
                            <span v-else>Send Verification Code <i class="fas fa-paper-plane"></i></span>
                        </button>
                    </div>
                </div>

                <!-- Step 2: Verify Code -->
                <div class="form-step" :class="{ 'active': forgotPasswordStep === 2 }">
                    <div class="form-group">
                        <label>Verification Code</label>
                        <p style="color: #666; margin-bottom: 15px; font-size: 14px;">
                            Enter the 6-digit code sent to <strong>{{ forgotPasswordData.email }}</strong>
                        </p>
                        
                        <div class="code-inputs">
                            <input type="text" maxlength="1" class="code-digit" v-for="(_, index) in 6" :key="index" :id="'otp-' + index" v-model="otpArr[index]" @input="handleOtpInput(index, $event)" @keydown="handleOtpKeydown(index, $event)">
                        </div>
                        
                        <div class="resend-code" :class="{ 'disabled': countdown > 0 }">
                            Didn't receive the code? <a href="#" @click.prevent="resendOTP">Resend code</a>
                            <span v-if="countdown > 0" class="timer"> ({{ countdown }}s)</span>
                        </div>
                    </div>

                    <div class="button-group">
                        <button type="button" class="action-button secondary-btn" @click="forgotPasswordStep = 1">
                            <i class="fas fa-arrow-left"></i> Back
                        </button>
                        <button type="button" class="action-button primary-btn" @click="verifyCodeLocal">
                            Verify Code <i class="fas fa-check"></i>
                        </button>
                    </div>
                </div>

                <!-- Step 3: New Password -->
                <div class="form-step" :class="{ 'active': forgotPasswordStep === 3 }">
                    <div class="form-group">
                        <label>New Password</label>
                        <div class="input-with-icon">
                            <i class="fas fa-lock"></i>
                            <input :type="showNewPassword ? 'text' : 'password'" v-model="forgotPasswordData.new_password" placeholder="Enter new password" required>
                            <button type="button" class="password-toggle" @click="showNewPassword = !showNewPassword">
                                <i class="fas" :class="showNewPassword ? 'fa-eye-slash' : 'fa-eye'"></i>
                            </button>
                        </div>
                        <div class="password-strength">
                            Password strength: 
                            <div class="strength-meter">
                                <div class="strength-fill" :style="{ width: passwordStrength.width, backgroundColor: passwordStrength.color }"></div>
                            </div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Confirm New Password</label>
                        <div class="input-with-icon">
                            <i class="fas fa-lock"></i>
                            <input :type="showConfirmPassword ? 'text' : 'password'" v-model="forgotPasswordData.confirm_password" placeholder="Confirm new password" required>
                            <button type="button" class="password-toggle" @click="showConfirmPassword = !showConfirmPassword">
                                <i class="fas" :class="showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'"></i>
                            </button>
                        </div>
                        <div v-if="passwordMismatch" class="error-message" style="display:block">Passwords do not match</div>
                    </div>

                    <div class="button-group">
                        <button type="button" class="action-button secondary-btn" @click="forgotPasswordStep = 2">
                            <i class="fas fa-arrow-left"></i> Back
                        </button>
                        <button type="button" @click="resetPassword" :disabled="resetLoading" class="action-button primary-btn">
                            <span v-if="resetLoading"><i class="fas fa-spinner fa-spin"></i> Resetting...</span>
                            <span v-else>Reset Password <i class="fas fa-key"></i></span>
                        </button>
                    </div>
                </div>

                <!-- Success Message -->
                <div class="form-step" :class="{ 'active': forgotPasswordStep === 4 }">
                    <div class="success-message">
                        <div class="success-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <h3>Password Reset Successful!</h3>
                        <p>Your password has been successfully reset. You can now log in with your new password.</p>
                        <button type="button" class="action-button primary-btn" @click="resetForgotPasswordForm">
                            <i class="fas fa-sign-in-alt"></i> Go to Login
                        </button>
                    </div>
                </div>
            </form>
            
            <div class="back-to-login" v-if="forgotPasswordStep < 4">
                Remember your password?
                <a href="#" @click.prevent="resetForgotPasswordForm">Login here</a>
            </div>
        </div>

        <!-- Right Section: Security Info -->
        <div class="security-section">
            <h2 class="security-title">Password Security Tips</h2>
            
            <ul class="security-tips">
                <li class="security-tip">
                    <i class="fas fa-lock"></i>
                    <div>
                        <h4>Use Strong Passwords</h4>
                        <p>Combine uppercase, lowercase, numbers, and special characters for maximum security.</p>
                    </div>
                </li>
                
                <li class="security-tip">
                    <i class="fas fa-sync-alt"></i>
                    <div>
                        <h4>Change Regularly</h4>
                        <p>Update your password every 60-90 days to maintain account security.</p>
                    </div>
                </li>
                
                <li class="security-tip">
                    <i class="fas fa-user-shield"></i>
                    <div>
                        <h4>Avoid Common Patterns</h4>
                        <p>Don't use personal information or common words that are easy to guess.</p>
                    </div>
                </li>
                
                <li class="security-tip">
                    <i class="fas fa-envelope"></i>
                    <div>
                        <h4>Check Your Email</h4>
                        <p>Ensure you have access to your registered email for verification codes.</p>
                    </div>
                </li>
            </ul>

            <div class="security-note">
                <i class="fas fa-exclamation-triangle" style="color: #ff4d4d;"></i>
                <strong style="color: #ff4d4d;">Security Alert:</strong> <span style="color: #ffffff;">Never share your password or verification codes with anyone. Bull Margin will never ask for your password via email or phone.</span>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTickerStore } from '@/stores/ticker'
import { useToastStore } from "@/stores/utils/toast";
import { makeRequest, setTokenAndRole } from '@/request/requests';

const router = useRouter()
const toastStore = useToastStore()

const formData = ref({
  email: '',
  password: '',
})

function initMetaPixel() {
  // First Meta Pixel
  !(function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

  fbq('init', '1934021700420702');
  fbq('init', '1190042062842545');
  fbq('track', 'PageView');
}


// Call on component mount
onMounted(() => {
  initMetaPixel();
});

// Resend timer logic
const countdown = ref(0);
let countdownInterval = null;

function startCountdown() {
  countdown.value = 60;
  clearInterval(countdownInterval);
  countdownInterval = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) clearInterval(countdownInterval);
  }, 1000);
}

function resendOTP() {
  if (countdown.value > 0) return;
  sendOTP();
}

// Security / Validation
const passwordStrength = computed(() => {
  const pass = forgotPasswordData.value.new_password;
  let strength = 0;
  if (!pass) return { width: '0%', color: '#e74c3c' };
  if (pass.length >= 8) strength += 25;
  if (/[A-Z]/.test(pass)) strength += 25;
  if (/[0-9]/.test(pass)) strength += 25;
  if (/[^A-Za-z0-9]/.test(pass)) strength += 25;

  let color = '#e74c3c';
  if (strength >= 75) color = '#2ecc71';
  else if (strength >= 50) color = '#f39c12';

  return { width: strength + '%', color };
});

const passwordMismatch = computed(() => {
  if(!forgotPasswordData.value.new_password || !forgotPasswordData.value.confirm_password) return false;
  return forgotPasswordData.value.new_password !== forgotPasswordData.value.confirm_password;
});

// OTP Layout Logic
const otpArr = ref(['', '', '', '', '', '']);

function handleOtpInput(index, event) {
  const value = event.target.value;
  otpArr.value[index] = value;
  
  if (value && index < 5) {
    const nextInput = document.getElementById(`otp-${index + 1}`);
    if (nextInput) nextInput.focus();
  }
  
  forgotPasswordData.value.otp = otpArr.value.join('');
}

function handleOtpKeydown(index, event) {
  if (event.key === 'Backspace' && !otpArr.value[index] && index > 0) {
    const prevInput = document.getElementById(`otp-${index - 1}`);
    if (prevInput) prevInput.focus();
    otpArr.value[index - 1] = '';
    forgotPasswordData.value.otp = otpArr.value.join('');
  }
}

function verifyCodeLocal() {
    if (forgotPasswordData.value.otp.length !== 6) {
        toastStore.addToast('Error', 'Please enter the 6-digit code', 'error', 3000);
        return;
    }
    forgotPasswordStep.value = 3;
}

// Forgot Password State
const showForgotPassword = ref(false)
const forgotPasswordStep = ref(1) // 1 = email input, 2 = OTP and password reset
const forgotPasswordData = ref({
  email: '',
  otp: '',
  new_password: '',
  confirm_password: ''
})

const otpLoading = ref(false)
const resetLoading = ref(false)
const showPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const currentTime = computed(() => {
  const date = new Date()
  return `${date.getHours()}:${date.getMinutes()}`
})

const handleGetOTP = () => {
  // Validate form data
  if (!formData.value.email || !formData.value.password) {
    console.log('Please fill in all fields')
    return
  }

  console.log('Getting OTP for:', formData.value)

  // Simulate OTP request
  // In real app, this would make an API call
  setTimeout(() => {
    // For demo, redirect to home page after "successful" login
    router.push('/')
  }, 1000)
}


const token = ref(localStorage.getItem('token'))
const isAuthenticated = ref(!!token.value)
const error = ref(null)
const loading = ref(false)

async function handleLogin() {
  if (!formData.value.email || !formData.value.password) {
    toastStore.addToast(
      "Error",
      "Please fill valid email and password",
      "error",
      3000
    );
    return;
  }

  loading.value = true;
  error.value = null;

  const form = new FormData();
  form.append("username", formData.value.email);
  form.append("password", formData.value.password);

  try {
    const res = await makeRequest("login", "POST", form);
    if (res?.error) {
      error.value = res.error || "Something went wrong";
      toastStore.addToast("Error", error.value, "error", 3000);
      return;
    }

    if (res?.access_token) {
      token.value = `Bearer ${res.access_token}`;
      localStorage.setItem("token", token.value);
      isAuthenticated.value = true;

      // toastStore.addToast(
      //   "Success",
      //   "Login successful",
      //   "success",
      //   3000
      // );

      // Set token & role
      setTokenAndRole(token.value, "user");

      // Start websocket safely
      setTimeout(() => {
        const rawToken = token.value?.replace("Bearer ", "") || "";
        useTickerStore().startWebSocket(rawToken);
      }, 1000);

      router.push({ name: "market" });
    }
  } catch (err) {
    console.error("Login error:", err);
    error.value = "Unable to login. Please try again.";
    toastStore.addToast("Error", error.value, "error", 3000);
  } finally {
    loading.value = false;
  }
}

async function handleDemoLogin() {


  loading.value = true;
  error.value = null;

  try {
    const res = await makeRequest("demoLogin", "POST");
    if (res?.error) {
      error.value = res.error || "Something went wrong";
      toastStore.addToast("Error", error.value, "error", 3000);
      return;
    }

    if (res?.access_token) {
      token.value = `Bearer ${res.access_token}`;
      localStorage.setItem("token", token.value);
      isAuthenticated.value = true;

      // Set token & role
      setTokenAndRole(token.value, "user");

      // Start websocket safely
      setTimeout(() => {
        const rawToken = token.value?.replace("Bearer ", "") || "";
        useTickerStore().startWebSocket(rawToken);
      }, 1000);

      router.push({ name: "market" });
    }
  } catch (err) {
    console.error("Login error:", err);
    error.value = "Unable to login. Please try again.";
    toastStore.addToast("Error", error.value, "error", 3000);
  } finally {
    loading.value = false;
  }
}


// Forgot Password Functions
async function sendOTP() {
  if (!forgotPasswordData.value.email) {
    toastStore.addToast("Error", "Please enter your email", "error", 3000);
    return
  }

  otpLoading.value = true

  try {
    const payload = {
      email: forgotPasswordData.value.email
    }

    // const res = await apiService.post<any>('/auth/send-otp-forgot-password', payload)

    const res = await makeRequest('forgetPassword', 'POST', payload);
    if (res.error) {
      toastStore.addToast("Error", res.error || 'Failed to send OTP', "error", 3000);
    } else {
      // toastStore.addToast("Success", "OTP sent successfully to your email", "success", 3000);
      forgotPasswordStep.value = 2
    }
  } catch (err) {
    toastStore.addToast("Error", "Something went wrong", "error", 3000);
  }

  otpLoading.value = false
}

async function resetPassword() {
  if (!forgotPasswordData.value.otp || !forgotPasswordData.value.new_password || !forgotPasswordData.value.confirm_password) {
    toastStore.addToast("Error", "Please fill all fields", "error", 3000);
    return
  }

  if (forgotPasswordData.value.otp.length !== 6) {
    toastStore.addToast("Error", "OTP must be 6 digits", "error", 3000);
    return
  }

  if (forgotPasswordData.value.new_password !== forgotPasswordData.value.confirm_password) {
    toastStore.addToast("Error", "Passwords do not match", "error", 3000);
    return
  }

  if (forgotPasswordData.value.new_password.length < 6) {
    toastStore.addToast("Error", "Password must be at least 6 characters", "error", 3000);
    return
  }

  resetLoading.value = true

  try {
    const payload = {
      email: forgotPasswordData.value.email,
      otp: forgotPasswordData.value.otp,
      new_password: forgotPasswordData.value.new_password,
    }

    const res = await makeRequest('resetPassword', 'POST', payload)
    // const res = await apiService.post<any>('/auth/forgot-password', payload)

    if (res.error) {
      toastStore.addToast("Error", res.error || 'Failed to reset password', "error", 3000);
    } else {
      forgotPasswordStep.value = 4
      formData.value.email = forgotPasswordData.value.email
    }
  } catch (err) {
    toastStore.addToast("Error", "Something went wrong", "error", 3000);
  }

  resetLoading.value = false
}

function goBackToEmailStep() {
  forgotPasswordStep.value = 1
  forgotPasswordData.value.otp = ''
  forgotPasswordData.value.new_password = ''
  forgotPasswordData.value.confirm_password = ''
  otpArr.value = ['', '', '', '', '', '']
}

function resetForgotPasswordForm() {
  showForgotPassword.value = false
  forgotPasswordStep.value = 1
  forgotPasswordData.value = {
    email: '',
    otp: '',
    new_password: '',
    confirm_password: ''
  }
  otpArr.value = ['', '', '', '', '', '']
  countdown.value = 0
}
</script>

<style scoped>
.login-page-wrapper {
    background-color: #0b3200;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px;
    width: 100%;
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
}

.login-container {
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

/* Left side: Login Form */
.login-form-section {
    flex: 1.2;
    padding: 60px 40px;
    display: flex;
    flex-direction: column;
}

/* Right side: Features */
.features-section {
    flex: 0.8;
    background: linear-gradient(rgba(11, 50, 0, 0.9), rgba(20, 100, 0, 0.9)), 
                url('https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80');
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
    margin-bottom: 40px;
}

.brand-logo i {
    font-size: 32px;
    margin-right: 15px;
    background: linear-gradient(to right, #0b3200, #1a5c00);
    color: white;
    width: 60px;
    height: 60px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.brand-logo h1 {
    font-size: 28px;
    font-weight: 700;
    color: #0b3200;
    margin: 0;
}

.login-header {
    text-align: left;
    margin-bottom: 40px;
}

.login-header h2 {
    font-size: 32px;
    color: #333;
    margin-bottom: 10px;
}

.login-header p {
    color: #666;
    font-size: 15px;
}

.input-group {
    margin-bottom: 25px;
    position: relative;
    text-align: left;
}

.input-group label {
    display: block;
    margin-bottom: 8px;
    color: #555;
    font-weight: 500;
    font-size: 14px;
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
    font-size: 18px;
    z-index: 10;
}

.input-with-icon input {
    width: 100%;
    padding: 16px 20px 16px 50px;
    border: 2px solid #e0e0e0;
    border-radius: 10px;
    font-size: 16px;
    transition: all 0.3s;
    background: #f9f9f9;
}

.input-with-icon input:focus {
    border-color: #0b3200;
    background: white;
    outline: none;
    box-shadow: 0 0 0 3px rgba(11, 50, 0, 0.1);
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
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
}

.remember-forgot {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
    font-size: 14px;
}

.remember-me {
    display: flex;
    align-items: center;
}

.remember-me input {
    margin-right: 8px;
    min-width: 16px;
    height: 16px;
}

.forgot-password {
    color: #0b3200;
    text-decoration: none;
    font-weight: 600;
}

.forgot-password:hover {
    text-decoration: underline;
}

.login-button {
    width: 100%;
    padding: 18px;
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

.login-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 7px 20px rgba(11, 50, 0, 0.4);
    background: linear-gradient(to right, #1a5c00, #0b3200);
}

.login-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.security-note {
    margin-top: 25px;
    padding: 15px;
    background: rgba(11, 50, 0, 0.05);
    border-radius: 8px;
    font-size: 13px;
    color: #0b3200;
    border-left: 4px solid #0b3200;
    text-align: left;
}

.security-note i {
    color: #0b3200;
    margin-right: 8px;
}

/* Features section styling */
.features-title {
    font-size: 32px;
    margin-bottom: 25px;
    font-weight: 700;
    margin-top: 0;
}

.features-description {
    font-size: 16px;
    opacity: 0.9;
    line-height: 1.6;
    margin-bottom: 40px;
}

.features-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.feature-item {
    display: flex;
    align-items: center;
    margin-bottom: 25px;
    padding: 15px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    transition: transform 0.3s;
}

.feature-item:hover {
    transform: translateX(5px);
    background: rgba(255, 255, 255, 0.15);
}

.feature-icon {
    font-size: 22px;
    margin-right: 15px;
    background: rgba(255, 255, 255, 0.2);
    min-width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.feature-text {
    text-align: left;
}

.feature-text h4 {
    font-size: 18px;
    margin: 0 0 5px 0;
    font-weight: 600;
}

.feature-text p {
    font-size: 14px;
    opacity: 0.8;
    margin: 0;
}

@media (max-width: 900px) {
    .login-container {
        flex-direction: column;
        max-width: 500px;
    }
    
    .login-form-section {
        padding: 40px 30px;
    }
    
    .features-section {
        padding: 30px;
    }
    
    .features-title {
        font-size: 28px;
    }

    .login-button {
        padding: 14px;
        font-size: 15px;
    }

    .input-with-icon input {
        padding: 12px 15px 12px 45px;
        font-size: 14px;
    }

    .input-with-icon i:not(.password-toggle i) {
        left: 15px;
        font-size: 16px;
    }

    .password-toggle {
        right: 15px;
        font-size: 16px;
    }
}
</style>

<style scoped>
/* FORGOT PASSWORD STYLES */
.forgot-container {
    display: flex;
    width: 100%;
    max-width: 1100px;
    background: white;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 15px 50px rgba(0, 0, 0, 0.3);
}

.forgot-form-section {
    flex: 1.2;
    padding: 60px 40px;
    display: flex;
    flex-direction: column;
}

.security-section {
    flex: 0.8;
    background: linear-gradient(rgba(11, 50, 0, 0.95), rgba(20, 100, 0, 0.95)), 
                url('https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80');
    background-size: cover;
    background-position: center;
    color: white;
    padding: 50px 40px;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.forgot-header {
    text-align: left;
    margin-bottom: 40px;
}

.forgot-header h2 {
    font-size: 32px;
    color: #333;
    margin-bottom: 10px;
    font-weight: 700;
}

.forgot-header p {
    color: #666;
    font-size: 15px;
    line-height: 1.6;
}

.step-indicator {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 40px;
    position: relative;
}

.step-indicator::before {
    content: '';
    position: absolute;
    top: 20px;
    left: 10%;
    right: 10%;
    height: 2px;
    background: #e0e0e0;
    z-index: 1;
}

.step {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    z-index: 2;
}

.step-circle {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    color: #999;
    margin-bottom: 10px;
    border: 3px solid #f0f0f0;
    transition: all 0.3s;
}

.step.active .step-circle {
    background: #0b3200;
    color: white;
    border-color: #0b3200;
}

.step.completed .step-circle {
    background: #27ae60;
    color: white;
    border-color: #27ae60;
}

.step-text {
    font-size: 12px;
    color: #999;
    text-align: center;
}

.step.active .step-text {
    color: #0b3200;
    font-weight: 500;
}

.form-step {
    display: none;
    animation: fadeIn 0.5s ease;
}

.form-step.active {
    display: block;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

.form-group {
    margin-bottom: 25px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    color: #555;
    font-weight: 500;
    font-size: 14px;
    text-align: left;
}

.code-inputs {
    display: flex;
    gap: 10px;
    justify-content: center;
    margin-bottom: 20px;
}

.code-inputs input {
    width: 50px;
    height: 60px;
    text-align: center;
    font-size: 24px;
    font-weight: 600;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    background: #f9f9f9;
}

.code-inputs input:focus {
    border-color: #0b3200;
    outline: none;
    box-shadow: 0 0 0 3px rgba(11, 50, 0, 0.1);
}

.resend-code {
    text-align: center;
    margin-bottom: 20px;
    font-size: 14px;
}

.resend-code a {
    color: #0b3200;
    text-decoration: none;
    font-weight: 500;
}

.resend-code a:hover {
    text-decoration: underline;
}

.resend-code.disabled {
    color: #999;
}

.resend-code.disabled a {
    color: #999;
    cursor: not-allowed;
}

.timer {
    color: #e74c3c;
    font-weight: 600;
}

.password-strength {
    margin-top: 8px;
    font-size: 13px;
    display: flex;
    align-items: center;
}

.strength-meter {
    flex: 1;
    height: 4px;
    background: #e0e0e0;
    border-radius: 2px;
    margin-left: 10px;
    overflow: hidden;
}

.strength-fill {
    height: 100%;
    width: 0%;
    background: #e74c3c;
    transition: width 0.3s, background 0.3s;
}

.button-group {
    display: flex;
    gap: 15px;
    margin-top: 30px;
}

.action-button {
    flex: 1;
    padding: 18px;
    border: none;
    border-radius: 10px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    justify-content: center;
    align-items: center;
}

.primary-btn {
    background: linear-gradient(to right, #0b3200, #1a5c00);
    color: white;
}

.primary-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 7px 20px rgba(11, 50, 0, 0.4);
    background: linear-gradient(to right, #1a5c00, #0b3200);
}

.secondary-btn {
    background: #f0f0f0;
    color: #555;
}

.secondary-btn:hover {
    background: #e0e0e0;
}

.action-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
}

.action-button i {
    margin-left: 8px;
}
.secondary-btn i {
    margin-left: 0;
    margin-right: 8px;
}

.success-message {
    text-align: center;
    padding: 30px;
    animation: fadeIn 0.5s ease;
}

.success-icon {
    font-size: 60px;
    color: #27ae60;
    margin-bottom: 20px;
}

.success-message h3 {
    font-size: 24px;
    color: #333;
    margin-bottom: 10px;
}

.success-message p {
    color: #666;
    margin-bottom: 30px;
    line-height: 1.6;
}

.back-to-login {
    text-align: center;
    margin-top: 30px;
    font-size: 15px;
    color: #666;
}

.back-to-login a {
    color: #0b3200;
    text-decoration: none;
    font-weight: 600;
    margin-left: 5px;
}

.back-to-login a:hover {
    text-decoration: underline;
}

.error-message {
    color: #e74c3c;
    font-size: 13px;
    margin-top: 5px;
}

/* Security section styling */
.security-title {
    font-size: 32px;
    margin-bottom: 30px;
    font-weight: 700;
}

.security-tips {
    list-style: none;
    padding: 0;
    margin: 0;
}

.security-tip {
    display: flex;
    align-items: flex-start;
    margin-bottom: 25px;
    padding: 15px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
}

.security-tip i {
    font-size: 20px;
    margin-right: 15px;
    margin-top: 3px;
    color: #4CAF50;
}

.security-tip h4 {
    font-size: 16px;
    margin-bottom: 5px;
    font-weight: 600;
    margin-top: 0;
}

.security-tip p {
    font-size: 14px;
    opacity: 0.9;
    line-height: 1.5;
    margin: 0;
}

.security-section .security-note {
    background: rgba(255, 255, 255, 0.1);
}

@media (max-width: 900px) {
    .forgot-container {
        flex-direction: column;
        max-width: 500px;
    }
    
    .forgot-form-section {
        padding: 40px 30px;
    }
    
    .security-section {
        padding: 30px;
    }
    
    .security-title {
        font-size: 28px;
    }

    .forgot-header {
        margin-bottom: 25px;
    }

    .forgot-header h2 {
        font-size: 24px;
    }

    .forgot-header p {
        font-size: 13px;
    }

    .step-circle {
        width: 30px;
        height: 30px;
        font-size: 14px;
        border-width: 2px;
    }

    .step-text {
        font-size: 10px;
    }

    .step-indicator {
        margin-bottom: 30px;
    }

    .step-indicator::before {
        top: 15px;
        left: 5%;
        right: 5%;
    }
    
    .code-inputs input {
        width: 40px;
        height: 50px;
        font-size: 20px;
    }

    .action-button {
        padding: 10px 8px;
        font-size: 13px;
        border-radius: 8px;
        line-height: 1.3;
    }

    .button-group {
        gap: 10px;
        margin-top: 20px;
    }

    .back-to-login {
        margin-top: 20px;
        font-size: 14px;
    }
}
</style>
