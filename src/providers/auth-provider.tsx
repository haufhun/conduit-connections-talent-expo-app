import { Button, ButtonText } from "@/components/ui/button";
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/modal";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Session } from "@supabase/supabase-js";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { supabase } from "../lib/supabase";

type AuthData = {
  session: Session | null;
  mounting: boolean;
};

const AuthContext = createContext<AuthData>({
  session: null,
  mounting: true,
});

export default function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [mounting, setMounting] = useState(true);
  const [isIncorrectUserType, setIsIncorrectUserType] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setSession(session);
      setMounting(false);
    };

    fetchSession();
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        if (session?.user.app_metadata.user_type !== "TALENT") {
          supabase.auth.signOut();

          setIsIncorrectUserType(true);

          return;
        }
      }

      setSession(session);
    });
  }, []);

  return (
    <AuthContext.Provider value={{ session, mounting }}>
      <Modal
        isOpen={isIncorrectUserType}
        onClose={() => {
          setIsIncorrectUserType(false);
        }}
        size="lg"
      >
        <ModalBackdrop />
        <ModalContent className="border-2 border-red-500 bg-red-50">
          <ModalHeader className="bg-red-100 border-b border-red-200">
            <Text size="lg" bold className="text-red-700">
              ⚠️ Invalid Login Attempt
            </Text>
          </ModalHeader>
          <ModalBody className="bg-red-50">
            <VStack space="md">
              <Text className="text-red-800">
                This app is strictly for talent users. Please use the web app
                for organizer features at https://app.conduitconnections.com.
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter className="bg-red-50 border-t border-red-200">
            <Button
              action="negative"
              onPress={() => {
                setIsIncorrectUserType(false);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              <ButtonText className="text-white">Understood</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
