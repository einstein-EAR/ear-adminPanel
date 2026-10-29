export type PublicationEthics = {
  _id: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export const EMPTY_PUBLICATION_ETHICS: PublicationEthics = {
  _id: "",
  content: "",
  created_at: "",
  updated_at: "",
};

export type UpdatePublicationEthicsInput = {
  content: string;
};
