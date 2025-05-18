import { supabase } from "@/lib/supabase";
import { decode } from "base64-arraybuffer";

export async function uploadImageToSupabase(
  uri: string,
  bucket: string,
  path: string
): Promise<string> {
  try {
    // Fetch the image data from the local URI
    const response = await fetch(uri);
    const blob = await response.blob();

    // Convert blob to base64
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve) => {
      reader.onloadend = () => {
        const base64data = reader.result as string;
        // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
        resolve(base64data.split(",")[1]);
      };
    });
    reader.readAsDataURL(blob);
    const base64Data = await base64Promise;

    // Upload to Supabase Storage
    const fileName = `${Date.now()}.jpg`;
    const filePath = `${path}/${fileName}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, decode(base64Data), {
        contentType: "image/jpeg",
        upsert: false,
      });

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error("Upload successful but no data returned");
    }

    // Get the public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}
