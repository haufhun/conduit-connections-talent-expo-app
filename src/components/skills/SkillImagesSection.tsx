import FilePickerActionSheet from "@/components/FilePickerActionSheet";
import SkillImagesInfoModal from "@/components/skills/SkillImagesInfoModal";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HStack } from "@/components/ui/hstack";
import { AddIcon, EditIcon, Icon } from "@/components/ui/icon";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { BrandColors } from "@/constants/BrandColors";
import { SKILL_IMAGES_BUCKET } from "@/constants/Supabase";
import type { TalentSkill } from "@/types/skills";
import { uploadFileToSupabase } from "@/utils/storage";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import * as ImageManipulator from "expo-image-manipulator";
import { ImageIcon, MinusCircleIcon } from "lucide-react-native";
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
  skill: TalentSkill;
  userId: string;
  onUpdateSkill: (updates: Partial<TalentSkill>) => Promise<void>;
}

type ImageItem = {
  key: string;
  url: string;
};

export default function SkillImagesSection({
  skill,
  userId,
  onUpdateSkill,
}: SkillImagesSectionProps) {
  const [showActionsheet, setShowActionsheet] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [infoModalVisible, setInfoModalVisible] = useState(false);

  // Convert image URLs to items with keys for DraggableFlatList
  const imageItems = skill.image_urls.map((url) => ({
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
        `users/${userId}/skills/${skill.id}`,
        fileOptions
      );

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
            const newUrls = skill.image_urls.filter((u) => u !== url);
            await onUpdateSkill({ image_urls: newUrls });
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
    <Card className="p-4 bg-background-0 border-outline-100 rounded-lg">
      <VStack space="md">
        <HStack className="justify-between items-center">
          <HStack space="sm" className="items-center">
            <Icon as={ImageIcon} size="md" className="text-tertiary-500" />
            <Text size="lg" className="font-semibold text-typography-900">
              Portfolio Images
            </Text>
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
          </HStack>
          <Button
            variant="outline"
            size="sm"
            onPress={() => setIsEditing(!isEditing)}
            className="border-primary-300 bg-primary-50"
          >
            <ButtonIcon as={EditIcon} size="sm" className="text-primary-600" />
            <ButtonText className="text-primary-600 ml-1">
              {isEditing ? "Done" : "Edit"}
            </ButtonText>
          </Button>
        </HStack>

        {skill.image_urls.length === 0 ? (
          <View className="py-8 px-4 bg-background-50 rounded-lg border-2 border-dashed border-outline-200">
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
          <View style={styles.listContainer}>
            <DraggableFlatList
              data={imageItems}
              onDragEnd={({ data }) => {
                const newUrls = data.map((item) => item.url);
                onUpdateSkill({ image_urls: newUrls });
              }}
              keyExtractor={(item) => item.key}
              renderItem={renderImage}
              horizontal
              contentContainerStyle={styles.listContent}
            />

            {!isEditing && skill.image_urls.length < 5 && (
              <Button
                variant="outline"
                onPress={handleAdd}
                style={styles.addImageButton}
                className="items-center justify-center border-2 border-dashed border-primary-300 bg-primary-50"
              >
                <VStack space="xs" className="items-center">
                  <ButtonIcon
                    as={AddIcon}
                    size="xl"
                    className="text-primary-600"
                  />
                  <ButtonText className="text-primary-600 text-xs">
                    Add Item
                  </ButtonText>
                </VStack>
              </Button>
            )}
          </View>
        )}
      </VStack>

      <FilePickerActionSheet
        supportedImageTypes={["image/jpeg", "image/png", "image/heic"]}
        showActionsheet={showActionsheet}
        setShowActionsheet={setShowActionsheet}
        handleFileUpload={handleImageFileUpload}
      />

      <SkillImagesInfoModal
        isOpen={infoModalVisible}
        onClose={() => setInfoModalVisible(false)}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: 4,
    gap: 8,
  },
  container: {
    width: 100,
    height: 100,
    marginTop: 8,
    marginBottom: 8,
    marginLeft: 4,
  },
  imageWrapper: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  imageContainer: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
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
    borderRadius: 8,
    marginLeft: 8,
  },
});
