/** 用户协议、隐私政策共用的法律文书结构。 */
export interface LegalDocument {
  title: string;
  version: string;
  revisedAt: string;
  effectiveAt: string;
  /** 正文前的导语，如主体说明与特别提示。 */
  intro: string[];
  /** 章标题下按条列出的正文；同一章内相邻的“第X条　定义”与其子项各占一段。 */
  chapters: Array<{ title: string; clauses: string[] }>;
}
