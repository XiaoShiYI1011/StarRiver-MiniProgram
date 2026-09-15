<template>
  <view class="faq-list">
    <view v-for="(item, index) in faqs" :key="item.question" class="faq">
      <button class="faq-question" :aria-expanded="opened === index" @tap="opened = opened === index ? -1 : index">
        <text>{{ item.question }}</text>
        <text class="faq-toggle">{{ opened === index ? "−" : "+" }}</text>
      </button>
      <text v-if="opened === index" class="faq-answer">{{ item.answer }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { faqs } from "@/content/home";

const opened = ref(-1);
</script>

<style lang="scss" scoped>
.faq-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;

  .faq {
    background: var(--paper-raised);
    border: 1px solid var(--line);
    border-radius: 28rpx;
  }

  .faq-question {
    display: flex;
    gap: 16rpx;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 28rpx;
    margin: 0;
    font-size: 26rpx;
    font-weight: 600;
    line-height: 1.5;
    color: var(--ink);
    text-align: left;
    background: transparent;
  }

  .faq-question::after {
    border: 0;
  }

  .faq-toggle {
    flex-shrink: 0;
    font-size: 36rpx;
    font-weight: 400;
    color: var(--accent);
  }

  .faq-answer {
    display: block;
    padding: 0 28rpx 28rpx;
    font-size: 24rpx;
    color: var(--ink-soft);
  }
}
</style>
