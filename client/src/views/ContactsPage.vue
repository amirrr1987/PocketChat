<template>
  <div>
    <CellGroup title="Contacts" />
    <ContactList v-model:model-value="selectedContact" :list="contactList" />
  </div>
</template>

<script setup lang="ts">
import { CellGroup, ContactList, type ContactListItem } from 'vant'
import { ref } from 'vue'

const contactList = ref<ContactListItem[]>(
  Array.from({ length: 20 }, (_, i) => ({
    id: (i + 1).toString(),
    name: `Contact ${i + 1}`,
    tel: `123-456-78${(i + 10).toString().slice(-2)}`,
  })),
)
const selectedContact = ref<ContactListItem | null>(null)
</script>
