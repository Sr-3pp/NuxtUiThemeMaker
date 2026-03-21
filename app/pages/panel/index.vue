<script setup lang="ts">
definePageMeta({
  middleware: ['panel-admin'],
})
</script>

<template>
    <div class="container py-12">
        <nav>
            <ul>
                <li>
                    <NuxtLink
                        href="/panel/users"
                        class="text-blue-500 hover:underline"
                    >
                        Manage Users
                    </NuxtLink>
                </li>
            </ul>
        </nav>
        <h2>
            Welcome to admin Panel
        </h2>
    </div>
</template>
