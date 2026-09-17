<script setup>
</script>

<template>
  <img :draggable="false" src="../assets/art/WoodenTable.png" alt="background">
</template>

<style scoped>
  img {
    position: fixed;
    z-index: 0;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  #king
  {
    position: absolute;
    top: 30%;
    left: 5%;
    width: 50%;
    height: 65%;
    z-index: 11;
  }
</style>