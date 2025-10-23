import { useGetSkills, useGetUserTalentSkills } from "@/api/api";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Skill } from "@/types/skills";
import { useRouter } from "expo-router";
import { ChevronRightIcon, SearchIcon } from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SkillSelectScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: skills, error, isLoading } = useGetSkills();
  const { data: userSkills } = useGetUserTalentSkills();

  const filteredSkills = useMemo(() => {
    if (!skills) return [];
    return skills.filter(
      (skill) =>
        !userSkills?.some((userSkill) => userSkill.skill_id === skill.id) &&
        skill.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [skills, userSkills, searchQuery]);

  const handleSkillSelect = (skill: Skill) => {
    // Navigate back with the selected skill parameters
    router.navigate({
      pathname: "/profile/skill/create",
      params: {
        selectedSkillId: skill.id.toString(),
        selectedSkillName: skill.name,
      },
    });
  };

  const renderSkillItem = (skill: Skill) => (
    <TouchableOpacity
      onPress={() => handleSkillSelect(skill)}
      style={styles.skillItem}
      activeOpacity={0.7}
    >
      <View className="bg-white rounded-xl p-4 border border-outline-200 shadow-sm">
        <HStack className="justify-between items-center">
          <Text className="text-typography-900 font-medium text-base flex-1">
            {skill.name}
          </Text>
          <Icon
            as={ChevronRightIcon}
            size="md"
            className="text-typography-400"
          />
        </HStack>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyComponent = () => (
    <View className="bg-white rounded-xl p-8 border border-outline-200 shadow-sm">
      <VStack space="sm" className="items-center">
        <Icon as={SearchIcon} size="xl" className="text-outline-400" />
        <Text className="text-center text-typography-500 font-medium">
          {searchQuery
            ? "No skills found matching your search"
            : "No available skills"}
        </Text>
        {searchQuery && (
          <Text size="sm" className="text-center text-typography-400">
            Try adjusting your search terms
          </Text>
        )}
      </VStack>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background-0 justify-center items-center">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (error || !skills) {
    return (
      <SafeAreaView className="flex-1 bg-background-0 justify-center items-center">
        <View className="bg-white rounded-xl p-6 border border-error-200 shadow-sm mx-6">
          <Text className="text-error-600 text-center font-medium">
            Error: {error?.message || "Failed to fetch skills"}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-background-0">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <VStack space="lg" className="p-6">
          {/* Header Card */}
          <VStack
            space="sm"
            className="bg-white rounded-2xl p-6 border border-primary-200 shadow-sm"
          >
            <Text size="xl" bold className="text-typography-900">
              Select a Skill
            </Text>
            <Text className="text-typography-600">
              Search and select a skill from the list below
            </Text>
          </VStack>

          {/* Search Input Card */}
          <VStack
            space="md"
            className="bg-white rounded-2xl p-6 border border-outline-200 shadow-sm"
          >
            <HStack space="sm" className="items-center mb-2">
              <Icon as={SearchIcon} size="md" className="text-tertiary-500" />
              <Text size="lg" className="font-semibold text-typography-900">
                Search Skills
              </Text>
            </HStack>
            <Input size="lg" variant="outline" className="bg-background-50">
              <InputField
                placeholder="Type to search..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
            </Input>
          </VStack>

          {/* Skills List */}
          {filteredSkills.length > 0 ? (
            <VStack space="sm">
              {filteredSkills.map((skill) => (
                <View key={skill.id}>{renderSkillItem(skill)}</View>
              ))}
            </VStack>
          ) : (
            renderEmptyComponent()
          )}
        </VStack>

        {/* Bottom padding */}
        <VStack className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  skillItem: {
    // No additional styles needed
  },
});
