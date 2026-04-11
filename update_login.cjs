const fs = require('fs');

let content = fs.readFileSync('src/views/auth/Login.vue', 'utf8');

// 1. Replace Template
const startMarker = '    <!-- Forgot Password Modal/Overlay -->';
const endMarker = '</template>';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker) + endMarker.length;

if (startIndex !== -1 && endIndex !== -1) {
    const newTemplate = `    <!-- Forgot Password Container -->
    <div v-if="showForgotPassword" class="forgot-container">
        <!-- Left Section: Forgot Password Form -->
        <div class="forgot-form-section">
            <div class="brand-logo">
                <i class="fas fa-chart-line"></i>
                <h1>Bull Margin</h1>
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
                <i class="fas fa-exclamation-triangle"></i>
                <strong>Security Alert:</strong> Never share your password or verification codes with anyone. Bull Margin will never ask for your password via email or phone.
            </div>
        </div>
    </div>
  </div>
</template>`;
    
    content = content.substring(0, startIndex) + newTemplate + content.substring(endIndex);
}

// 2. Add new script logic
const logicStr = `
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
    const nextInput = document.getElementById(\`otp-\${index + 1}\`);
    if (nextInput) nextInput.focus();
  }
  
  forgotPasswordData.value.otp = otpArr.value.join('');
}

function handleOtpKeydown(index, event) {
  if (event.key === 'Backspace' && !otpArr.value[index] && index > 0) {
    const prevInput = document.getElementById(\`otp-\${index - 1}\`);
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
const showForgotPassword = ref(false)`;

content = content.replace(
    /\/\/ Call on component mount\s+onMounted\(\(\) => \{\s+initMetaPixel\(\);\s+\}\);\s+\/\/ Forgot Password State\s+const showForgotPassword = ref\(false\)/,
    logicStr
);

// 3. Update sendOTP
content = content.replace(
    /forgotPasswordStep\.value = 2[\s\n]+}[^\n]* catch \(err\)/,
    `forgotPasswordStep.value = 2\n      startCountdown()\n    }\n  } catch (err)`
);

// 4. Update resetPassword (remove toast and close modal, go to step 4)
content = content.replace(
    /\/\/ toastStore\.addToast\("Success", "Password reset successfully", "success", 3000\);\s+\/\/ Reset form and close modal\s+resetForgotPasswordForm\(\)\s+\/\/ Optionally pre-fill the email in login form\s+formData\.value\.email = forgotPasswordData\.value\.email\s+}\s+} catch \(err\)/,
    `forgotPasswordStep.value = 4\n      formData.value.email = forgotPasswordData.value.email\n    }\n  } catch (err)`
);

// 5. Update reset form
content = content.replace(
    /const showConfirmPassword = ref\(false\)/,
    `const showConfirmPassword = ref(false)`
);

content = content.replace(
    /function goBackToEmailStep\(\) \{[\s\S]*?function resetForgotPasswordForm\(\) \{[\s\S]*?\}\s*<\/script>/,
    `function goBackToEmailStep() {
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
</script>`
);

fs.writeFileSync('src/views/auth/Login.vue', content, 'utf8');
console.log('Login.vue updated successfully completely via Node.js file script!');
