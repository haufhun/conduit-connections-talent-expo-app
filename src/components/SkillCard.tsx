import { Image } from "expo-image";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { HStack } from "@/components/ui/hstack";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import type { TalentSkill } from "@/types/skills";

interface SkillCardProps {
  talentSkill: TalentSkill;
  onPress?: () => void;
}

export function SkillCard({ talentSkill, onPress }: SkillCardProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      disabled={!onPress}
    >
      <HStack space="md" className="items-center">
        <View style={styles.imageContainer}>
          <Image
            source={
              talentSkill.skill?.image_url
                ? { uri: talentSkill.skill.image_url }
                : require("@/assets/images/icon.png")
            }
            style={styles.image}
            contentFit="cover"
          />
        </View>

        <VStack space="xs" style={styles.content}>
          <HStack className="items-center justify-between">
            <Text size="lg" bold className="text-typography-900">
              {talentSkill.skill?.name}
            </Text>
            {onPress && (
              <IconSymbol name="chevron.right" size={20} color="#666" />
            )}
          </HStack>

          {talentSkill.years_of_experience > 0 && (
            <Text size="sm" className="text-typography-500">
              {talentSkill.years_of_experience}{" "}
              {talentSkill.years_of_experience === 1 ? "year" : "years"} of
              experience
            </Text>
          )}

          {talentSkill.summary && (
            <Text
              size="sm"
              className="text-typography-700"
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {talentSkill.summary}
            </Text>
          )}

          {talentSkill.image_urls.length > 0 && (
            <HStack space="xs" className="mt-2">
              {talentSkill.image_urls.slice(0, 3).map((url, index) => (
                <View key={index} style={styles.thumbnailContainer}>
                  <Image
                    source={{ uri: url }}
                    style={styles.thumbnail}
                    contentFit="cover"
                  />
                </View>
              ))}
              {talentSkill.image_urls.length > 3 && (
                <View style={[styles.thumbnailContainer, styles.moreContainer]}>
                  <Text size="sm" bold className="text-typography-0">
                    +{talentSkill.image_urls.length - 3}
                  </Text>
                </View>
              )}
            </HStack>
          )}
        </VStack>
      </HStack>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  imageContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  content: {
    flex: 1,
  },
  thumbnailContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  moreContainer: {
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
});
