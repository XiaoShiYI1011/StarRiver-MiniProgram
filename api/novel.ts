import { request } from "@/utils/request";
import type { PageResult } from "@/types/api";
import type { NovelInfo } from "@/types/novel";

const prefix = "/api/assistant/v1/Novel";

export const novelApi = {
  queryList: (params: { pageIndex?: number; pageSize?: number; keyword?: string; sort?: string }) =>
    request<PageResult<NovelInfo>>({ url: `${prefix}/QueryNovelList`, method: "GET", params }),
};
