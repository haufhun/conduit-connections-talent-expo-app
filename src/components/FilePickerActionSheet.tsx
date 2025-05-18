import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetItem,
} from "@/components/ui/actionsheet";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { Camera, FileArchive, ImagesIcon } from "lucide-react-native";
import React from "react";
import { Alert } from "react-native";

type Props = {
  supportedImageTypes?: ("image/jpeg" | "image/png" | "image/heic")[];
  supportedFileTypes?: (
    | "application/pdf"
    | "application/msword"
    | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  )[];
  handleFileUpload: (uri: string, contentType: string) => void;
  showActionsheet: boolean;
  setShowActionsheet: (show: boolean) => void;
};

const FilePickerActionSheet = ({
  supportedImageTypes,
  supportedFileTypes,
  handleFileUpload,
  showActionsheet,
  setShowActionsheet,
}: Props) => {
  const handleTakePhoto = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow access to your camera to take photos."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        await handleFileUpload(result.assets[0].uri, "image/jpeg");
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo");
    }
    setShowActionsheet(false);
  };

  const handleChoosePhoto = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photo library."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        await handleFileUpload(result.assets[0].uri, "image/jpeg");
      }
    } catch (error) {
      console.error("Error picking photo:", error);
      Alert.alert("Error", "Failed to pick photo");
    }
    setShowActionsheet(false);
  };

  const handleChooseFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [...(supportedImageTypes || []), ...(supportedFileTypes || [])],
      });

      if (result.assets && result.assets.length > 0) {
        await handleFileUpload(
          result.assets[0].uri,
          result.assets[0].mimeType || "application/octet-stream"
        );
      }
    } catch (error) {
      console.error("Error picking file:", error);
      Alert.alert("Error", "Failed to pick file");
    }
    setShowActionsheet(false);
  };

  return (
    <>
      <Actionsheet
        isOpen={showActionsheet}
        onClose={() => setShowActionsheet(false)}
      >
        <ActionsheetBackdrop />
        <ActionsheetContent>
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          <ActionsheetItem onPress={handleTakePhoto}>
            <HStack space="sm" className="items-center">
              <Icon as={Camera} size="lg" />
              <Text>Take Photo</Text>
            </HStack>
          </ActionsheetItem>
          <ActionsheetItem onPress={handleChoosePhoto}>
            <HStack space="sm" className="items-center">
              <Icon as={ImagesIcon} size="lg" />
              <Text>Choose from Library</Text>
            </HStack>
          </ActionsheetItem>
          <ActionsheetItem onPress={handleChooseFile}>
            <HStack space="sm" className="items-center">
              <Icon as={FileArchive} size="lg" />
              <Text>Choose File</Text>
            </HStack>
          </ActionsheetItem>
        </ActionsheetContent>
      </Actionsheet>
    </>
  );
};

export default FilePickerActionSheet;
