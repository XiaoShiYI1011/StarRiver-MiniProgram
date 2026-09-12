<template>
  <view class="novel-card">
    <image v-if="novel.cover" class="novel-cover" :src="novel.cover" mode="aspectFill" />
    <view v-else class="novel-cover novel-cover--text">
      雨落
      <text>长街</text>
    </view>
    <view class="novel-info">
      <text class="novel-title">{{ novel.title }}</text>
      <text class="novel-genre">{{ novel.genre }}</text>
      <text class="novel-stats">{{ novel.chapters }} 章 · {{ novel.words }}字</text>
      <text class="novel-date">最近更新 {{ novel.updatedAt }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { Novel } from "@/types/studio";

defineProps<{ novel: Novel }>();
</script>

<style lang="scss" scoped>
.novel-card {
  display: flex;
  gap: 28rpx;
  padding: 28rpx;
  background: var(--paper-raised);
  border: 1px solid var(--line);
  border-radius: 36rpx;

  .novel-cover {
    flex-shrink: 0;
    width: 140rpx;
    height: 190rpx;
    border-radius: 16rpx;
  }

  .novel-cover--text {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-family: STSong, serif;
    font-size: 38rpx;
    color: #e8ede9;
    background: linear-gradient(145deg, #677e75, #253b35);
  }

  .novel-info {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 12rpx;
    min-width: 0;
    padding: 10rpx 0;
  }

  .novel-title {
    font-size: 32rpx;
    font-weight: 700;
  }

  .novel-genre,
  .novel-stats {
    font-size: 24rpx;
    color: var(--ink-soft);
  }

  .novel-date {
    margin-top: auto;
    font-size: 21rpx;
    color: var(--ink-faint);
  }
}
</style>
