<template>
  <div>
    <NavBar title="PocketChat" fixed placeholder />
    <NoticeBar left-icon="volume-o" :scrollable="false">
      Stay connected, anywhere.
    </NoticeBar>
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { NavBar, NoticeBar } from 'vant'
import { RouterView } from 'vue-router'
</script>
