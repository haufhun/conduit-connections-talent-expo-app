import {
  useDeleteTalentBlockout,
  useGetTalentBlockoutById,
  useUpdateTalentBlockout,
} from "@/api/blockouts_api";
import { RecurringScheduleForm } from "@/components/schedule/RecurringScheduleForm";
import {
  Button,
  ButtonIcon,
  ButtonSpinner,
  ButtonText,
} from "@/components/ui/button";
import {
  Checkbox,
  CheckboxIcon,
  CheckboxIndicator,
  CheckboxLabel,
} from "@/components/ui/checkbox";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { AlertCircleIcon, CheckIcon } from "@/components/ui/icon";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { VStack } from "@/components/ui/vstack";
import { UpdateTalentBlockout } from "@/types/blockouts";
import { canEditBlockout } from "@/utils/blockout-permissions";
import { getDayjsFromUtcDateString } from "@/utils/date";
import { updateBlockoutSchema } from "@/validators/blockouts.validators";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Trash2 } from "lucide-react-native";
import { useCallback, useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Enable timezone plugins
dayjs.extend(utc);
dayjs.extend(timezone);

export default function EditBlockoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string;
  }>();

  const blockoutId = params.id ? parseInt(params.id) : 0;

  const {
    data: blockout,
    isLoading,
    error,
  } = useGetTalentBlockoutById(blockoutId, !!blockoutId);
  const { mutateAsync: updateBlockout } = useUpdateTalentBlockout();
  const { mutateAsync: deleteBlockout, isPending } = useDeleteTalentBlockout();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(updateBlockoutSchema),
    defaultValues: {
      title: "",
      description: "",
      start_time: dayjs.utc().startOf("hour").add(1, "hour").toISOString(),
      end_time: dayjs.utc().startOf("hour").add(2, "hour").toISOString(),
      is_all_day: false,
      is_recurring: false,
      rrule: "",
    },
  });

  // Update form when blockout data is loaded
  useEffect(() => {
    if (blockout) {
      reset({
        title: blockout.title,
        description: blockout.description || "",
        start_time: getDayjsFromUtcDateString(
          blockout.start_time
        ).toISOString(),
        end_time: getDayjsFromUtcDateString(blockout.end_time).toISOString(),
        is_all_day: blockout.is_all_day,
        is_recurring: blockout.is_recurring,
        rrule: blockout.rrule || "",
      });
    }
  }, [blockout, reset]);

  const deleteButton = () => (
    <Button
      size="md"
      variant="link"
      action="negative"
      onPress={() => {
        Alert.alert(
          "Delete Blockout",
          "Are you sure you want to delete this blockout? This action cannot be undone.",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Delete",
              style: "destructive",
              onPress: async () => {
                await deleteBlockout(blockoutId);
                router.back();
              },
            },
          ]
        );
      }}
      className="mr-2"
    >
      {isPending ? <ButtonSpinner /> : <ButtonIcon as={Trash2} />}
    </Button>
  );

  // Check if blockout can be edited (end time must be in the future)
  const canEdit = blockout ? canEditBlockout(blockout) : false;

  const isAllDay = watch("is_all_day");
  const isRecurring = watch("is_recurring");
  const startTime = watch("start_time");
  const endTime = watch("end_time");

  useEffect(() => {
    if (isAllDay) {
      const currentStartTime = getDayjsFromUtcDateString(
        startTime ?? new Date().toISOString()
      );
      const currentEndTime = getDayjsFromUtcDateString(
        endTime ?? new Date().toISOString()
      );

      const startOfDay = currentStartTime.startOf("day");
      const endOfDay = currentEndTime.endOf("day");
      setValue("start_time", startOfDay.utc().toISOString());
      setValue("end_time", endOfDay.utc().toISOString());
    }
  }, [isAllDay, startTime, endTime, setValue]);

  // Memoized callback to prevent infinite re-renders
  const handleRRuleChange = useCallback(
    (rrule: string) => setValue("rrule", rrule),
    [setValue]
  );

  // Memoized startDate to prevent infinite re-renders in RecurringScheduleForm
  const memoizedStartDate = useMemo(
    () =>
      getDayjsFromUtcDateString(startTime || new Date().toISOString()).toDate(),
    [startTime]
  );

  // Handle loading and error states
  if (isLoading) {
    return (
      <SafeAreaView edges={["bottom"]} className="flex-1 bg-primary">
        <VStack className="flex-1 justify-center items-center p-[20px]">
          <Text className="text-typography-600">
            Loading blockout details...
          </Text>
        </VStack>
      </SafeAreaView>
    );
  }

  if (error || !blockout) {
    return (
      <SafeAreaView edges={["bottom"]} className="flex-1 bg-primary">
        <VStack
          className="flex-1 justify-center items-center p-[20px]"
          space="md"
        >
          <Text className="text-typography-600">
            Error loading blockout details
          </Text>
          <Button onPress={() => router.back()}>
            <ButtonText>Go Back</ButtonText>
          </Button>
        </VStack>
      </SafeAreaView>
    );
  }

  // Check if blockout can be edited
  if (!canEdit) {
    return (
      <SafeAreaView edges={["bottom"]} className="flex-1 bg-primary pb-[50px]">
        <VStack
          className="flex-1 justify-center items-center p-[20px]"
          space="md"
        >
          <Text className="text-typography-600 text-center">
            This blockout cannot be edited because it has already ended.
          </Text>
          <Text className="text-typography-500 text-center text-sm">
            Blockouts can only be edited if their end time is in the future.
          </Text>
          <Button onPress={() => router.back()}>
            <ButtonText>Go Back</ButtonText>
          </Button>
        </VStack>
      </SafeAreaView>
    );
  }

  const onSubmit = async (data: UpdateTalentBlockout) => {
    try {
      if (!blockoutId) {
        Alert.alert("Error", "Blockout ID is missing");
        return;
      }

      await updateBlockout({
        blockoutId,
        updates: {
          title: data.title,
          description: data.description || undefined,
          start_time: data.start_time,
          end_time: data.end_time,
          is_all_day: data.is_all_day || false,
          is_recurring: data.is_recurring || false,
          rrule: data.is_recurring ? data.rrule : undefined,
        },
      });

      router.back();
    } catch (error) {
      console.error("Error updating blockout:", error);
      Alert.alert("Error", "Failed to update blockout");
    }
  };

  return (
    <>
      <SafeAreaView edges={["bottom"]} className="flex-1 bg-primary pb-[50px]">
        <Stack.Screen
          options={{
            title: "Edit Blockout",
            headerRight: canEdit ? deleteButton : undefined,
          }}
        />

        <ScrollView className="flex-1">
          <VStack space="lg" className="p-[20px]">
            <VStack space="sm">
              <Text className="text-typography-600">
                Update your blockout details
              </Text>
            </VStack>
            <Controller
              control={control}
              name="title"
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
                <FormControl isInvalid={Boolean(error)}>
                  <FormControlLabel>
                    <FormControlLabelText>Title</FormControlLabelText>
                  </FormControlLabel>
                  <Input size="lg" variant="outline">
                    <InputField
                      placeholder="Enter blockout title..."
                      value={value}
                      onChangeText={onChange}
                    />
                  </Input>
                  <FormControlError>
                    <FormControlErrorIcon as={AlertCircleIcon} />
                    <FormControlErrorText size="sm">
                      {error?.message}
                    </FormControlErrorText>
                  </FormControlError>
                </FormControl>
              )}
            />

            <Controller
              control={control}
              name="description"
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
                <FormControl isInvalid={Boolean(error)}>
                  <FormControlLabel>
                    <FormControlLabelText>Description</FormControlLabelText>
                  </FormControlLabel>
                  <Textarea size="lg" className="min-h-[100px]">
                    <TextareaInput
                      placeholder="Add a description (optional)..."
                      value={value ?? ""}
                      onChangeText={onChange}
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                    />
                  </Textarea>
                  <FormControlError>
                    <FormControlErrorIcon as={AlertCircleIcon} />
                    <FormControlErrorText size="sm">
                      {error?.message}
                    </FormControlErrorText>
                  </FormControlError>
                </FormControl>
              )}
            />

            <Controller
              control={control}
              name="is_all_day"
              render={({ field: { value, onChange } }) => (
                <FormControl>
                  <Checkbox
                    size="md"
                    value="all_day"
                    isChecked={value}
                    onChange={onChange}
                    aria-label="All day event"
                  >
                    <CheckboxIndicator>
                      <CheckboxIcon as={CheckIcon} />
                    </CheckboxIndicator>
                    <CheckboxLabel>All Day</CheckboxLabel>
                  </Checkbox>
                </FormControl>
              )}
            />

            <DateRangePicker
              control={control}
              setValue={setValue}
              startTimeFieldName="start_time"
              endTimeFieldName="end_time"
              isAllDay={isAllDay}
            />

            <Controller
              control={control}
              name="is_recurring"
              render={({ field: { value, onChange } }) => (
                <FormControl>
                  <Checkbox
                    size="md"
                    value="recurring"
                    isChecked={value}
                    onChange={onChange}
                    aria-label="Recurring event"
                  >
                    <CheckboxIndicator>
                      <CheckboxIcon as={CheckIcon} />
                    </CheckboxIndicator>
                    <CheckboxLabel>Recurring</CheckboxLabel>
                  </Checkbox>
                </FormControl>
              )}
            />

            {isRecurring && (
              <RecurringScheduleForm
                startDate={memoizedStartDate}
                onRRuleChange={handleRRuleChange}
                initialRRule={watch("rrule") || ""}
              />
            )}

            <Button
              size="lg"
              variant="solid"
              action="primary"
              onPress={handleSubmit(onSubmit)}
              isDisabled={isSubmitting}
            >
              <ButtonText>
                {isSubmitting ? "Updating..." : "Update Blockout"}
              </ButtonText>
            </Button>
          </VStack>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
