import { deleteObject, ref, uploadBytesResumable } from "firebase/storage";
import { useEffect, useState } from "react";

import { selectUser } from "@features/auth/store/authSlice";
import { DocumentToUpload, TripFile } from "@features/trip/type";
import useToast from "@hooks/useToast";
import { useAppSelector } from "@store/index";

import { storage } from "../firebase";

interface Props {
  onAllUploadSuccess: (uploadedFiles: TripFile[]) => void;
}

interface State {
  upLoadProgresses: (number | undefined)[];
  upLoadErrors: string[];
  upLoadedFiles: TripFile[];
  totalFiles: number;
  isLoading: boolean;
  uploadedFilesCount: number;
  removingFilePath: null | string;
}

const defaultState: State = {
  upLoadProgresses: [],
  upLoadErrors: [],
  upLoadedFiles: [],
  totalFiles: 0,
  uploadedFilesCount: 0,
  isLoading: false,
  removingFilePath: null,
};

export function useStorage({ onAllUploadSuccess }: Props) {
  const user = useAppSelector(selectUser);
  const { showErrorMessage } = useToast();
  const [state, setState] = useState<State>(defaultState);

  useEffect(() => {
    if (state.totalFiles > 0 && state.uploadedFilesCount === state.totalFiles) {
      setState((prevState) => {
        return { ...prevState, isLoading: false };
      });
      onAllUploadSuccess(state.upLoadedFiles);
    } else if (
      state.totalFiles > 0 &&
      state.uploadedFilesCount + state.upLoadErrors.filter(Boolean).length ===
        state.totalFiles
    ) {
      setState((prevState) => {
        return { ...prevState, isLoading: false };
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.totalFiles,
    state.upLoadErrors.length,
    state.upLoadedFiles,
    state.uploadedFilesCount,
  ]);

  const uploadFiles = (path: string, files: (DocumentToUpload | null)[]) => {
    setState(defaultState);
    files.forEach((file, index) => {
      setState((prevState) => {
        return {
          ...prevState,
          totalFiles: files.length,
          isLoading: true,
        };
      });
      if (file?.storagePath) {
        setState((prevState) => {
          const newUploadedFiles = [...prevState.upLoadedFiles];
          newUploadedFiles[index] = file;
          return {
            ...prevState,
            upLoadedFiles: newUploadedFiles,
            uploadedFilesCount: ++prevState.uploadedFilesCount,
          };
        });
        return;
      }
      if (!file?.file) {
        setState((prevState) => {
          const newErrors = [...prevState.upLoadErrors];
          newErrors[index] = `We are unable to get the file to upload it`;
          return {
            ...prevState,
            upLoadErrors: newErrors,
          };
        });
        return;
      }
      const storageRef = ref(
        storage,
        `user-data/${user?.uid}/${path}/${file.fileName}`,
      );
      const uploadTask = uploadBytesResumable(storageRef, file.file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const newProgress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setState((prevState) => {
            const newProgresses = [...prevState.upLoadProgresses];
            newProgresses[index] = newProgress;
            return {
              ...prevState,
              upLoadProgresses: newProgresses,
            };
          });
        },
        (error) => {
          setState((prevState) => {
            const newProgresses = [...prevState.upLoadProgresses];
            newProgresses[index] = undefined;
            const newErrors = [...prevState.upLoadErrors];
            newErrors[index] = `Something went wrong: ${error.message}`;
            return {
              ...prevState,
              upLoadProgresses: newProgresses,
              upLoadErrors: newErrors,
            };
          });
        },
        () => {
          setState((prevState) => {
            const newProgresses = [...prevState.upLoadProgresses];
            newProgresses[index] = undefined;
            const newUploadedFiles = [...prevState.upLoadedFiles];
            newUploadedFiles[index] = {
              fileName: file.fileName,
              storagePath: uploadTask.snapshot.ref.fullPath,
            };
            return {
              ...prevState,
              upLoadedFiles: newUploadedFiles,
              upLoadProgresses: newProgresses,
              uploadedFilesCount: ++prevState.uploadedFilesCount,
            };
          });
        },
      );
    });
  };

  const removeFile = async (storagePath: string) => {
    const fileRef = ref(storage, storagePath);
    setState((prevState) => {
      return {
        ...prevState,
        removingFilePath: storagePath,
      };
    });
    try {
      await deleteObject(fileRef);
      return true;
      // setState((prevState) => {
      //   const changedFiles = [...prevState.upLoadedFiles];
      //   changedFiles.filter((file) => file.storagePath != storagePath);
      //   return {
      //     ...prevState,
      //     upLoadedFiles: changedFiles,
      //     uploadedFilesCount: --prevState.uploadedFilesCount,
      //   };
      // });
    } catch (error) {
      showErrorMessage(
        "Failed to remove file. Please try again later or contact support!",
      );
    } finally {
      setState((prevState) => {
        return {
          ...prevState,
          removingFilePath: null,
        };
      });
    }
    return false;
  };

  return { removeFile, uploadFiles, ...state };
}
