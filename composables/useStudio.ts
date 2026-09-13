import { computed, ref } from "vue";
import { studioService } from "@/services/studioService";
import type { Dashboard } from "@/types/studio";
import { errorMessage } from "@/utils/format";

const dashboard = ref<Dashboard>({ account: null, orders: [], novels: [] });
const initialized = ref(false);
const authError = ref("");
const loading = ref(false);
let pending: Promise<void> | null = null;
export const refreshDashboard = async () => {
  if (pending) return pending;
  loading.value = true;
  pending = (async () => {
    try {
      dashboard.value = await studioService.getDashboard();
      authError.value = "";
      initialized.value = true;
    } catch (error) {
      authError.value = errorMessage(error);
      dashboard.value = { account: null, orders: [], novels: [] };
    } finally {
      loading.value = false;
      pending = null;
    }
  })();
  return pending;
};
export const useStudio = () => ({
  dashboard,
  initialized,
  authError,
  loading,
  account: computed(() => dashboard.value.account),
  isBound: computed(() => !!dashboard.value.account),
  refresh: refreshDashboard,
});
