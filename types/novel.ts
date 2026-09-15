/** 与后端 NovelVo 保持同构。 */
export interface NovelInfo {
  id: string;
  title: string;
  description: string | null;
  cover: string | null;
  genre: string | null;
  /** 1 连载中 / 2 完结 / 3 下架，以 NovelStatusEnum 为准；列表页不展示。 */
  status: number;
  chapterCount: number;
  wordCount: number;
  lastChapterId: string | null;
  editVersion: number;
  createdAt: string;
  updatedAt: string;
}
