export type JournalIssue = {
  _id: string;
  journalId: string;
  issueLabel: string;
  title: string;
  description: string;
  pdfs: {
    _id: string;
    title: string;
    pdfUrl: string;
    created_at: string;
  }[];
  created_at: string;
  updated_at: string;
};

export type CreateIssueInput = {
  journalId: string;
  issueLabel: string;
};
