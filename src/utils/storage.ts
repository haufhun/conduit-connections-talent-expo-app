import { supabase } from "@/lib/supabase";
import { decode } from "base64-arraybuffer";

interface UploadFileOptions {
  contentType?: string;
  filename?: string;
  fileExtension?: string;
}

export async function uploadFileToSupabase(
  uri: string,
  bucket: string,
  path: string,
  options: UploadFileOptions = {}
): Promise<string> {
  try {
    // Fetch the file data from the URI
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
    const extension = options.fileExtension || "jpg";
    const fileName = options.filename || `${Date.now()}.${extension}`;
    const filePath = `${path}/${fileName}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, decode(base64Data), {
        contentType: options.contentType || "image/jpeg",
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

export async function deleteFileFromSupabase(
  bucket: string,
  filePath: string
): Promise<void> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([filePath]);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
}

export function extractFilePathFromUrl(
  publicUrl: string,
  bucket: string
): string | null {
  try {
    // Extract the file path from the public URL
    // Public URLs typically look like: https://project.supabase.co/storage/v1/object/public/bucket/path/to/file
    const url = new URL(publicUrl);
    const pathParts = url.pathname.split("/");

    // Find the bucket name in the path and get everything after it
    const bucketIndex = pathParts.indexOf(bucket);
    if (bucketIndex === -1 || bucketIndex === pathParts.length - 1) {
      return null;
    }

    // Join all parts after the bucket name to get the file path
    const filePath = pathParts.slice(bucketIndex + 1).join("/");
    return filePath || null;
  } catch (error) {
    console.error("Error extracting file path from URL:", error);
    return null;
  }
}
