<template>
  <ion-app>
    <ion-router-outlet />
    <PwaUpdatePrompt />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from "@ionic/vue";
import PwaUpdatePrompt from "@/components/PwaUpdatePrompt.vue";
</script>
