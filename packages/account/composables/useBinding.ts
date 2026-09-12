import { computed, onUnmounted, ref } from "vue";
import { studioService } from "@/services/studioService";
import { refreshDashboard } from "@/composables/useStudio";
import { errorMessage, isEmail } from "@/utils/format";

export const useBinding = (onSuccess: () => void) => {
  const email = ref("");
  const credential = ref("");
  const mode = ref<"code" | "password">("code");
  const agreed = ref(false);
  const error = ref("");
  const busy = ref(false);
  const sending = ref(false);
  const remaining = ref(0);
  const codeSent = ref(false);
  let timer: ReturnType<typeof setInterval> | undefined;
  const clearTimer = () => {
    if (timer) clearInterval(timer);
    timer = undefined;
  };
  onUnmounted(clearTimer);
  const canSend = computed(() => !sending.value && remaining.value === 0);
  const requestCode = async () => {
    if (!canSend.value) return;
    error.value = "";
    if (!isEmail(email.value.trim())) {
      error.value = "请输入有效的邮箱地址";
      return;
    }
    sending.value = true;
    try {
      const response = await studioService.requestCode(email.value);
      const deadline = Date.now() + response.retryAfter * 1000;
      remaining.value = response.retryAfter;
      codeSent.value = true;
      clearTimer();
      timer = setInterval(() => {
        remaining.value = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
        if (!remaining.value) clearTimer();
      }, 1000);
    } catch (reason) {
      error.value = errorMessage(reason);
    } finally {
      sending.value = false;
    }
  };
  const toggleMode = () => {
    mode.value = mode.value === "code" ? "password" : "code";
    credential.value = "";
    error.value = "";
  };
  const submit = async () => {
    if (busy.value) return;
    error.value = "";
    busy.value = true;
    try {
      await studioService.bind({
        email: email.value,
        credential: credential.value,
        mode: mode.value,
        agreed: agreed.value,
      });
      await refreshDashboard();
      onSuccess();
    } catch (reason) {
      error.value = errorMessage(reason);
    } finally {
      busy.value = false;
    }
  };
  return {
    email,
    credential,
    mode,
    agreed,
    error,
    busy,
    sending,
    remaining,
    codeSent,
    canSend,
    requestCode,
    toggleMode,
    submit,
  };
};
