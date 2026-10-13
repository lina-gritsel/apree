// Input shape shared by HTTP validation and file decoding; no persistence or framework types.
export interface AttachmentInput {
  id?: string;
  name?: string;
  contentType?: string;
  dataBase64?: string;
}
