import { HStack } from "@/components/ui/hstack";
import { CalendarDaysIcon, Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { getBlockoutStatus } from "@/utils/blockout-permissions";
import { formatBlockoutTime, getBlockoutDuration } from "@/utils/date";
import { useRouter } from "expo-router";
import { RefreshCw } from "lucide-react-native";
import moment from "moment-timezone";
import { Alert, TouchableOpacity } from "react-native";

interface BlockoutCardProps {
  blockout: any;
  onPress?: () => void;
}

export function BlockoutCard({ blockout, onPress }: BlockoutCardProps) {
  const status = getBlockoutStatus(blockout);
  const router = useRouter();

  return (
    <TouchableOpacity
      className={`mx-4 mb-2 p-4 bg-white rounded-xl border border-[#5DE0E6] shadow-sm ${
        !status.canEdit ? "opacity-60" : ""
      }`}
      activeOpacity={status.canEdit ? 0.7 : 1}
      onPress={() => {
        if (onPress) {
          onPress();
          return;
        }

        if (status.canEdit) {
          router.push({
            pathname: "/(tabs)/schedule/[id]/edit",
            params: {
              id: blockout.blockout_id.toString(),
            },
          });
        } else {
          Alert.alert(
            "Cannot Edit",
            "This blockout cannot be edited because it has already ended. Blockouts can only be edited if their end time is in the future.",
            [{ text: "OK" }]
          );
        }
      }}
    >
      <HStack space="md" className="items-center relative">
        <VStack className="w-14 h-14 justify-center items-center">
          <Icon as={CalendarDaysIcon} className="h-full w-10" />
        </VStack>

        <VStack space="xs" className="flex-1">
          <HStack className="items-center justify-between">
            <Text size="lg" bold className="text-typography-900">
              {blockout.title}
            </Text>
            {/* Multi-day badge */}
            {(() => {
              const start = moment.utc(blockout.start_time).local();
              const end = moment.utc(blockout.end_time).local();
              const isMultiDay = !start.isSame(end, "day");

              if (isMultiDay) {
                return (
                  <VStack className="bg-primary-100 px-2 py-1 rounded-full">
                    <Text size="xs" className="text-primary-700 font-medium">
                      Multi-day
                    </Text>
                  </VStack>
                );
              }
              return null;
            })()}
          </HStack>

          <HStack space="sm" className="flex-wrap">
            <Text size="sm" className="text-typography-500">
              {formatBlockoutTime(blockout)}
            </Text>
            <Text size="sm" className="text-typography-500">
              • {getBlockoutDuration(blockout)}
            </Text>
          </HStack>

          {blockout.original_blockout.description && (
            <Text
              size="sm"
              className="text-typography-700"
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {blockout.original_blockout.description}
            </Text>
          )}

          {/* Show status indicator only for ended blockouts */}
          {!status.canEdit && (
            <HStack className="items-center justify-between mt-2">
              <Text className="text-xs text-gray-500">Ended - View Only</Text>
            </HStack>
          )}
        </VStack>

        {/* Recurring icon in bottom right */}
        {blockout.original_blockout.rrule && (
          <VStack className="absolute bottom-0 right-0">
            <Icon as={RefreshCw} size="sm" />
          </VStack>
        )}
      </HStack>
    </TouchableOpacity>
  );
}
