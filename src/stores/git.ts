import { defineStore } from "pinia";
import { useProjectStore } from "./project";
import { invoke } from "@tauri-apps/api/core";
import { ChangedFile } from "~/types";

export enum GitStatus {
  Modify = "modify",
  Delete = "delete",
  Untracked = "untracked",
  None = "none",
}

export const useGitStore = defineStore("useGitStore", () => {
  const projectStore = useProjectStore();
  const changedFiles = ref<ChangedFile[]>([]);

  watch(
    () => projectStore.selectProjectName,
    async (name) => {
      if (name) {
        const data = await getChangedFiles(name);
        changedFiles.value = handleChangeFiles(data);
      }
    },
    {
      immediate: true,
    }
  );

  async function getChangedFiles(name: string) {
    const data: string[] = await invoke("git_status", {
      name,
    });
    return data;
  }

  return { changedFiles };
});

export function handleChangeFiles(data: string[]): ChangedFile[] {
  return data.map((str) => {
    const [status, path] = str.split("###");
    const name = path.split("/").pop();
    return {
      status,
      path,
      name,
    } as ChangedFile;
  });
}
