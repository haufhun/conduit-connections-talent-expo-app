import { Image } from "expo-image";
import { TouchableOpacity, View } from "react-native";

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
      className="p-4 bg-white rounded-xl border border-black/10"
      onPress={onPress}
      disabled={!onPress}
    >
      <HStack space="md" className="items-center">
        <View className="w-14 h-14 rounded-full overflow-hidden bg-secondary-100">
          <Image
            source={
              talentSkill.skill?.image_url
                ? { uri: talentSkill.skill.image_url }
                : require("@/assets/images/icon.png")
            }
            style={{
              width: "100%",
              height: "100%",
            }}
            contentFit="cover"
          />
        </View>

        <VStack space="xs" className="flex-1">
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
                <View
                  key={index}
                  className="w-12 h-12 rounded-lg overflow-hidden bg-secondary-100"
                >
                  <Image
                    source={{ uri: url }}
                    style={{
                      width: "100%",
                      height: "100%",
                    }}
                    contentFit="cover"
                  />
                </View>
              ))}
              {talentSkill.image_urls.length > 3 && (
                <View className="w-12 h-12 rounded-lg overflow-hidden bg-primary-500/50 justify-center items-center">
                  <Text size="sm" bold className="text-white">
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
