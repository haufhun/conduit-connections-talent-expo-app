import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { MinusCircle } from "lucide-react-native";
import { useCallback, useEffect } from "react";
import { Alert, Dimensions, Pressable, StyleSheet, View } from "react-native";
import {
  GestureDetector,
  Gesture,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
  runOnJS,
} from "react-native-reanimated";

interface PortfolioImageProps {
  url: string;
  index: number;
  onDelete: (index: number) => void;
  onReorder: (draggedIndex: number, droppedIndex: number) => void;
  isEditing: boolean;
}

const SPRING_CONFIG = {
  damping: 20,
  stiffness: 200,
};

export default function PortfolioImage({
  url,
  index,
  onDelete,
  onReorder,
  isEditing,
}: PortfolioImageProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const zIndex = useSharedValue(0);
  const opacity = useSharedValue(1);

  // Animation for editing mode shake effect
  const rotation = useSharedValue(0);
  
  useEffect(() => {
    if (isEditing) {
      rotation.value = withSequence(
        withTiming(-0.05, { duration: 100 }),
        withRepeat(
          withSequence(
            withTiming(0.05, { duration: 100 }),
            withTiming(-0.05, { duration: 100 })
          ),
          -1,
          true
        )
      );
    } else {
      rotation.value = withTiming(0, { duration: 100 });
    }
  }, [isEditing, rotation]);

  const dragGesture = Gesture.Pan()
    .enabled(isEditing)
    .onStart(() => {
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
      scale.value = withSpring(1.1, SPRING_CONFIG);
      zIndex.value = 1000;
      opacity.value = withSpring(0.8);
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      const dropPointX = event.absoluteX;
      
      // Calculate the new index based on the drop position
      const newIndex = Math.floor(dropPointX / (100 + 8)); // 100 is image width, 8 is gap
      
      if (newIndex !== index && newIndex >= 0) {
        runOnJS(onReorder)(index, newIndex);
      }

      translateX.value = withSpring(0, SPRING_CONFIG);
      translateY.value = withSpring(0, SPRING_CONFIG);
      scale.value = withSpring(1, SPRING_CONFIG);
      zIndex.value = 0;
      opacity.value = withSpring(1);
    });

  const rStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
        { rotateZ: `${rotation.value}rad` },
      ],
      zIndex: zIndex.value,
      opacity: opacity.value,
    };
  });

  const handleDelete = useCallback(() => {
    Alert.alert("Delete Image", "Are you sure you want to delete this image?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          onDelete(index);
        },
      },
    ]);
  }, [index, onDelete]);

  return (
    <GestureHandlerRootView>
      <GestureDetector gesture={dragGesture}>
        <Reanimated.View style={[styles.container, rStyle]}>
          <View style={styles.imageContainer}>
            <Image source={{ uri: url }} style={styles.image} contentFit="cover" />
            {isEditing && (
              <Pressable 
                onPress={handleDelete}
                style={styles.deleteButton}
              >
                <MinusCircle size={24} color="#FF3B30" style={styles.deleteIcon} />
              </Pressable>
            )}
          </View>
        </Reanimated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 100,
    height: 100,
    marginBottom: 8,
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
    position: 'absolute',
    top: -8,
    left: -8,
    padding: 4,
  },
  deleteIcon: {
    backgroundColor: 'white',
    borderRadius: 12,
  },
});
