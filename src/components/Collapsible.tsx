import { PropsWithChildren, useState } from "react";
import { Pressable } from "react-native";

import { HStack } from "@/components/ui/hstack";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export function Collapsible({
  children,
  title,
  initialIsOpen = false,
}: PropsWithChildren & { title: string; initialIsOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(initialIsOpen);
  const theme = useColorScheme() ?? "light";

  return (
    <VStack>
      <Pressable onPress={() => setIsOpen((value) => !value)}>
        <HStack space="sm" className="items-center gap-1.5">
          <IconSymbol
            name="chevron.right"
            size={18}
            weight="medium"
            color={theme === "light" ? Colors.light.icon : Colors.dark.icon}
            style={{ transform: [{ rotate: isOpen ? "90deg" : "0deg" }] }}
          />
          <Text bold size="sm">
            {title}
          </Text>
        </HStack>
      </Pressable>
      {isOpen && <VStack className="mt-1.5 ml-6">{children}</VStack>}
    </VStack>
  );
}
