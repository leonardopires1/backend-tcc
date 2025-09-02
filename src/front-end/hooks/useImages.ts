import * as ImagePicker from "expo-image-picker";

export interface ImageFile {
  uri: string;
  name: string;
  type: string;
}

interface UseImagesReturn {
  uploadFile: (moradiaId: number) => Promise<void>;
}

export const useImages = (moradiaId: number): UseImagesReturn => {
  const uploadFile = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const formData = new FormData();
      formData.append("file", {
        uri: asset.uri,
        name: asset.fileName || "image.jpg",
        type: asset.type || "image/jpeg",
      } as any);
      const response = await fetch(`/moradias/upload-image/${moradiaId}`, {
        method: "POST",
        body: formData,
      });
      return response.json();
    }
  };

  return {
    uploadFile,
  };
};
