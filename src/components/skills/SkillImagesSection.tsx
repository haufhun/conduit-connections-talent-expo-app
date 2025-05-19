import FilePickerActionSheet from "@/components/FilePickerActionSheet";
import PortfolioImage from "@/components/PortfolioImage";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { AddIcon, EditIcon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { SKILL_IMAGES_BUCKET } from "@/constants/Supabase";
import type { TalentSkill } from "@/types/skills";
import { uploadFileToSupabase } from "@/utils/storage";
import * as ImageManipulator from "expo-image-manipulator";
import { useState } from "react";
import { Alert, StyleSheet } from "react-native";

interface SkillImagesSectionProps {
  skill: TalentSkill;
  userId: string;
  onUpdateSkill: (updates: Partial<TalentSkill>) => Promise<void>;
}

export default function SkillImagesSection({
  skill,
  userId,
  onUpdateSkill,
}: SkillImagesSectionProps) {
  const [showActionsheet, setShowActionsheet] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleImageFileUpload = async (uri: string, contentType: string) => {
    try {
      let fileOptions = {
        contentType,
        fileExtension: "jpg",
      };

      // If it's an image, compress it
      const compressedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1080 } }],
        {
          compress: 0.7,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      // Upload file to Supabase
      const fileUrl = await uploadFileToSupabase(
        compressedImage.uri,
        SKILL_IMAGES_BUCKET,
        `users/${userId}/skills/${skill.id}`,
        fileOptions
      );

      // Update the skill with the new URL
      const updatedUrls = [...skill.image_urls, fileUrl];
      await onUpdateSkill({ image_urls: updatedUrls });
    } catch (error) {
      console.error("Error uploading file:", error);
      Alert.alert("Error", "Failed to upload file");
    }
  };

  const handleAdd = () => {
    if (skill.image_urls.length >= 5) {
      Alert.alert("Maximum Files", "You can only add up to 5 portfolio items.");
      return;
    }
    setShowActionsheet(true);
  };

  const handleDeleteImage = async (index: number) => {
    try {
      const newUrls = [...skill.image_urls];
      newUrls.splice(index, 1);
      await onUpdateSkill({ image_urls: newUrls });
    } catch (error) {
      console.error("Error deleting image:", error);
      Alert.alert("Error", "Failed to delete image");
    }
  };

  const handleReorderImages = async (fromIndex: number, toIndex: number) => {
    try {
      const newUrls = [...skill.image_urls];
      const [movedItem] = newUrls.splice(fromIndex, 1);
      newUrls.splice(toIndex, 0, movedItem);
      await onUpdateSkill({ image_urls: newUrls });
    } catch (error) {
      console.error("Error reordering images:", error);
      Alert.alert("Error", "Failed to reorder images");
    }
  };

  return (
    <VStack space="xs" style={styles.section}>
      <HStack className="justify-between items-center">
        <Text bold className="text-typography-700">
          Images
        </Text>
        <Button
          variant="link"
          onPress={() => setIsEditing(!isEditing)}
          className="p-0"
        >
          <HStack space="xs" className="items-center">
            <ButtonIcon as={EditIcon} />
            <ButtonText>{isEditing ? "Done" : "Edit"}</ButtonText>
          </HStack>
        </Button>
      </HStack>
      <HStack space="sm" style={styles.imagesGrid}>
        {skill.image_urls.map((url, index) => (
          <PortfolioImage
            key={url}
            url={url}
            index={index}
            onDelete={handleDeleteImage}
            onReorder={handleReorderImages}
            isEditing={isEditing}
          />
        ))}
        {!isEditing && skill.image_urls.length < 5 && (
          <Button
            variant="outline"
            onPress={handleAdd}
            style={styles.addImageButton}
            className="items-center justify-center border-2 border-dashed border-opacity-75 border-typography-500 bg-white"
          >
            <VStack space="xs" className="items-center">
              <ButtonIcon
                as={AddIcon}
                size="xl"
                className="text-typography-300"
              />
              <ButtonText className="text-typography-300">Add Item</ButtonText>
            </VStack>
          </Button>
        )}
      </HStack>
      {skill.image_urls.length === 0 && (
        <Text className="text-typography-500 italic">No images added</Text>
      )}

      <FilePickerActionSheet
        supportedImageTypes={["image/jpeg", "image/png", "image/heic"]}
        showActionsheet={showActionsheet}
        setShowActionsheet={setShowActionsheet}
        handleFileUpload={handleImageFileUpload}
      />
    </VStack>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  imagesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
});
