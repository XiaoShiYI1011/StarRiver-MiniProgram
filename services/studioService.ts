import { mockStudioService } from "./mockStudioService";
import type { StudioService } from "@/types/studio";

// 确认原型效果后，在此处替换为 HTTP 适配器，页面无需读取 mocks。
export const studioService: StudioService = mockStudioService;
