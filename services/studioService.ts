import { mockStudioService } from "./mockStudioService";
import { miniStudioService } from "./miniStudioService";
import { isWeChatAuth } from "@/config/api";
import type { StudioService } from "@/types/studio";

// 微信使用真实身份；H5 保持明确标注的原型预览。业务权益仍是本地演示。
export const studioService: StudioService = isWeChatAuth ? miniStudioService : mockStudioService;
