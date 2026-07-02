import apiClient from "../../api/client";
import type {
  UploadPdfResponse,
  GetPdfsResponse,
  GetPdfPagesResponse,
  ExtractPdfResponse,
  GetGeneratedPdfsResponse,
} from "../../types/upload.pdf.type";

export const PdfService = {
  async uploadPdf(file: File): Promise<UploadPdfResponse> {
    const formData = new FormData();
    formData.append("pdf", file);
    const { data } = await apiClient.post<UploadPdfResponse>("/users/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  async getPdfs(): Promise<GetPdfsResponse> {
    const { data } = await apiClient.get<GetPdfsResponse>("/users/pdfs");
    return data;
  },

  async getPdfPages(id: string): Promise<GetPdfPagesResponse> {
    const { data } = await apiClient.get<GetPdfPagesResponse>(`/users/pdfs/${id}/pages`);
    return data;
  },

  async extractPages(id: string, selectedPages: number[]): Promise<ExtractPdfResponse> {
    const { data } = await apiClient.post<ExtractPdfResponse>(
      `/users/pdfs/${id}/extract`,
      { selectedPages },
    );
    return data;
  },

  async getGeneratedPdfs(): Promise<GetGeneratedPdfsResponse> {
    const { data } = await apiClient.get<GetGeneratedPdfsResponse>("/users/generated-pdfs");
    return data;
  },

  async deletePdf(id:string){
    const {data} = await apiClient.delete(`/users/pdfs/${id}`)

    return data
  },

  async deleteGeneratedPdf(id: string) {
    const { data } = await apiClient.delete(`/users/generated-pdfs/${id}`);
    return data;
  }
};

export default PdfService;
