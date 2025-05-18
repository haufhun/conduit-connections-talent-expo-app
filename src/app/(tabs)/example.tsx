// App.tsx

import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { useState } from "react";
import { SafeAreaView } from "react-native";

export default function App() {
  const [colorMode, setColorMode] = useState<"light" | "dark">("light");

  return (
    <SafeAreaView>
      <GluestackUIProvider mode={colorMode}>
        <Box className="bg-primary flex-1">
          <Button
            onPress={() => {
              setColorMode(colorMode === "light" ? "dark" : "light");
            }}
          >
            <ButtonText>Toggle color mode</ButtonText>
          </Button>
        </Box>
      </GluestackUIProvider>
    </SafeAreaView>
  );
}
