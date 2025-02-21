import CloseIcon from "@mui/icons-material/Close";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import {
  Box,
  CircularProgress,
  IconButton,
  Link,
  Stack,
  Typography,
} from "@mui/material";

interface Props {
  url?: string | null;
  name: string;
  onRemoveClick: () => void;
  uploadProgress: number | undefined;
  isRemoving: boolean;
}

export default function DocumentCard({
  url,
  name,
  onRemoveClick,
  uploadProgress,
  isRemoving,
}: Props) {
  return (
    <Box
      sx={{
        position: "relative",
        borderRadius: 4,
        borderColor: "grey.200",
        border: 1,
        width: { xs: 170, md: 200 },
        height: "100%",
      }}
    >
      {uploadProgress != undefined && (
        <CircularProgress
          variant="determinate"
          value={uploadProgress}
          sx={{
            position: "absolute",
            top: "calc(50% - 1.25rem)",
            left: "calc(50% - 1.25rem)",
          }}
        />
      )}
      <IconButton
        onClick={onRemoveClick}
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          opacity: uploadProgress ? 0.2 : 1,
        }}
        disabled={isRemoving}
      >
        {isRemoving ? <CircularProgress size={24} /> : <CloseIcon />}
      </IconButton>
      <Stack
        href={isRemoving ? " " : url ?? "#"}
        component={Link}
        target={isRemoving ? "_self" : "_blank"}
        rel="noopener noreferrer"
        gap={2}
        sx={{
          width: "100%",
          height: "100%",
          p: 2,
          pt: 6,
          textDecoration: "none",
          opacity: uploadProgress ? 0.2 : 1,
        }}
      >
        <Stack gap={2}>
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{
              width: "100%",
              height: { xs: 148, md: 133 },
              bgcolor: "grey.100",
              borderRadius: 4,
            }}
          >
            <InsertDriveFileIcon sx={{ color: "text.secondary" }} />
          </Stack>
          <Typography
            color="text.primary"
            sx={{
              overflow: "hidden",
              display: "-webkit-box",
              "-webkit-line-clamp": "1",
              lineClamp: "1",
              "-webkit-box-orient": "vertical",
            }}
          >
            {name}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}
