import * as ImagemPicker from "expo-image-picker";

export class imagesService {
  private image: string | null = null;

  private uploadImage = async (file: File, moradiaId: string) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(`/moradias/upload-image/${moradiaId}`, {
      method: "POST",
      body: formData,
    });
    return response.json();
  };
}
