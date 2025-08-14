import { useGetSkills, useGetUserTalentSkills } from "@/api/api";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Skill } from "@/types/skills";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
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

  const renderSkillItem: ListRenderItem<Skill> = ({ item: skill }) => (
    <TouchableOpacity
      onPress={() => handleSkillSelect(skill)}
      style={styles.skillItem}
    >
      <View className="p-4 border border-outline-200 rounded-lg bg-white">
        <Text className="text-typography-900 font-medium">{skill.name}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyComponent = () => (
    <Text className="text-center text-typography-400 mt-8">
      {searchQuery
        ? "No skills found matching your search"
        : "No available skills"}
    </Text>
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-primary justify-center items-center">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (error || !skills) {
    return (
      <SafeAreaView className="flex-1 bg-primary justify-center items-center">
        <Text>Error: {error?.message || "Failed to fetch skills"}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-primary">
      <VStack space="lg" className="p-[20px] flex-1">
        <VStack space="sm">
          <Text className="text-typography-600">
            Search and select a skill from the list below
          </Text>
        </VStack>

        <Input size="lg" variant="outline">
          <InputField
            placeholder="Search skills..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
        </Input>

        <FlatList
          data={filteredSkills}
          renderItem={renderSkillItem}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={renderEmptyComponent}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.flatListContent}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        />
      </VStack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  skillItem: {
    // marginBottom removed since we're using ItemSeparatorComponent
  },
  flatListContent: {
    paddingVertical: 8,
  },
});
