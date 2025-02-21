import { Controller, type SubmitHandler, useForm } from "react-hook-form";

import ImageSearchIcon from "@mui/icons-material/ImageSearch";
import {
  Box,
  ButtonBase,
  FormHelperText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { Colors } from "@config/styles";
import { TRIP_PREVIEW_IMAGES } from "@features/trip/data";
import DateSelectInput from "@features/ui/form/DateSelectInput";
import useDialog from "@hooks/useDialog";
import { useAppDispatch, useAppSelector } from "@store/index";

import type { Trip } from "../../../../trip/type";
import PreviewImageDialog from "../../../components/PreviewImageDialog";
import {
  nextStep,
  selectWizardTrip,
  setTravelInformation,
} from "../../store/tripWizardSlice";
import Pagination from "../Navigation/Pagination";

export interface FormInput {
  previewImage: Trip["previewImage"];
  name: Trip["name"];
  description: Trip["description"];
  startDate: Trip["startDate"];
  endDate: Trip["endDate"];
}

export default function TravelInfoForm() {
  const { isOpen, close, open } = useDialog(false);

  const {
    handleSubmit,
    onSubmit,
    control,
    register,
    formValues,
    errors,
    onPreviewImageSave,
    previewImageSrc,
  } = useTravelInfoForm({ closePreviewImageDialog: close });

  return (
    <Stack
      component="form"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      sx={{ width: "100%" }}
      gap={3}
    >
      <Stack direction={{ xs: "column", md: "row" }} gap={3}>
        <Stack>
          <ButtonBase
            onClick={open}
            sx={{
              border: 1,
              borderColor: "text.secondary",
              minWidth: { xs: "100%", md: 152 },
              height: 152,
              borderRadius: 4,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              gap: 0.5,
            }}
          >
            {previewImageSrc ? (
              <Box
                component="img"
                src={previewImageSrc}
                alt="Trip Preview"
                sx={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 4,
                  objectFit: "cover",
                }}
              />
            ) : (
              <>
                <ImageSearchIcon sx={{ color: Colors.disabled }} />
                <Typography variant="subtitle1" color={Colors.disabled}>
                  Preview Image
                </Typography>
              </>
            )}
          </ButtonBase>

          {errors.previewImage && (
            <FormHelperText error sx={{ maxWidth: 152 }}>
              {errors.previewImage?.message}
            </FormHelperText>
          )}
          <input
            type="hidden"
            {...register("previewImage", {
              required: "please select a preview image",
            })}
          />
        </Stack>
        <Stack sx={{ width: "100%" }} gap={3}>
          <Controller
            name="name"
            control={control}
            rules={{ required: "Please specify trip name!" }}
            render={({ field: { ref, ...field }, fieldState }) => (
              <TextField
                inputRef={ref}
                margin="normal"
                required
                fullWidth
                id="name"
                label="Trip Name"
                autoFocus
                variant="standard"
                helperText={fieldState.error?.message}
                error={Boolean(fieldState.error)}
                {...field}
              />
            )}
          />
          <Stack direction="row" gap={2}>
            <DateSelectInput
              control={control}
              name="startDate"
              requireErrorText="Please specify start date!"
              maxDate={formValues.endDate}
              label="Start date"
            />
            <DateSelectInput
              control={control}
              name="endDate"
              requireErrorText="Please specify end date!"
              minDate={formValues.startDate}
              label="End date"
            />
          </Stack>
        </Stack>
      </Stack>
      <Controller
        name="description"
        control={control}
        render={({ field: { ref, ...field }, fieldState }) => (
          <TextField
            inputRef={ref}
            margin="normal"
            fullWidth
            id="description"
            label="Description"
            multiline
            maxRows={6}
            inputProps={{ maxLength: 200 }}
            variant="standard"
            helperText={
              fieldState.error?.message ?? `${field.value.length}/200`
            }
            error={Boolean(fieldState.error)}
            {...field}
          />
        )}
      />
      <Pagination />
      <PreviewImageDialog
        isOpen={isOpen}
        onSave={onPreviewImageSave}
        onClose={close}
      />
    </Stack>
  );
}

function useTravelInfoForm({
  closePreviewImageDialog,
}: {
  closePreviewImageDialog: () => void;
}) {
  const dispatch = useAppDispatch();
  const trip = useAppSelector(selectWizardTrip);
  const {
    handleSubmit,
    control,
    watch,
    register,
    setValue,
    formState: { errors },
    trigger,
  } = useForm<FormInput>({
    defaultValues: {
      previewImage: trip.previewImage,
      name: trip.name,
      description: trip.description,
      startDate: trip.startDate,
      endDate: trip.endDate,
    },
  });
  const formValues = watch();
  const previewImageSrc = formValues.previewImage?.templateImageId
    ? TRIP_PREVIEW_IMAGES.find(
        (item) => item.id === formValues.previewImage?.templateImageId,
      )?.src
    : null;

  const onPreviewImageSave = (previewImage: Trip["previewImage"]) => {
    closePreviewImageDialog();
    setValue("previewImage", previewImage);
    trigger("previewImage");
  };

  const onSubmit: SubmitHandler<FormInput> = (data) => {
    dispatch(setTravelInformation(data));
    dispatch(nextStep());
  };
  return {
    handleSubmit,
    onSubmit,
    control,
    formValues,
    register,
    errors,
    previewImageSrc,
    onPreviewImageSave,
  };
}
