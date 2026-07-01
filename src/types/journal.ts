export type Journal = {
  _id: string;
  title: string;
  description: string;
  serialNumber: string;
  imageUrl: string;
  issues: unknown[];
  created_at: string;
  updated_at: string;
};

export type CreateJournalInput = {
  title: string;
  description: string;
  serialNumber: string;
  image: File;
};
