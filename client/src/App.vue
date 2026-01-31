<template>
  <ConfigProvider :theme="theme" tag="div">
    <RouterView />
  </ConfigProvider>
</template>
<script setup lang="ts">
import { RouterView } from "vue-router";
import { ConfigProvider, type ConfigProviderTheme } from "vant";
import { ref } from "vue";

const theme = ref<ConfigProviderTheme>("light");
</script>
