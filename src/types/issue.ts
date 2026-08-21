export type IssuePdf = {
  _id: string;
  title: string;
  author: string;
  doi: string;
  pdfUrl: string;
  created_at: string;
};

export type JournalIssue = {
  _id: string;
  journalId: string;
  issueLabel: string;
  title: string;
  description: string;
  pdfs: IssuePdf[];
  created_at: string;
  updated_at: string;
};

export type CreateIssueInput = {
  journalId: string;
  issueLabel: string;
  description: string;
};

export type UpdateIssueInput = {
  issueId: string;
  journalId: string;
  issueLabel: string;
  description: string;
};

export type UploadIssuePdfsInput = {
  issueId: string;
  title: string;
  author: string;
  doi: string;
  files: File[];
};

export type UpdateIssuePdfInput = {
  pdfId: string;
  issueId: string;
  title: string;
  author: string;
  doi: string;
  file?: File | null;
};

export type DeleteIssuePdfInput = {
  pdfId: string;
  issueId: string;
};
