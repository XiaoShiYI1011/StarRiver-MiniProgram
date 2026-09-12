import { computed, ref } from "vue";
import { studioService } from "@/services/studioService";
import type { Dashboard } from "@/types/studio";

const dashboard = ref<Dashboard>({ account: null, orders: [], novels: [] });
const initialized = ref(false);
export const refreshDashboard = async () => {
  dashboard.value = await studioService.getDashboard();
  initialized.value = true;
};
export const useStudio = () => ({
  dashboard,
  initialized,
  account: computed(() => dashboard.value.account),
  isBound: computed(() => !!dashboard.value.account),
  refresh: refreshDashboard,
});
