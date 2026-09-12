<template>
  <view class="hero">
    <text class="hero-kicker">● 长篇小说创作工作台</text>
    <text class="hero-title">星河创作</text>
    <text class="hero-lead">从灵感、设定到章节正文，让人物、世界观与伏笔始终沿着同一条叙事线生长。</text>
    <view class="hero-actions">
      <button class="primary-button hero-start" @tap="emit('start')">
        {{ bound ? "进入我的创作" : "绑定账号开始创作" }} →
      </button>
      <button class="text-button hero-learn" @tap="emit('learn')">了解创作能力</button>
    </view>
    <view class="hero-proof">
      <view v-for="item in highlights" :key="item.title" class="hero-proof__item">
        <text class="hero-proof__title">{{ item.title }}</text>
        <text class="hero-proof__description">{{ item.description }}</text>
      </view>
    </view>
    <EditorPreview />
  </view>
</template>

<script setup lang="ts">
import { highlights } from "@/mocks/home";
import EditorPreview from "./EditorPreview.vue";

defineProps<{ bound: boolean }>();
const emit = defineEmits<{ start: []; learn: [] }>();
</script>

<style lang="scss" scoped>
.hero {
  display: flex;
  flex-direction: column;
  gap: 28rpx;
  padding: 20rpx 12rpx 0;

  .hero-kicker {
    align-self: flex-start;
    padding: 10rpx 22rpx;
    font-size: 22rpx;
    font-weight: 600;
    color: var(--accent);
    letter-spacing: 1rpx;
    background: var(--accent-wash);
    border-radius: 999rpx;
  }

  .hero-title {
    margin-top: 4rpx;
    font-size: 88rpx;
    font-weight: 750;
    line-height: 1.1;
    letter-spacing: -4rpx;
  }

  .hero-lead {
    font-size: 28rpx;
    line-height: 1.7;
    color: var(--ink-muted);
  }

  .hero-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
    align-items: center;
  }

  .hero-start {
    width: auto;
    padding-right: 26rpx;
    padding-left: 26rpx;
    font-size: 28rpx;
  }

  .hero-learn {
    font-size: 24rpx;
  }

  .hero-proof {
    display: flex;
    gap: 16rpx;
    padding: 24rpx 8rpx 4rpx;
    margin-top: 12rpx;
    border-top: 1px solid var(--line);
  }

  .hero-proof__item {
    flex: 1;
    min-width: 0;
  }

  .hero-proof__title {
    display: block;
    font-size: 24rpx;
    font-weight: 700;
  }

  .hero-proof__description {
    display: block;
    margin-top: 4rpx;
    font-size: 21rpx;
    line-height: 1.45;
    color: var(--ink-soft);
  }
}
</style>
