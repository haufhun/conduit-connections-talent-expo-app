import { useGetSkills, useGetUserTalentSkills } from "@/api/api";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Skill } from "@/types/skills";
import nlp from "compromise";
import { useRouter } from "expo-router";
import { ChevronRightIcon, SearchIcon } from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
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
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  // Debounce search input
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      setDebouncedSearchQuery(text);
    }, 300);
  };

  const { data: skills, error, isLoading } = useGetSkills();
  const { data: userSkills } = useGetUserTalentSkills();

  // Memoize processed skill names for performance, cache root word processing
  const processedSkills = useMemo(() => {
    if (!skills) return [];
    const rootWordCache: Record<string, string> = {};
    return skills.map((skill) => {
      const skillWords = skill.name
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter((word) => word.length > 0);

      const rootSkillWords = skillWords.map((word) => {
        if (rootWordCache[word]) {
          return rootWordCache[word];
        }
        const doc = nlp(word);
        const root = doc.verbs().toInfinitive().text() || doc.text();
        rootWordCache[word] = root;
        return root;
      });

      return {
        ...skill,
        rootSkillWords,
      };
    });
  }, [skills]);

  const filteredSkills = useMemo(() => {
    if (!processedSkills) return [];

    // If no search query, return all skills not already added
    if (!debouncedSearchQuery.trim()) {
      return processedSkills.filter(
        (skill) =>
          !userSkills?.some((userSkill) => userSkill.skill_id === skill.id)
      );
    }

    // Split search query into words, remove punctuation, and get root form
    const searchWords = debouncedSearchQuery
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 0)
      .map((word) => {
        const doc = nlp(word);
        return doc.verbs().toInfinitive().text() || doc.text();
      });

    return processedSkills.filter((skill) => {
      // Skip if user already has this skill
      if (userSkills?.some((userSkill) => userSkill.skill_id === skill.id)) {
        return false;
      }

      // Check if all search words have a match in the root skill words
      return searchWords.every((searchWord) =>
        skill.rootSkillWords.some(
          (skillWord) =>
            skillWord.includes(searchWord) || searchWord.includes(skillWord)
        )
      );
    });
  }, [processedSkills, userSkills, debouncedSearchQuery]);

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
                onChangeText={handleSearchChange}
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
