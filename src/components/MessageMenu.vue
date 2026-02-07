<template>
  <ion-action-sheet
    :is-open="isOpen"
    :header="header"
    :buttons="actionButtons"
    @didDismiss="handleDismiss"
  ></ion-action-sheet>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { IonActionSheet } from "@ionic/vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

export interface MessageMenuOptions {
  canEdit: boolean;
  canDelete: boolean;
  canReply: boolean;
  canForward: boolean;
  canCopy: boolean;
  canReact: boolean;
}

const props = defineProps<{
  isOpen: boolean;
  header?: string;
  options: MessageMenuOptions;
}>();

const emit = defineEmits<{
  (e: "dismiss"): void;
  (e: "reply"): void;
  (e: "edit"): void;
  (e: "delete"): void;
  (e: "copy"): void;
  (e: "forward"): void;
  (e: "react"): void;
}>();

const actionButtons = computed(() => {
  const buttons: Array<{
    text: string;
    role?: string;
    handler?: () => void;
  }> = [];

  if (props.options.canReply) {
    buttons.push({
      text: t("chat.replyMessage"),
      handler: () => emit("reply"),
    });
  }

  if (props.options.canReact) {
    buttons.push({
      text: t("chat.react"),
      handler: () => emit("react"),
    });
  }

  if (props.options.canCopy) {
    buttons.push({
      text: t("chat.copyText"),
      handler: () => emit("copy"),
    });
  }

  if (props.options.canForward) {
    buttons.push({
      text: t("chat.forward"),
      handler: () => emit("forward"),
    });
  }

  if (props.options.canEdit) {
    buttons.push({
      text: t("chat.editMessage"),
      handler: () => emit("edit"),
    });
  }

  if (props.options.canDelete) {
    buttons.push({
      text: t("chat.deleteMessage"),
      role: "destructive",
      handler: () => emit("delete"),
    });
  }

  buttons.push({
    text: t("chat.cancel"),
    role: "cancel",
  });

  return buttons;
});

function handleDismiss() {
  emit("dismiss");
}
</script>
