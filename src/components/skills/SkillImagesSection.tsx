import FilePickerActionSheet from "@/components/FilePickerActionSheet";
import SkillImagesInfoModal from "@/components/skills/SkillImagesInfoModal";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";

import { HStack } from "@/components/ui/hstack";
import { AddIcon, EditIcon, Icon } from "@/components/ui/icon";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { BrandColors } from "@/constants/BrandColors";
import { SKILL_IMAGES_BUCKET } from "@/constants/Supabase";
import type { TalentSkill } from "@/types/skills";
import {
  deleteFileFromSupabase,
  extractFilePathFromUrl,
  uploadFileToSupabase,
} from "@/utils/storage";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import * as ImageManipulator from "expo-image-manipulator";
import {
  AlertCircleIcon,
  ImageIcon,
  MinusCircleIcon,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

interface SkillImagesSectionProps {
  skill?: TalentSkill;
  userId: string;
  imageUrls: string[];
  onUpdateImageUrls: (urls: string[]) => void | Promise<void>;
  showEditControls?: boolean;
  mode?: "create" | "edit";
  error?: string;
}

type ImageItem = {
  key: string;
  url: string;
};

export default function SkillImagesSection({
  skill,
  userId,
  imageUrls,
  onUpdateImageUrls,
  showEditControls = true,
  mode = "edit",
  error,
}: SkillImagesSectionProps) {
  const [showActionsheet, setShowActionsheet] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [infoModalVisible, setInfoModalVisible] = useState(false);

  // Convert image URLs to items with keys for DraggableFlatList
  const imageItems = imageUrls.map((url) => ({
    key: url,
    url,
  }));

  const rotation = useSharedValue(0);

  useEffect(() => {
    if (isEditing) {
      rotation.value = withSequence(
        withTiming(-0.02, { duration: 200 }),
        withRepeat(
          withSequence(
            withTiming(0.02, { duration: 200 }),
            withTiming(-0.02, { duration: 200 })
          ),
          -1,
          true
        )
      );
    } else {
      rotation.value = withTiming(0, { duration: 200 });
    }
  }, [isEditing, rotation]);

  const shakeAnimation = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: 0 },
        { translateY: 0 },
        { scale: 1 },
        { rotateZ: `${rotation.value}rad` },
      ],
    };
  });

  const handleImageFileUpload = async (uri: string, contentType: string) => {
    try {
      let fileOptions = {
        contentType,
        fileExtension: "jpg",
      };

      const compressedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1080 } }],
        {
          compress: 0.7,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      const fileUrl = await uploadFileToSupabase(
        compressedImage.uri,
        SKILL_IMAGES_BUCKET,
        `users/${userId}/skills${skill?.id ? `/${skill.id}` : ""}`,
        fileOptions
      );

      const updatedUrls = [...imageUrls, fileUrl];
      await onUpdateImageUrls(updatedUrls);
    } catch (error) {
      console.error("Error uploading file:", error);
      Alert.alert("Error", "Failed to upload file");
    }
  };

  const handleAdd = () => {
    if (imageUrls.length >= 5) {
      Alert.alert("Maximum Files", "You can only add up to 5 portfolio items.");
      return;
    }
    setShowActionsheet(true);
  };

  const handleDeleteImage = async (url: string) => {
    Alert.alert("Delete Image", "Are you sure you want to delete this image?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Success
            );

            // Extract the file path from the URL and delete from Supabase storage
            const filePath = extractFilePathFromUrl(url, SKILL_IMAGES_BUCKET);
            if (filePath) {
              try {
                await deleteFileFromSupabase(SKILL_IMAGES_BUCKET, filePath);
              } catch (storageError) {
                console.warn(
                  "Failed to delete file from storage:",
                  storageError
                );
                // Continue with URL removal even if storage deletion fails
                // This prevents orphaned references in the database
              }
            }

            // Remove the URL from the array and update
            const newUrls = imageUrls.filter((u) => u !== url);
            await onUpdateImageUrls(newUrls);
          } catch (error) {
            console.error("Error deleting image:", error);
            Alert.alert("Error", "Failed to delete image");
          }
        },
      },
    ]);
  };

  const renderImage = ({
    item,
    drag,
    isActive,
  }: RenderItemParams<ImageItem>) => {
    return (
      <ScaleDecorator>
        <Animated.View style={[styles.container, shakeAnimation]}>
          <Pressable
            onLongPress={() => {
              if (isEditing) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                drag();
              }
            }}
            disabled={!isEditing || isActive}
          >
            <View style={styles.imageWrapper}>
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: item.url }}
                  style={styles.image}
                  contentFit="cover"
                />
              </View>
              {isEditing && (
                <Pressable
                  onPress={() => handleDeleteImage(item.url)}
                  style={styles.deleteButton}
                  hitSlop={8}
                >
                  <Icon
                    as={MinusCircleIcon}
                    size="xl"
                    color="#FF3B30"
                    style={styles.deleteIcon}
                  />
                </Pressable>
              )}
            </View>
          </Pressable>
        </Animated.View>
      </ScaleDecorator>
    );
  };

  return (
    <>
      <VStack
        space="md"
        className="bg-white rounded-2xl p-6 border border-outline-200 shadow-sm"
      >
        <HStack className="justify-between items-center">
          <HStack space="sm" className="items-center">
            <Icon as={ImageIcon} size="md" className="text-tertiary-500" />
            <Text size="lg" className="font-semibold text-typography-900">
              Portfolio Images
            </Text>
            {showEditControls && (
              <TouchableOpacity
                onPress={() => setInfoModalVisible(true)}
                className="w-7 h-7 rounded-full bg-info-50 items-center justify-center border border-info-200"
              >
                <IconSymbol
                  name="questionmark.circle.fill"
                  size={16}
                  color={BrandColors.INFO}
                />
              </TouchableOpacity>
            )}
          </HStack>
          {showEditControls && (
            <Button
              variant="outline"
              size="sm"
              onPress={() => setIsEditing(!isEditing)}
              className="border-primary-300 bg-primary-50"
            >
              <ButtonIcon
                as={EditIcon}
                size="sm"
                className="text-primary-600"
              />
              <ButtonText className="text-primary-600 ml-1">
                {isEditing ? "Done" : "Edit"}
              </ButtonText>
            </Button>
          )}
        </HStack>

        {!showEditControls && (
          <Text className="text-typography-600 mb-2">
            Add up to 5 images showcasing your work
          </Text>
        )}

        {error && mode === "create" && (
          <HStack space="xs" className="items-center">
            <Icon as={AlertCircleIcon} size="sm" className="text-error-600" />
            <Text size="sm" className="text-error-600">
              {error}
            </Text>
          </HStack>
        )}

        {imageUrls.length === 0 ? (
          <View className="py-8 px-4 bg-background-50 rounded-xl border-2 border-dashed border-outline-200">
            <VStack space="sm" className="items-center">
              <Icon as={ImageIcon} size="xl" className="text-outline-400" />
              <Text className="text-typography-500 text-center">
                No portfolio images added yet
              </Text>
              <Text size="sm" className="text-typography-400 text-center">
                Add up to 5 images to showcase your work
              </Text>
              <Button
                variant="solid"
                action="primary"
                onPress={handleAdd}
                className="mt-2 bg-primary-600"
              >
                <ButtonIcon as={AddIcon} size="sm" className="text-white" />
                <ButtonText className="text-white ml-1">Add Images</ButtonText>
              </Button>
            </VStack>
          </View>
        ) : (
          <VStack space="md" className="bg-background-50 p-4 rounded-xl">
            <View style={styles.listContainer}>
              <DraggableFlatList
                data={imageItems}
                onDragEnd={({ data }) => {
                  const newUrls = data.map((item) => item.url);
                  onUpdateImageUrls(newUrls);
                }}
                keyExtractor={(item) => item.key}
                renderItem={renderImage}
                horizontal
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={
                  !isEditing && imageUrls.length < 5 ? (
                    <View style={styles.container}>
                      <Button
                        variant="outline"
                        onPress={handleAdd}
                        style={styles.addImageButton}
                        className="items-center justify-center border-2 border-dashed border-primary-300 bg-white"
                      >
                        <VStack space="xs" className="items-center">
                          <ButtonIcon
                            as={AddIcon}
                            size="xl"
                            className="text-primary-600"
                          />
                          <ButtonText className="text-primary-600 text-xs">
                            Add Image
                          </ButtonText>
                        </VStack>
                      </Button>
                    </View>
                  ) : null
                }
              />
            </View>
          </VStack>
        )}
      </VStack>

      <FilePickerActionSheet
        supportedImageTypes={["image/jpeg", "image/png", "image/heic"]}
        showActionsheet={showActionsheet}
        setShowActionsheet={setShowActionsheet}
        handleFileUpload={handleImageFileUpload}
      />

      {showEditControls && (
        <SkillImagesInfoModal
          isOpen={infoModalVisible}
          onClose={() => setInfoModalVisible(false)}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: 8,
    gap: 8,
  },
  container: {
    width: 100,
    height: 100,
    marginTop: 8,
    marginBottom: 8,
    marginRight: 4,
  },
  imageWrapper: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  imageContainer: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  deleteButton: {
    position: "absolute",
    top: -12,
    left: -12,
    padding: 4,
    zIndex: 1,
  },
  deleteIcon: {
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
});
